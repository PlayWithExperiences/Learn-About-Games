// Download a NotebookLM slide deck's PPTX through the viewer menu and verify the file.
//
// Route: Studio card -> viewer -> ⋮ (更多选项) -> 下载 PowerPoint (.pptx), with
// Browser.setDownloadBehavior pointing at an isolated directory. Downloads in headless
// Chrome can stall (observed: frozen at 43,977 B, followed by a browser crash); the
// reliable recovery is to restart the browser and click once more, never to spam clicks.
// The first click triggered by a stale browser is the usual failure, so this script
// reports a clear STALL verdict instead of a vague timeout.
//
// Usage: LAG_CDP_PORT=9222 node nblm-export-deck.cjs "<card title fragment>" <out-dir> [--timeout-sec=240]
const fs = require('fs');
const { execFileSync } = require('child_process');
const path = require('path');
const port = process.env.LAG_CDP_PORT || '9222';
const cardTitle = process.argv[2];
const outDir = process.argv[3];
const timeoutSec = Number((process.argv.find((a) => a.startsWith('--timeout-sec=')) || '').split('=')[1] || 240);

if (!cardTitle || !outDir) {
  console.error('usage: node nblm-export-deck.cjs "<card title fragment>" <out-dir> [--timeout-sec=240]');
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
  await send('Page.enable');

  // Normalise the Studio panel to list mode. Viewers differ in how they close (the
  // image viewer only exposes an ✕), so the specific close buttons below are not
  // enough on their own — a leftover viewer makes the card lookup fail misleadingly.
  try {
    execFileSync(process.execPath, [path.join(__dirname, 'nblm-studio-list.cjs')],
      { env: process.env, stdio: 'pipe', timeout: 120000 });
  } catch { /* carry on; the lookup below reports the real problem */ }

  // return to the list, then open the deck card
  const opened = await evaluate(`(async () => {
    const t = (e) => (e && e.textContent || '').replace(/\\s+/g,' ').trim();
    const back = [...document.querySelectorAll('button,[role=button]')]
      .find(b => /关闭网页查看器/.test(b.getAttribute('aria-label') || ''));
    if (back) { back.click(); await new Promise(r => setTimeout(r, 3000)); }
    let panel = document.querySelector('studio-panel');
    let card = panel && [...panel.querySelectorAll('[class*=artifact-item]')]
      .find(e => t(e).includes(${JSON.stringify(cardTitle)}));
    if (!card) {
      const x = [...document.querySelectorAll('button,[role=button]')]
        .find(b => /^(关闭|close)$/i.test((b.getAttribute('aria-label')||'').trim()));
      if (x) { x.click(); await new Promise(r => setTimeout(r, 3000)); }
      panel = document.querySelector('studio-panel');
      card = panel && [...panel.querySelectorAll('[class*=artifact-item]')]
        .find(e => t(e).includes(${JSON.stringify(cardTitle)}));
    }
    if (!card) return 'card not found';
    if (/正在生成|生成中/.test(t(card))) return 'still generating';
    const btn = card.querySelector('button.artifact-stretched-button') || card.querySelector('button');
    if (!btn) return 'no open button';
    btn.click();
    await new Promise(r => setTimeout(r, 10000));
    return 'opened';
  })()`);
  console.log('OPEN:', opened);
  if (opened !== 'opened') { console.error('DECK_FAIL: ' + opened); process.exit(1); }

  const before = fs.readdirSync(outDir);

  const clicked = await evaluate(`(async () => {
    const t = (e) => (e && e.textContent || '').replace(/\\s+/g,' ').trim();
    const more = [...document.querySelectorAll('button,[role=button]')]
      .find(b => /更多选项/.test(b.getAttribute('aria-label') || ''));
    if (!more) return 'no more button';
    more.click();
    await new Promise(r => setTimeout(r, 2500));
    const item = [...document.querySelectorAll('[role=menuitem],.mdc-menu-item,.mat-mdc-menu-item')]
      .find(e => /PowerPoint|\\.pptx/i.test(t(e)));
    if (!item) return 'no pptx menu item';
    item.click();
    return 'clicked';
  })()`);
  console.log('MENU:', clicked);
  if (clicked !== 'clicked') { console.error('DECK_FAIL: ' + clicked); process.exit(1); }

  const deadline = Date.now() + timeoutSec * 1000;
  let finalFile = null;
  let stallReport = null;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 5000));
    const files = fs.readdirSync(outDir);
    const done = files.find((f) => /\.pptx$/i.test(f) && !/\.crdownload$/i.test(f) && !before.includes(f));
    if (done) {
      const p = path.join(outDir, done);
      const a = fs.statSync(p).size;
      await new Promise((r) => setTimeout(r, 3000));
      if (fs.statSync(p).size === a && a > 100000) { finalFile = p; break; }
    }
    const partial = files.find((f) => /\.crdownload$/i.test(f));
    if (partial) {
      const size = fs.statSync(path.join(outDir, partial)).size;
      stallReport = { partial, size };
      await new Promise((r) => setTimeout(r, 10000));
      const size2 = fs.existsSync(path.join(outDir, partial)) ? fs.statSync(path.join(outDir, partial)).size : -1;
      if (size2 === size) {
        console.error('DECK_FAIL: download stalled at ' + size + ' B (' + partial + ') — restart the browser (launch.cjs) and retry once, do not spam clicks');
        process.exit(1);
      }
    }
  }

  if (!finalFile) { console.error('DECK_FAIL: no completed pptx within ' + timeoutSec + 's ' + JSON.stringify(stallReport)); process.exit(1); }

  const buf = fs.readFileSync(finalFile);
  const isZip = buf.slice(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  console.log('FILE:', finalFile, buf.length, 'bytes | zip:', isZip);
  if (!isZip || buf.length < 100000) { console.error('DECK_FAIL: not a valid pptx'); process.exit(1); }
  console.log('DECK_OK');
  process.exit(0);
})().catch((e) => { console.error('DECK_FAIL:', e.message); process.exit(1); });
