// Read the NEWEST NotebookLM chat answer (the one grounded in the current source),
// wait until it stops growing, and write it out with citation widgets removed.
//
// Why this is separate from asking: a notebook keeps its chat history, so the previous
// candidate's answer is still on screen. Selecting "the smallest element containing
// 来源边界" returns that stale answer and silently mislabels it as the current source
// (observed 2026-09-13). This script always targets the LAST answer in DOM order and
// can require that a new one appeared since a recorded baseline.
//
// Usage:
//   LAG_CDP_PORT=9222 node nblm-extract-answer.cjs <out-file> [--min-count=N] [--timeout-sec=420]
//     --min-count=N  wait until at least N answers exist (use the count read before asking)
const fs = require('fs');
const port = process.env.LAG_CDP_PORT || '9222';
const outFile = process.argv[2];
const arg = (name, dflt) => {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? Number(hit.split('=')[1]) : dflt;
};
const minCount = arg('min-count', 1);
const timeoutSec = arg('timeout-sec', 420);

if (!outFile) {
  console.error('usage: node nblm-extract-answer.cjs <out-file> [--min-count=N] [--timeout-sec=420]');
  process.exit(2);
}

const ANSWER_EXPR = `(() => {
  const els = [...document.querySelectorAll('[class*=message-content]')]
    .filter(e => (e.innerText || '').includes('来源边界') && (e.innerText || '').length > 800);
  return els;
})()`;

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

  const counts = () => evaluate(`(() => {
    const els = ${ANSWER_EXPR};
    return { n: els.length, last: els.length ? (els[els.length-1].innerText || '').length : 0 };
  })()`);

  const deadline = Date.now() + timeoutSec * 1000;
  let stable = 0;
  let last = { n: 0, last: 0 };
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 5000));
    const now = await counts();
    if (now.n >= minCount && now.last > 800 && now.last === last.last) {
      stable += 1;
      if (stable >= 3) { last = now; break; }
    } else stable = 0;
    last = now;
  }
  console.log('ANSWERS:', last.n, '| newest length:', last.last, '| required:', minCount);
  if (last.n < minCount) { console.error('EXTRACT_FAIL: expected at least ' + minCount + ' answer(s), saw ' + last.n); process.exit(1); }

  const text = await evaluate(`(() => {
    const els = ${ANSWER_EXPR};
    if (!els.length) return null;
    const el = els[els.length - 1];
    const hidden = [];
    [...el.querySelectorAll('*')].forEach(n => {
      const s = (n.textContent || '').trim();
      if ((/^\\d{1,3}([\\s,]*\\d{1,3})*$/.test(s) || s === 'more_horiz' || s === 'expand_more' || s === 'Thoughts') && n.offsetParent !== null) {
        hidden.push([n, n.style.display]); n.style.display = 'none';
      }
    });
    const out = el.innerText || '';
    hidden.forEach(([n, prev]) => { n.style.display = prev; });
    return out;
  })()`);

  if (!text || text.length < 800) { console.error('EXTRACT_FAIL: empty or too short'); process.exit(1); }
  fs.writeFileSync(outFile, text);
  console.log('WROTE:', outFile, text.length, 'chars');
  console.log('SECTIONS:', JSON.stringify(['核心问题','案例与迭代','设计取舍','玩家影响','可迁移方法'].filter(s => text.includes(s))));
  console.log('HAS_BOUNDARY:', /来源边界/.test(text));
  console.log('HEAD:', text.slice(0, 60).replace(/\n/g, ' '));
  ws.close();
  process.exit(0);
})().catch((e) => { console.error('EXTRACT_FAIL:', e.message); process.exit(1); });
