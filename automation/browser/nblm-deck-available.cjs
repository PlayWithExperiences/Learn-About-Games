// Check whether NotebookLM will generate a slide deck RIGHT NOW, without consuming a
// claim or any quota.
//
// Why: a deck is one of the three required artifacts. When the feature is capacity
// throttled the dialog still opens and looks normal, but the immediate-generate button
// is gone and it only offers a multi-hour queue. Discovering that AFTER claiming wastes
// one of the ten daily claims on an item that cannot possibly finish (observed
// 2026-09-13, where two claims were spent this way).
//
// Exit codes: 0 = available, 3 = throttled, 1 = could not determine (treated as blocked).
// Prints JSON: {"available":bool,"reason":str,"generateButtons":n}
const port = process.env.LAG_CDP_PORT || '9222';

(async () => {
  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = list.find((t) => t.type === 'page' && t.url.includes('notebook.google.com'));
  if (!page) { console.error(JSON.stringify({ available: false, reason: 'no notebook page target' })); process.exit(1); }
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

  try {
    const r = await send('Runtime.evaluate', {
      returnByValue: true,
      awaitPromise: true,
      expression: `(async () => {
        const txt = (el) => (el && el.textContent || '').replace(/\\s+/g,' ').trim();
        // ensure list mode; a viewer left open hides the create buttons
        const back = [...document.querySelectorAll('button,[role=button]')]
          .find(b => /关闭网页查看器/.test(b.getAttribute('aria-label') || ''));
        if (back) { back.click(); await new Promise(r => setTimeout(r, 2500)); }
        let btn = [...document.querySelectorAll('button,[role=button]')]
          .find(b => txt(b).includes('演示文稿') && /create-artifact/.test((b.className||'').toString()));
        if (!btn) {
          const x = [...document.querySelectorAll('button,[role=button]')]
            .find(b => /^(关闭|close)$/i.test((b.getAttribute('aria-label')||'').trim()));
          if (x) { x.click(); await new Promise(r => setTimeout(r, 2500)); }
          btn = [...document.querySelectorAll('button,[role=button]')]
            .find(b => txt(b).includes('演示文稿') && /create-artifact/.test((b.className||'').toString()));
        }
        if (!btn) return { available: false, reason: 'slides create button not reachable', generateButtons: -1 };
        btn.click();
        await new Promise(r => setTimeout(r, 4000));
        const dlg = [...document.querySelectorAll('[role=dialog]')].filter(d => d.getBoundingClientRect().width > 0).pop();
        if (!dlg) return { available: false, reason: 'slides dialog did not open', generateButtons: -1 };
        const text = txt(dlg);
        const n = [...document.querySelectorAll('button')].filter(b => /立即生成/.test(txt(b))).length;
        const throttled = /几小时后生成|升级可缩短等待时间/.test(text);
        const close = [...dlg.querySelectorAll('button')]
          .find(b => /关闭对话框|close/i.test((b.getAttribute('aria-label')||'') + txt(b)));
        if (close) close.click();
        await new Promise(r => setTimeout(r, 1500));
        if (throttled) return { available: false, reason: 'deck feature throttled: ' + (text.match(/此内容将在[^。]*。/)||[''])[0], generateButtons: n };
        if (n === 0) return { available: false, reason: 'no immediate-generate button in the slides dialog', generateButtons: 0 };
        return { available: true, reason: 'immediate generation offered', generateButtons: n };
      })()`,
    });
    const value = r.result.value || { available: false, reason: 'empty probe result' };
    console.log(JSON.stringify(value));
    ws.close();
    if (value.available) process.exit(0);
    process.exit(/throttled/.test(value.reason) ? 3 : 1);
  } catch (e) {
    console.log(JSON.stringify({ available: false, reason: 'probe failed: ' + e.message }));
    ws.close();
    process.exit(1);
  }
})().catch((e) => { console.error(JSON.stringify({ available: false, reason: e.message })); process.exit(1); });
