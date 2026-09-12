// Download an image artifact through NotebookLM's own visible download control.
//
// Fallback for when nblm-export-image-artifact.cjs cannot recover the bytes: the
// viewer renders the artifact as a document we can stream, but if that image element
// never loads (observed 2026-09-13: viewer opened with a blank canvas and no <img>),
// there is nothing to stream. The skill's documented order is page-assets first, then a
// real download event from the visible control, so this is that second path.
//
// Usage: LAG_CDP_PORT=9222 node nblm-export-image-download.cjs "<card title fragment>" <out-dir> [--timeout-sec=180]
const fs = require('fs');
const path = require('path');
const port = process.env.LAG_CDP_PORT || '9222';
const cardTitle = process.argv[2];
const outDir = process.argv[3];
const timeoutSec = Number((process.argv.find((a) => a.startsWith('--timeout-sec=')) || '').split('=')[1] || 180);

if (!cardTitle || !outDir) {
  console.error('usage: node nblm-export-image-download.cjs "<card title fragment>" <out-dir> [--timeout-sec=180]');
  process.exit(2);
}
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = list.find((t) => t.type === 'page' && t.url.includes('notebook.google.com'));
  if (!page) { console.error('NO_PAGE_TARGET'); process.exit(1); }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res);
    ws.addEventListener('error', rej);
    setTimeout(() => rej(new Error('ws open timeout')), 15000);
  });
  let id = 0;
  const pending = new Map();
  const send = (method, params = {}, t = 60000) => new Promise((resolve, reject) => {
    const msgId = ++id;
    const timer = setTimeout(() => { pending.delete(msgId); reject(new Error('cdp timeout ' + method)); }, t);
    pending.set(msgId, { resolve, reject, timer });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
  ws.addEventListener('message', (ev) => {
    let msg;
    try { msg = JSON.parse(typeof ev.data === 'string' ? ev.data : Buffer.from(ev.data).toString()); } catch { return; }
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      clearTimeout(p.timer);
      if (msg.error) p.reject(new Error(msg.error.message)); else p.resolve(msg.result);
    }
  });
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error('page eval failed: ' + (r.exceptionDetails.text || ''));
    return r.result.value;
  };

  await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: path.resolve(outDir), eventsEnabled: true });

  // leave any open viewer, then open the card's ⋮ menu and choose 下载
  const clicked = await evaluate(`(async () => {
    const txt = (e) => (e && e.textContent || '').replace(/\\s+/g,' ').trim();
    for (const sel of ['关闭网页查看器', '关闭', 'close']) {
      const b = [...document.querySelectorAll('button,[role=button]')]
        .find(x => new RegExp(sel).test((x.getAttribute('aria-label')||'').trim()));
      if (b) { b.click(); await new Promise(r => setTimeout(r, 2500)); break; }
    }
    const panel = document.querySelector('studio-panel');
    if (!panel) return 'no studio panel';
    const card = [...panel.querySelectorAll('[class*=artifact-item]')]
      .find(e => txt(e).includes(${JSON.stringify(cardTitle)}));
    if (!card) return 'card not found';
    const more = card.querySelector('button[aria-label*="更多"]')
      || [...card.querySelectorAll('button')].find(b => /more_vert/.test(txt(b)));
    if (!more) return 'no card menu';
    more.click();
    await new Promise(r => setTimeout(r, 2500));
    const item = [...document.querySelectorAll('[role=menuitem],.mdc-menu-item,.mat-mdc-menu-item')]
      .find(e => /下载|download/i.test(txt(e)));
    if (!item) return 'no download menu item';
    const label = txt(item).slice(0, 30);
    item.click();
    return 'clicked:' + label;
  })()`);
  console.log('MENU:', clicked);
  if (!/^clicked:/.test(String(clicked))) { console.error('IMGDL_FAIL: ' + clicked); process.exit(1); }

  const before = new Set(fs.readdirSync(outDir));
  const deadline = Date.now() + timeoutSec * 1000;
  let done = null;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 4000));
    const files = fs.readdirSync(outDir).filter((f) => !before.has(f));
    const partial = files.find((f) => /\.crdownload$/i.test(f));
    if (partial) {
      const p = path.join(outDir, partial);
      const a = fs.statSync(p).size;
      await new Promise((r) => setTimeout(r, 8000));
      if (fs.existsSync(p) && fs.statSync(p).size === a) {
        console.error('IMGDL_FAIL: download stalled at ' + a + ' B (' + partial + ')');
        process.exit(1);
      }
      continue;
    }
    const finished = files.find((f) => !/\.crdownload$/i.test(f));
    if (finished) {
      const p = path.join(outDir, finished);
      const a = fs.statSync(p).size;
      await new Promise((r) => setTimeout(r, 3000));
      if (fs.statSync(p).size === a && a > 10000) { done = p; break; }
    }
  }
  if (!done) { console.error('IMGDL_FAIL: no completed file within ' + timeoutSec + 's'); process.exit(1); }

  const buf = fs.readFileSync(done);
  const isPng = buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isJpg = buf.slice(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  const dims = isPng ? `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}` : 'n/a';
  console.log('FILE:', done, buf.length, 'bytes | png:', isPng, '| jpg:', isJpg, '| dims:', dims);
  if (!isPng && !isJpg) { console.error('IMGDL_FAIL: not an image'); process.exit(1); }
  console.log('IMGDL_OK');
  process.exit(0);
})().catch((e) => { console.error('IMGDL_FAIL:', e.message); process.exit(1); });
