// Open an image-based NotebookLM artifact (信息图) and recover its ORIGINAL bytes.
//
// Route: the viewer renders the artifact as a plain <img> served from
// lh3.googleusercontent.com with the signed-in session. We read that element's src and
// hand it to asset-capture.cjs, which streams the real response through the browser
// (curl gets the Google sign-in page; in-page fetch is CSP/CORS-blocked; the viewer's
// own download stalls in headless). No re-render, no screenshot.
//
// Usage: LAG_CDP_PORT=9222 node nblm-export-image-artifact.cjs "<card title fragment>" <out.png>
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const port = process.env.LAG_CDP_PORT || '9222';
const cardTitle = process.argv[2];
const outPng = process.argv[3];

if (!cardTitle || !outPng) {
  console.error('usage: node nblm-export-image-artifact.cjs "<card title fragment>" <out.png>');
  process.exit(2);
}

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

  // Normalise the Studio panel to list mode (the image viewer only exposes an ✕, so
  // the 关闭网页查看器 shortcut alone is not enough).
  try {
    execFileSync(process.execPath, [path.join(__dirname, 'nblm-studio-list.cjs')],
      { env: process.env, stdio: 'pipe', timeout: 120000 });
  } catch { /* carry on; the lookup below reports the real problem */ }

  const opened = await evaluate(`(async () => {
    const t = (e) => (e && e.textContent || '').replace(/\\s+/g,' ').trim();
    const panel = document.querySelector('studio-panel');
    if (!panel) return 'no studio panel';
    const card = [...panel.querySelectorAll('[class*=artifact-item]')]
      .find(e => t(e).includes(${JSON.stringify(cardTitle)}));
    if (!card) return 'card not found';
    if (/正在生成|生成中/.test(t(card))) return 'still generating';
    const btn = card.querySelector('button.artifact-stretched-button') || card.querySelector('button');
    if (!btn) return 'no open button';
    btn.click();
    await new Promise(r => setTimeout(r, 9000));
    return 'opened';
  })()`);
  console.log('OPEN:', opened);
  if (opened !== 'opened') { console.error('IMAGE_FAIL: ' + opened); process.exit(1); }

  let src = null;
  for (let i = 0; i < 12; i++) {
    const info = await evaluate(`(() => {
      const img = [...document.querySelectorAll('img')]
        .filter(i => i.naturalWidth >= 800 && i.getBoundingClientRect().width > 0)
        .sort((a,b) => (b.naturalWidth*b.naturalHeight) - (a.naturalWidth*a.naturalHeight))[0];
      return img ? { src: img.src, w: img.naturalWidth, h: img.naturalHeight, host: new URL(img.src).host } : null;
    })()`);
    if (info && /lh3\./.test(info.host)) { src = info; break; }
    await new Promise((r) => setTimeout(r, 3000));
  }
  if (!src) { console.error('IMAGE_FAIL: no lh3-hosted artifact image found in the viewer'); process.exit(1); }
  console.log('IMAGE:', src.w + 'x' + src.h, 'host:', src.host);

  const capture = path.join(__dirname, 'asset-capture.cjs');
  const out = execFileSync(process.execPath, [capture, src.src, outPng], {
    env: { ...process.env, LAG_CDP_PORT: port },
    encoding: 'utf8',
  });
  process.stdout.write(out);

  const buf = fs.readFileSync(outPng);
  const isPng = buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (!isPng) { console.error('IMAGE_FAIL: captured bytes are not a PNG'); process.exit(1); }
  const dims = `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`;
  console.log('DIMS:', dims, '| expected:', `${src.w}x${src.h}`);
  if (dims !== `${src.w}x${src.h}`) console.error('WARN: captured dimensions differ from the rendered element');
  console.log('IMAGE_OK');
  process.exit(0);
})().catch((e) => { console.error('IMAGE_FAIL:', e.message); process.exit(1); });
