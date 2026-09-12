// Ensure the Studio panel is showing its artifact LIST, then print it.
//
// Different artifact viewers close differently: the mind-map viewer exposes a
// 关闭网页查看器 button, the image viewer only an ✕, and the slide-deck viewer neither
// reliably. So try the known controls in order and fall back to a page reload, which
// always restores list mode (notebook state is server-side).
//
// Usage: LAG_CDP_PORT=9222 node nblm-studio-list.cjs [--json]
const port = process.env.LAG_CDP_PORT || '9222';
const asJson = process.argv.includes('--json');

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

  const ITEMS = `(() => {
    const t = (e) => (e && e.textContent || '').replace(/\\s+/g,' ').trim();
    const panel = document.querySelector('studio-panel');
    return panel ? [...panel.querySelectorAll('[class*=artifact-item]')].map(e => t(e).slice(0,90)) : [];
  })()`;

  let items = await evaluate(ITEMS);
  let how = 'already-list';

  if (!items.length) {
    const closed = await evaluate(`(async () => {
      const t = (e) => (e && e.textContent || '').replace(/\\s+/g,' ').trim();
      const candidates = [...document.querySelectorAll('button,[role=button]')].filter(b => {
        const a = b.getAttribute('aria-label') || '';
        return /关闭网页查看器/.test(a) || /^(关闭|close)$/i.test(a.trim()) || t(b) === 'close';
      });
      if (!candidates.length) return 'no-close-control';
      candidates[0].click();
      await new Promise(r => setTimeout(r, 3500));
      return 'clicked';
    })()`);
    how = closed;
    items = await evaluate(ITEMS);
  }

  if (!items.length) {
    await send('Page.enable');
    await send('Page.reload', { ignoreCache: false });
    await new Promise((r) => setTimeout(r, 12000));
    how = 'reloaded';
    items = await evaluate(ITEMS);
  }

  if (asJson) {
    console.log(JSON.stringify({ how, count: items.length, artifacts: items }));
  } else {
    console.log('HOW:', how, '| artifacts:', items.length);
    for (const a of items) console.log('  -', a);
  }
  ws.close();
  process.exit(items.length ? 0 : 1);
})().catch((e) => { console.error('STUDIO_LIST_FAIL:', e.message); process.exit(1); });
