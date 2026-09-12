// Print the notebook's source titles as JSON (de-duplicated).
// Usage: LAG_CDP_PORT=9222 node nblm-list-sources.cjs
const port = process.env.LAG_CDP_PORT || '9222';

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
  const send = (method, params = {}, t = 60000) => new Promise((resolve, reject) => {
    const msgId = ++id;
    const timer = setTimeout(() => { pending.delete(msgId); reject(new Error('cdp timeout ' + method)); }, t);
    pending.set(msgId, { resolve, reject, timer });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
  const r = await send('Runtime.evaluate', {
    expression: `(() => {
      const t = (e) => (e && e.textContent || '').replace(/\\s+/g,' ').trim();
      const arr = [...document.querySelectorAll('[class*=source-title-column], [class*=single-source-container] [class*=source-title]')].map(t).filter(Boolean);
      return [...new Set(arr)];
    })()`,
    returnByValue: true,
  });
  console.log(JSON.stringify({ sources: r.result.value }));
  ws.close();
  process.exit(0);
})().catch((e) => { console.error('LIST_SOURCES_FAIL:', e.message); process.exit(1); });
