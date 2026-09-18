// Leave exactly one NotebookLM source selected, so every generated artifact is
// grounded in the current candidate only.
//
// Anti-drift rules baked in (learned 2026-09-10 when checkbox indices shifted
// mid-run): addresses each checkbox by its aria-label atomically, re-queries the
// DOM after every toggle instead of trusting a cached list, and verifies the final
// state by re-reading rather than assuming the clicks worked.
//
// Usage: LAG_CDP_PORT=9222 node nblm-isolate-source.cjs "<exact source name to KEEP>"
//
// The pass budget is derived from the checkbox count. It used to be the constant 6,
// which silently ran out once the production notebook grew past seven sources
// (2026-09-14 07:33: eight sources were selected, deselecting seven needed seven
// passes, so the loop stopped after six and left the target plus one other source
// selected, failing the whole item and costing a claim).
const port = process.env.LAG_CDP_PORT || '9222';
const keep = process.argv[2];
// 3s default keeps a single toggle under ~3s; several sources take proportionally longer
// because each toggle is verified by re-reading the DOM.
const settleMs = Number((process.argv.find((a) => a.startsWith('--settle-ms=')) || '').split('=')[1] || 3000);

if (!keep) {
  console.error('usage: node nblm-isolate-source.cjs "<exact source name to keep>" [--settle-ms=3000]');
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

  // aria-label form is 选择“<name>”, so strip the wrapper to compare against the real name
  const nameOf = (label) => (label || '').replace(/^选择“/, '').replace(/”$/, '').trim();

  // A freshly imported link source carries its raw URL as the card name until metadata
  // resolves. The runner passes just the video id for that case — truncating the URL to a
  // prefix would collide across every unresolved source — so resolve the id against the
  // URL cards by exact video id. Matching stays exact; nothing here is a prefix match.
  const looksLikeVideoId = /^[A-Za-z0-9_-]{6,}$/.test(keep) && !/^https?:/i.test(keep);
  const videoIdOf = (name) => {
    const m = /(?:v=|youtu\.be\/|\/shorts\/|\/embed\/)([A-Za-z0-9_-]{6,})/.exec(name || '');
    return m ? m[1] : null;
  };

  // exact match only: a fragment would also match a neighbouring lecture whose title
  // shares a prefix, and then isolation would keep the wrong source
  const matchesKeep = (s) => {
    const name = nameOf(s.label);
    if (name === keep) return true;
    return looksLikeVideoId && videoIdOf(name) === keep;
  };
  const toggle = (label) => evaluate(`(() => {
    const boxes = [...document.querySelectorAll('input[type=checkbox]')]
      .filter(c => /^选择“/.test(c.getAttribute('aria-label') || ''));
    const box = boxes.find(c => c.getAttribute('aria-label') === ${JSON.stringify(label)});
    if (!box) return 'gone';
    const clickable = box.closest('label') || box;
    clickable.click();
    return 'clicked';
  })()`);

  // Imported titles can appear before their selectable checkbox is rendered.
  // Wait for readiness without importing again or choosing a different source.
  let before = await state();
  const readyDeadline = Date.now() + 60000;
  while (!before.some(matchesKeep) && Date.now() < readyDeadline) {
    await new Promise((r) => setTimeout(r, 1500));
    before = await state();
  }
  console.log('BEFORE:', JSON.stringify(before.map(s => (s.checked ? '+' : '-') + nameOf(s.label).slice(0, 32))));

  const keepMatches = before.filter(matchesKeep);
  if (keepMatches.length !== 1) {
    console.error(`ISOLATE_FAIL: keep target matched ${keepMatches.length} sources, expected exactly 1: `
      + JSON.stringify(before.map(s => nameOf(s.label))));
    ws.close();
    process.exit(1);
  }

  // Every selected non-target source needs its own pass. Derive the budget from the
  // observed list, then keep a couple of spare passes for DOM re-render races.
  const budget = before.filter((s) => s.checked && !matchesKeep(s)).length + 2;
  console.log('PLAN: deselect up to', budget, 'source(s) out of', before.length, 'total');

  let passes = 0;
  for (; passes < budget; passes++) {
    const current = await state();
    const victims = current.filter((s) => s.checked && !matchesKeep(s));
    if (!victims.length) break;
    const res = await toggle(victims[0].label);
    console.log('  toggle off', nameOf(victims[0].label).slice(0, 40), '->', res);
    await new Promise((r) => setTimeout(r, settleMs));
  }

  // ensure the target is ON (re-query, do not assume)
  for (let attempt = 0; attempt < 3; attempt++) {
    const current = await state();
    const target = current.find(matchesKeep);
    if (!target) { console.error('ISOLATE_FAIL: target vanished: "' + keep + '"'); ws.close(); process.exit(1); }
    if (target.checked) break;
    await toggle(target.label);
    await new Promise((r) => setTimeout(r, settleMs));
  }

  await new Promise((r) => setTimeout(r, settleMs));
  const after = await state();
  const checked = after.filter((s) => s.checked);
  console.log('AFTER:', JSON.stringify(after.map(s => (s.checked ? '+' : '-') + nameOf(s.label).slice(0, 32))));
  console.log('PASSES_USED:', passes);
  if (checked.length === 1 && matchesKeep(checked[0])) {
    console.log('ISOLATED:', nameOf(checked[0].label));
    ws.close();
    process.exit(0);
  }
  console.error('ISOLATE_FAIL: ' + checked.length + ' source(s) still selected: '
    + JSON.stringify(checked.map(s => nameOf(s.label))));
  ws.close();
  process.exit(1);
})().catch((e) => { console.error('ISOLATE_FAIL:', e.message); process.exit(1); });
