// Send a chat prompt in NotebookLM and report how many answers existed BEFORE sending,
// so the caller can require a genuinely new answer instead of re-reading the previous
// candidate's answer (which is still on screen in a reused notebook).
//
// Usage: LAG_CDP_PORT=9222 node nblm-ask.cjs "<prompt>" [--timeout-sec=120]
// Prints: ANSWERS_BEFORE=<n> / SENT / ANSWERS_AFTER=<n>
const port = process.env.LAG_CDP_PORT || '9222';
const prompt = process.argv[2];
const timeoutSec = Number((process.argv.find((a) => a.startsWith('--timeout-sec=')) || '').split('=')[1] || 120);

if (!prompt) {
  console.error('usage: node nblm-ask.cjs "<prompt>" [--timeout-sec=120]');
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
  const send = (method, params = {}, t = 90000) => new Promise((resolve, reject) => {
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

  const answerCount = () => evaluate(`(() => [...document.querySelectorAll('[class*=message-content]')]
    .filter(e => (e.innerText || '').includes('来源边界') && (e.innerText || '').length > 800).length)()`);

  const before = await answerCount();
  console.log('ANSWERS_BEFORE=' + before);

  const sent = await evaluate(`(async () => {
    const fields = [...document.querySelectorAll('textarea,[contenteditable=true]')]
      .filter(f => f.getBoundingClientRect().width > 0 && !f.disabled && !f.readOnly);
    const box = fields.find(f => /提问|创作|Ask|message/i.test((f.getAttribute('placeholder')||'') + (f.getAttribute('aria-label')||'')))
      || fields[fields.length - 1];
    if (!box) return 'no composer';
    box.focus();
    if (box.tagName === 'TEXTAREA') {
      Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set.call(box, ${JSON.stringify(prompt)});
    } else {
      box.textContent = ${JSON.stringify(prompt)};
    }
    box.dispatchEvent(new Event('input', {bubbles:true}));
    box.dispatchEvent(new Event('change', {bubbles:true}));
    await new Promise(r => setTimeout(r, 1200));
    const scope = box.closest('form') || box.closest('[class*=input]') || box.parentElement.parentElement;
    const btn = [...(scope ? scope.querySelectorAll('button') : [])]
      .find(b => /提交|发送|send/i.test((b.getAttribute('aria-label')||'') + (b.textContent||'')));
    if (!btn) return 'no send button';
    btn.click();
    await new Promise(r => setTimeout(r, 2500));
    return 'sent';
  })()`);
  console.log('SEND=' + sent);
  if (!/sent/.test(String(sent))) { console.error('ASK_FAIL: ' + sent); process.exit(1); }

  // wait until a NEW answer shows up (so callers can extract the right one)
  const deadline = Date.now() + timeoutSec * 1000;
  let after = before;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 5000));
    after = await answerCount();
    if (after > before) break;
  }
  console.log('ANSWERS_AFTER=' + after);
  ws.close();
  process.exit(after > before ? 0 : 2);
})().catch((e) => { console.error('ASK_FAIL:', e.message); process.exit(1); });
