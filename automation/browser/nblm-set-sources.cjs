// Set the source selection used by a Studio generation dialog (or by chat) to exactly
// one source, then confirm.
//
// Why this exists: the 添加来源/来源 panel checkboxes are NOT what Studio generation
// uses. The generation dialog carries its own selector, defaults to 全选 (every source
// in the notebook), and silently produces an artifact "基于 N 个来源" — observed
// 2026-09-13, where the first HITMAN infographic started as "基于 2 个来源" and would
// have mixed in the previous candidate's lecture.
//
// Usage: LAG_CDP_PORT=9222 node nblm-set-sources.cjs "<title fragment to KEEP>"
const port = process.env.LAG_CDP_PORT || '9222';
const keep = process.argv[2];
if (!keep) {
  console.error('usage: node nblm-set-sources.cjs "<title fragment to keep>"');
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

  const state = () => evaluate(`(() => {
    const boxes = [...document.querySelectorAll('input[type=checkbox]')]
      .filter(c => /^选择/.test(c.getAttribute('aria-label') || ''));
    return boxes.map(c => ({ label: c.getAttribute('aria-label'), checked: c.checked }));
  })()`);

  console.log('BEFORE:', JSON.stringify((await state()).map(s => (s.checked ? '+' : '-') + s.label.slice(0, 30))));

  for (let pass = 0; pass < 8; pass++) {
    const cur = await state();
    const victims = cur.filter((s) => s.checked && /^选择“/.test(s.label) && !s.label.includes(keep));
    const allBox = cur.find((s) => /选择所有来源/.test(s.label));
    if (!victims.length && (!allBox || !allBox.checked)) break;
    const target = victims.length ? victims[0].label : allBox.label;
    await evaluate(`(() => {
      const boxes = [...document.querySelectorAll('input[type=checkbox]')]
        .filter(c => /^选择/.test(c.getAttribute('aria-label') || ''));
      const box = boxes.find(c => c.getAttribute('aria-label') === ${JSON.stringify(target)});
      if (!box) return 'gone';
      (box.closest('label') || box).click();
      return 'clicked';
    })()`);
    await new Promise((r) => setTimeout(r, 1200));
  }

  // make sure the keeper is ON
  const cur = await state();
  const mine = cur.find((s) => s.label.includes(keep));
  if (!mine) { console.error('SET_SOURCES_FAIL: no source matches "' + keep + '"'); process.exit(1); }
  if (!mine.checked) {
    await evaluate(`(() => {
      const boxes = [...document.querySelectorAll('input[type=checkbox]')]
        .filter(c => /^选择/.test(c.getAttribute('aria-label') || ''));
      const box = boxes.find(c => c.getAttribute('aria-label') === ${JSON.stringify(mine.label)});
      (box.closest('label') || box).click();
      return 'clicked';
    })()`);
    await new Promise((r) => setTimeout(r, 1200));
  }

  const after = await state();
  const checked = after.filter((s) => s.checked && /^选择“/.test(s.label));
  console.log('AFTER:', JSON.stringify(after.map(s => (s.checked ? '+' : '-') + s.label.slice(0, 30))));

  // confirm if a 确认 button is present (generation dialog flow)
  const confirmed = await evaluate(`(async () => {
    const t = (e) => (e && e.textContent || '').replace(/\\s+/g,' ').trim();
    const btn = [...document.querySelectorAll('button')].find(b => t(b) === '确认' && b.getBoundingClientRect().width > 0);
    if (!btn) return 'no-confirm-button';
    btn.click();
    await new Promise(r => setTimeout(r, 2500));
    return 'confirmed';
  })()`);
  console.log('CONFIRM:', confirmed);

  if (checked.length === 1 && checked[0].label.includes(keep)) {
    console.log('SET_OK:', checked[0].label.slice(2));
    ws.close();
    process.exit(0);
  }
  console.error('SET_SOURCES_FAIL: ' + checked.length + ' source(s) still selected');
  ws.close();
  process.exit(1);
})().catch((e) => { console.error('SET_SOURCES_FAIL:', e.message); process.exit(1); });
