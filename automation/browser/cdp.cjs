// Drive the automation Chrome over raw CDP (no playwright version coupling).
// Usage: LAG_CDP_PORT=9222 node cdp.js state
//        LAG_CDP_PORT=9222 node cdp.js shot
//        LAG_CDP_PORT=9222 node cdp.js goto <url>
//        LAG_CDP_PORT=9222 node cdp.js eval '<js>' [out-file]
// state prints target URL, saves screenshot to /tmp/lag-state.png and a short DOM summary.
// eval runs read-only JS in the notebook tab and writes the full result to out-file.
// Stop rules: any Google re-auth/2FA challenge -> stop, never type credentials;
// never navigate or evaluate outside notebook.google.com without explicit approval.
const fs = require('fs');

async function send(ws, id, method, params = {}) {
  return new Promise((resolve, reject) => {
    const onMsg = (ev) => {
      let msg;
      try { msg = JSON.parse(typeof ev.data === 'string' ? ev.data : Buffer.from(ev.data).toString()); } catch { return; }
      if (msg.id === id) {
        ws.removeEventListener('message', onMsg);
        clearTimeout(timer);
        if (msg.error) reject(new Error(msg.error.message));
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
  const cmd = process.argv[2] || 'state';
  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = list.find((t) => t.type === 'page' && t.url.includes('notebook.google.com'))
    || list.find((t) => t.type === 'page');
  if (!page) { console.error('NO_PAGE_TARGET'); process.exit(1); }
  console.log('TARGET_URL:', page.url);
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); setTimeout(() => rej(new Error('ws open timeout')), 15000); });
  let id = 1;
  if (cmd === 'state' || cmd === 'shot' || cmd === 'goto') {
    if (cmd === 'goto') {
      await send(ws, id++, 'Page.navigate', { url: process.argv[3] });
      await new Promise((r) => setTimeout(r, 6000));
      console.log('NAVIGATED');
    }
    const shot = await send(ws, id++, 'Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('/tmp/lag-state.png', Buffer.from(shot.data, 'base64'));
    console.log('SHOT: /tmp/lag-state.png');
  }
  if (cmd === 'state' || cmd === 'eval') {
    const js = cmd === 'eval' ? process.argv[3] : '({title: document.title, url: location.href})';
    const r = await send(ws, id++, 'Runtime.evaluate', { expression: js, returnByValue: true, awaitPromise: true });
    const out = typeof r.result.value === 'string' ? r.result.value : JSON.stringify(r.result.value);
    if (cmd === 'eval') fs.writeFileSync(process.argv[4] || '/tmp/lag-eval.txt', out);
    console.log('EVAL:', String(out).slice(0, 300));
  }
  ws.close();
})().catch((e) => { console.error('CDP_FAIL:', e.message); process.exit(1); });
