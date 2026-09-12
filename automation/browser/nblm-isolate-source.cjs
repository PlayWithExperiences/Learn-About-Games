// Leave exactly one NotebookLM source selected, so every generated artifact is
// grounded in the current candidate only.
//
// Anti-drift rules baked in (learned 2026-09-10 when checkbox indices shifted
// mid-run): addresses each checkbox by its aria-label atomically, re-queries the
// DOM after every toggle instead of trusting a cached list, and verifies the final
// state by re-reading rather than assuming the clicks worked.
//
// Usage: LAG_CDP_PORT=9222 node nblm-isolate-source.cjs "<title fragment of the source to KEEP>"
const port = process.env.LAG_CDP_PORT || '9222';
const keep = process.argv[2];

if (!keep) {
  console.error('usage: node nblm-isolate-source.cjs "<title fragment to keep>"');
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
      .filter(c => /^选择“/.test(c.getAttribute('aria-label') || ''));
    return boxes.map(c => ({ label: c.getAttribute('aria-label'), checked: c.checked }));
  })()`);

  const before = await state();
  console.log('BEFORE:', JSON.stringify(before.map(s => (s.checked ? '+' : '-') + s.label.slice(2, 34))));

  // toggle off every non-target box, one at a time, re-querying between clicks
  for (let pass = 0; pass < 6; pass++) {
    const current = await state();
    const victims = current.filter((s) => s.checked && !s.label.includes(keep));
    if (!victims.length) break;
    const victim = victims[0];
    const res = await evaluate(`(() => {
      const boxes = [...document.querySelectorAll('input[type=checkbox]')]
        .filter(c => /^选择“/.test(c.getAttribute('aria-label') || ''));
      const box = boxes.find(c => c.getAttribute('aria-label') === ${JSON.stringify(victim.label)});
      if (!box) return 'gone';
      const clickable = box.closest('label') || box;
      clickable.click();
      return 'clicked';
    })()`);
    console.log('  toggle off', victim.label.slice(0, 40), '->', res);
    await new Promise((r) => setTimeout(r, 1500));
  }

  // ensure the target is ON (re-query, do not assume)
  for (let pass = 0; pass < 3; pass++) {
    const current = await state();
    const target = current.find((s) => s.label.includes(keep));
    if (!target) { console.error('ISOLATE_FAIL: no checkbox matches "' + keep + '"'); process.exit(1); }
    if (target.checked) break;
    await evaluate(`(() => {
      const boxes = [...document.querySelectorAll('input[type=checkbox]')]
        .filter(c => /^选择“/.test(c.getAttribute('aria-label') || ''));
      const box = boxes.find(c => c.getAttribute('aria-label') === ${JSON.stringify(target.label)});
      if (!box) return 'gone';
      (box.closest('label') || box).click();
      return 'clicked';
    })()`);
    await new Promise((r) => setTimeout(r, 1500));
  }

  await new Promise((r) => setTimeout(r, 1500));
  const after = await state();
  const checked = after.filter((s) => s.checked);
  console.log('AFTER:', JSON.stringify(after.map(s => (s.checked ? '+' : '-') + s.label.slice(2, 34))));
  if (checked.length === 1 && checked[0].label.includes(keep)) {
    console.log('ISOLATED:', checked[0].label.slice(2).replace(/”$/, ''));
    ws.close();
    process.exit(0);
  }
  console.error('ISOLATE_FAIL: ' + checked.length + ' source(s) still selected');
  ws.close();
  process.exit(1);
})().catch((e) => { console.error('ISOLATE_FAIL:', e.message); process.exit(1); });
