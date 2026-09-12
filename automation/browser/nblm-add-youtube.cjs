// Add one YouTube source to the currently open NotebookLM notebook and wait until
// it is really there. Reused once per candidate by the collect-resources pipeline.
//
// Flow: 添加来源 -> 网站(link) -> paste URL into that dialog's textarea -> 提交 ->
// poll the source list until the new source appears.
//
// The trap this guards against (learned 2026-09-03): the 添加来源 dialog has its own
// search box, and typing can land there instead of the URL field. This script asserts
// which field it wrote to and refuses to submit if it wrote to the search box.
//
// Usage: LAG_CDP_PORT=9222 node nblm-add-youtube.cjs <youtube-url> [--timeout-sec 180]
const port = process.env.LAG_CDP_PORT || '9222';
const url = process.argv[2];
const timeoutSec = Number((process.argv.find((a) => a.startsWith('--timeout-sec=')) || '').split('=')[1] || 180);

if (!url || !/^https?:\/\//.test(url)) {
  console.error('usage: node nblm-add-youtube.cjs <youtube-url> [--timeout-sec=180]');
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

  // De-duplicated: the panel renders each title in more than one node, and the new
  // source is NOT always appended last, so the caller must diff the sets rather than
  // read the tail (that mis-identification produced a duplicate-source run on
  // 2026-09-13 when it reported the previous candidate instead of the new one).
  const sourceTitles = () => evaluate(`(() => {
    const t = (e) => (e && e.textContent || '').replace(/\\s+/g,' ').trim();
    const arr = [...document.querySelectorAll('[class*=single-source-container] [class*=source-title], [class*=source-title-column]')].map(t).filter(Boolean);
    return [...new Set(arr)];
  })()`);

  const before = await sourceTitles();
  console.log('SOURCES_BEFORE:', JSON.stringify(before));

  // 1) open 添加来源, then the 网站 (link) tab
  const opened = await evaluate(`(async () => {
    const t = (e) => (e && e.textContent || '').replace(/\\s+/g,' ').trim();
    const add = [...document.querySelectorAll('button,[role=button]')]
      .find(b => /添加来源/.test(b.getAttribute('aria-label')||'') || t(b) === 'add 添加来源');
    if (!add) return 'no add button';
    add.click();
    await new Promise(r => setTimeout(r, 2500));
    const dlg = [...document.querySelectorAll('[role=dialog]')].find(d => /添加来源|网站|YouTube|上传文件/.test(t(d)));
    if (!dlg) return 'no dialog';
    const site = [...dlg.querySelectorAll('button,[role=button]')].find(b => /网站/.test(t(b)));
    if (!site) return 'no website button';
    site.click();
    await new Promise(r => setTimeout(r, 2000));
    return 'website-tab-open';
  })()`);
  console.log('STEP1:', opened);
  if (!/website-tab-open/.test(String(opened))) { console.error('ADD_SOURCE_FAIL: ' + opened); process.exit(1); }

  // 2) write ONLY into the dialog field that is not the search box
  const wrote = await evaluate(`(() => {
    const t = (e) => (e && e.textContent || '').replace(/\\s+/g,' ').trim();
    const dlgs = [...document.querySelectorAll('[role=dialog]')].filter(d => d.getBoundingClientRect().width > 0);
    const dlg = dlgs[dlgs.length - 1];
    if (!dlg) return {ok:false, why:'no visible dialog'};
    const fields = [...dlg.querySelectorAll('textarea,input[type=text],input:not([type])')]
      .filter(f => f.getBoundingClientRect().width > 0 && !f.disabled && !f.readOnly);
    if (!fields.length) return {ok:false, why:'no writable field'};
    // the search box is the one whose placeholder mentions search
    const field = fields.find(f => !/搜索/.test(f.getAttribute('placeholder') || '')) || fields[0];
    const ph = field.getAttribute('placeholder') || '';
    if (/搜索/.test(ph)) return {ok:false, why:'only the search box is available', ph};
    field.focus();
    const proto = field.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(field, ${JSON.stringify(url)});
    field.dispatchEvent(new Event('input', {bubbles:true}));
    field.dispatchEvent(new Event('change', {bubbles:true}));
    return {ok:true, tag: field.tagName, ph, value: field.value};
  })()`);
  console.log('STEP2:', JSON.stringify(wrote));
  if (!wrote || !wrote.ok) { console.error('ADD_SOURCE_FAIL: refused to write into the search box: ' + JSON.stringify(wrote)); process.exit(1); }

  // 3) submit
  const submitted = await evaluate(`(async () => {
    const t = (e) => (e && e.textContent || '').replace(/\\s+/g,' ').trim();
    const dlgs = [...document.querySelectorAll('[role=dialog]')].filter(d => d.getBoundingClientRect().width > 0);
    const dlg = dlgs[dlgs.length - 1];
    const btn = [...dlg.querySelectorAll('button')].find(b => /提交|插入|添加|导入/.test((b.getAttribute('aria-label')||'') + t(b)));
    if (!btn) return 'no submit button';
    btn.click();
    return 'submitted:' + ((btn.getAttribute('aria-label')||'') + t(btn)).slice(0,20);
  })()`);
  console.log('STEP3:', submitted);

  // 4) wait for the source to actually appear
  const deadline = Date.now() + timeoutSec * 1000;
  let after = before;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 5000));
    after = await sourceTitles();
    if (after.length > before.length) break;
  }
  console.log('SOURCES_AFTER:', JSON.stringify(after));
  const added = after.filter((t) => !before.includes(t));
  if (added.length === 1) {
    console.log('ADDED:', added[0]);
    ws.close();
    process.exit(0);
  }
  if (added.length > 1) {
    console.error('ADD_SOURCE_FAIL: ambiguous — ' + added.length + ' new sources: ' + JSON.stringify(added));
    ws.close();
    process.exit(1);
  }
  console.error('ADD_SOURCE_FAIL: source did not appear within ' + timeoutSec + 's');
  ws.close();
  process.exit(1);
})().catch((e) => { console.error('ADD_SOURCE_FAIL:', e.message); process.exit(1); });
