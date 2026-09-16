// Check whether NotebookLM's chat can answer RIGHT NOW, without sending anything.
//
// Why: the summary stage asks the notebook a question, so a chat that is rate limited makes
// the item impossible — but the item is only discovered to be impossible after a claim has
// been spent (observed 2026-09-16: "已达到 AI 用量限额。12:38 PM 之后，所有功能都将可用。"
// with the composer disabled). This probe only reads the page: it never sends a question,
// so it consumes no quota itself.
//
// It deliberately reports throttling ONLY on explicit limit wording. A composer that is
// merely off screen (an open source panel hides it) is a layout artifact, not evidence of a
// block, and must not stop a batch.
//
// Exit codes: 0 = usable, 3 = chat rate limited, 1 = could not determine.
// Prints JSON: {"available":bool,"reason":str}
const port = process.env.LAG_CDP_PORT || '9222';

(async () => {
  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = list.find((t) => t.type === 'page' && t.url.includes('notebook.google.com'));
  if (!page) { console.log(JSON.stringify({ available: false, reason: 'no notebook page target' })); process.exit(1); }
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res);
    ws.addEventListener('error', rej);
    setTimeout(() => rej(new Error('ws open timeout')), 15000);
  });
  let id = 0;
  const send = (method, params = {}, t = 60000) => new Promise((resolve, reject) => {
    const msgId = ++id;
    const onMsg = (ev) => {
      let m; try { m = JSON.parse(ev.data); } catch { return; }
      if (m.id === msgId) {
        ws.removeEventListener('message', onMsg);
        m.error ? reject(new Error(m.error.message)) : resolve(m.result);
      }
    };
    ws.addEventListener('message', onMsg);
    ws.send(JSON.stringify({ id: msgId, method, params }));
    setTimeout(() => reject(new Error('cdp timeout ' + method)), t);
  });

  try {
    const r = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `(() => {
        const text = document.body ? (document.body.innerText || '') : '';
        const limit = text.match(/已达到 AI 用量限额[^\\n]{0,40}/)
          || text.match(/对话功能已停用[^\\n]{0,40}/)
          || text.match(/You.?ve reached your (AI|chat) (usage )?limit[^\\n]{0,40}/i);
        const composer = [...document.querySelectorAll('textarea, [contenteditable="true"]')]
          .find(e => { const r = e.getBoundingClientRect(); return r.width > 100 && r.height > 10; });
        const enabled = !!composer && !composer.disabled && composer.getAttribute('aria-disabled') !== 'true';
        if (limit) return { available: false, reason: 'chat rate limited: ' + limit[0], quota: true };
        return {
          available: true,
          reason: enabled ? 'composer ready' : 'composer not visible (layout only, not treated as blocked)',
          composerVisible: !!composer,
        };
      })()`,
    });
    const value = r.result.value || { available: false, reason: 'empty probe result' };
    console.log(JSON.stringify(value));
    ws.close();
    process.exit(value.available ? 0 : 3);
  } catch (e) {
    console.log(JSON.stringify({ available: false, reason: 'probe failed: ' + e.message }));
    ws.close();
    process.exit(1);
  }
})().catch((e) => { console.error(JSON.stringify({ available: false, reason: e.message })); process.exit(1); });
