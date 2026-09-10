// Talk to the NotebookLM Studio viewer (OOPIF) directly over its own CDP websocket.
// The viewer (e.g. MindmapApp, *.scf.usercontent.goog) is an out-of-process iframe:
// Page.getFrameTree does NOT list it. Find it in /json/list (type=iframe) instead
// and evaluate inside it. Read-only by default; callers pass the expression.
// Usage: LAG_CDP_PORT=9222 node oopif-probe.cjs '<js-expression>' [out-file]
// Found 2026-09-10 while the mindmap viewer moved to a canvas-app: the toolbar
// "Expand all nodes" button (aria-label) is the contract-v2 expansion path;
// the outer card ⋮ menu only has Delete. Do not navigate it outside notebook.
const fs = require('fs');

function send(ws, id, method, params = {}) {
  return new Promise((resolve, reject) => {
    const onMsg = (ev) => {
      if (ev.data == null) return;
      let msg;
      try { msg = JSON.parse(typeof ev.data === 'string' ? ev.data : Buffer.from(ev.data).toString()); } catch { return; }
      if (msg.id === id) {
        ws.removeEventListener('message', onMsg);
        clearTimeout(timer);
        if (msg.error) reject(new Error(method + ': ' + msg.error.message));
        else resolve(msg.result);
      }
    };
    const timer = setTimeout(() => { ws.removeEventListener('message', onMsg); reject(new Error('cdp timeout ' + method)); }, 30000);
    ws.addEventListener('message', onMsg);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

(async () => {
  const port = process.env.LAG_CDP_PORT || '9222';
  const expr = process.argv[2] || '(document.title)';
  const outFile = process.argv[3];
  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const target = list.find((t) => (t.url || '').includes('scf.usercontent'));
  if (!target) { console.error('NO_OOPIF_TARGET'); process.exit(1); }
  console.log('OOPIF_URL:', target.url.slice(0, 120));
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); setTimeout(() => rej(new Error('ws open timeout')), 15000); });
  const r = await send(ws, 1, 'Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  const out = typeof r.result.value === 'string' ? r.result.value : JSON.stringify(r.result.value);
  const text = String(out ?? '');
  if (outFile) fs.writeFileSync(outFile, text);
  console.log('OOPIF_EVAL:', text.slice(0, 500));
  ws.close();
})().catch((e) => { console.error('OOPIF_FAIL:', e.message); process.exit(1); });
