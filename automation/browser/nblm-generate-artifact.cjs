// Trigger one NotebookLM Studio artifact (信息图 / 思维导图 / 演示文稿) with an explicit
// Simplified-Chinese prompt, the contract's format settings, and hard isolation checks.
//
// Guards learned the hard way (2026-09-13):
//   * A page reload resets the source-panel selection to ALL sources, and the Studio
//     generation dialog snapshots the selection when it OPENS. A stale "2 个来源"
//     dialog silently produced an artifact mixing the previous candidate's lecture.
//     -> after any reload we re-isolate, and we refuse to submit unless the dialog
//        itself reports "1 个来源".
//   * The 视觉风格 tiles are image cards, not buttons; match them by exact label text.
//   * A Chinese card title is not proof of Chinese content, so the prompt always
//     states 中文简体 explicitly.
//
// Usage:
//   LAG_CDP_PORT=9222 node nblm-generate-artifact.cjs <infographic|mindmap|slides> "<prompt>" "<keep-source fragment>"
const port = process.env.LAG_CDP_PORT || '9222';
const type = process.argv[2];
const prompt = process.argv[3];
const keepSource = process.argv[4];

const LABELS = { infographic: '信息图', mindmap: '思维导图', slides: '演示文稿' };
if (!LABELS[type] || !prompt || !keepSource) {
  console.error('usage: node nblm-generate-artifact.cjs <infographic|mindmap|slides> "<prompt>" "<keep-source fragment>"');
  process.exit(2);
}
const label = LABELS[type];

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

  const ARTIFACTS = `(() => {
    const t = (e) => (e && e.textContent || '').replace(/\\s+/g,' ').trim();
    const panel = document.querySelector('studio-panel');
    return panel ? [...panel.querySelectorAll('[class*=artifact-item]')].map(e => t(e).slice(0,90)) : [];
  })()`;

  const hasCreateButtons = () => evaluate(`(() => [...document.querySelectorAll('button,[role=button]')]
    .filter(b => /create-artifact/.test((b.className||'').toString())).length)()`);

  // 1) leave any artifact viewer; reload if the panel has no create buttons
  let reloaded = false;
  const panelState = await evaluate(`(async () => {
    const btn = [...document.querySelectorAll('button,[role=button]')]
      .find(b => /关闭网页查看器/.test(b.getAttribute('aria-label') || ''));
    if (btn) { btn.click(); await new Promise(r => setTimeout(r, 3000)); return 'closed-viewer'; }
    return [...document.querySelectorAll('button,[role=button]')]
      .some(b => /create-artifact/.test((b.className||'').toString())) ? 'already-list' : 'needs-reload';
  })()`);
  console.log('PANEL:', panelState);
  if (panelState === 'needs-reload') {
    await send('Page.enable');
    await send('Page.reload', { ignoreCache: false });
    await new Promise((r) => setTimeout(r, 12000));
    reloaded = true;
    console.log('CREAT_BUTTONS_AFTER_RELOAD:', await hasCreateButtons());
  }

  // 2) isolation must be re-applied after a reload, because the reload resets it
  if (reloaded) {
    const iso = await evaluate(`(async () => {
      const boxes = () => [...document.querySelectorAll('input[type=checkbox]')]
        .filter(c => /^选择/.test(c.getAttribute('aria-label') || ''));
      const clickLabel = (lb) => {
        const box = boxes().find(c => c.getAttribute('aria-label') === lb);
        if (!box) return 'gone';
        (box.closest('label') || box).click();
        return 'clicked';
      };
      for (let i = 0; i < 8; i++) {
        const cur = boxes();
        const victim = cur.find(s => s.checked && /^选择“/.test(s.getAttribute('aria-label')) && !s.getAttribute('aria-label').includes(${JSON.stringify(keepSource)}));
        const all = cur.find(s => /选择所有来源/.test(s.getAttribute('aria-label')) && s.checked);
        if (!victim && !all) break;
        clickLabel(victim ? victim.getAttribute('aria-label') : all.getAttribute('aria-label'));
        await new Promise(r => setTimeout(r, 1200));
      }
      const cur = boxes();
      const mine = cur.find(s => s.getAttribute('aria-label').includes(${JSON.stringify(keepSource)}));
      if (mine && !mine.checked) { clickLabel(mine.getAttribute('aria-label')); await new Promise(r => setTimeout(r, 1200)); }
      const checked = boxes().filter(s => s.checked && /^选择“/.test(s.getAttribute('aria-label')));
      return { n: checked.length, label: checked[0] ? checked[0].getAttribute('aria-label') : null };
    })()`);
    console.log('REISOLATED:', JSON.stringify(iso));
    if (!iso || iso.n !== 1) { console.error('GEN_FAIL: could not re-isolate to one source after reload'); process.exit(1); }
  }

  const before = await evaluate(ARTIFACTS);
  console.log('ARTIFACTS_BEFORE:', JSON.stringify(before));

  // 3) open the create dialog
  const opened = await evaluate(`(async () => {
    const t = (e) => (e && e.textContent || '').replace(/\\s+/g,' ').trim();
    const btn = [...document.querySelectorAll('button,[role=button]')]
      .find(b => t(b).includes(${JSON.stringify(label)}) && /create-artifact/.test((b.className||'').toString()));
    if (!btn) return 'no create button';
    btn.click();
    await new Promise(r => setTimeout(r, 3500));
    return 'dialog-open';
  })()`);
  console.log('STEP_OPEN:', opened);
  if (!/dialog-open/.test(String(opened))) { console.error('GEN_FAIL: ' + opened); process.exit(1); }

  // 4) settings + isolation assertion, then fill and submit
  const result = await evaluate(`(async () => {
    const t = (e) => (e && e.textContent || '').replace(/\\s+/g,' ').trim();
    const dlg = [...document.querySelectorAll('[role=dialog]')].filter(d => d.getBoundingClientRect().width > 0).pop();
    if (!dlg) return {ok:false, why:'no dialog'};

    const pick = (want) => {
      const els = [...dlg.querySelectorAll('*')].filter(e => t(e) === want);
      const el = els.length ? els[els.length - 1] : null;
      if (!el) return 'not-found';
      const clickable = el.closest('button,[role=radio],[role=option],[class*=option],[class*=card],[class*=tile]') || el;
      const sel = clickable.getAttribute('aria-checked') === 'true' || /selected|active/.test((clickable.className||'').toString());
      if (!sel) { clickable.click(); return 'clicked'; }
      return 'already';
    };

    const srcNow = () => (t(dlg).match(/(\\d+)\\s*个来源/) || [])[1];

    let settings = {};
    if (${JSON.stringify(type)} === 'infographic') {
      settings.lang = pick('中文（简体）');
      await new Promise(r => setTimeout(r, 600));
      settings.orient = pick('横向');
      await new Promise(r => setTimeout(r, 600));
      settings.style = pick('手绘笔记');
      await new Promise(r => setTimeout(r, 600));
      settings.detail = pick('详细');
    } else if (${JSON.stringify(type)} === 'slides') {
      // The language control is a mat-select: CLICKING it opens an overlay that covers
      // the submit button, and the run then fails with a misleading "no generate
      // button" (observed 2026-09-13). The defaults are already 详细演示文稿 + 中文（简体）,
      // so verify them instead of clicking.
      const text = t(dlg);
      settings.format = /详细演示文稿/.test(text) ? 'verified' : 'MISSING';
      settings.lang = /中文（简体）/.test(text) ? 'verified' : 'MISSING';
      if (settings.lang === 'MISSING') {
        return {ok:false, why:'slide language is not 中文（简体）; refusing to generate', settings};
      }
    }
    await new Promise(r => setTimeout(r, 1200));

    const src = srcNow();
    if (src !== '1') return {ok:false, why:'dialog is grounded in ' + src + ' source(s), refusing to generate', settings};

    const ta = dlg.querySelector('textarea');
    if (!ta) return {ok:false, why:'no prompt textarea', settings};
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    setter.call(ta, ${JSON.stringify(prompt)});
    ta.dispatchEvent(new Event('input', {bubbles:true}));
    ta.dispatchEvent(new Event('change', {bubbles:true}));
    await new Promise(r => setTimeout(r, 1000));

    // Look inside the dialog first, then document-wide: clicking a Material control can
    // re-render and detach the node we were holding.
    let gen = [...dlg.querySelectorAll('button')].find(b => /立即生成/.test(t(b)));
    if (!gen) gen = [...document.querySelectorAll('button')].find(b => /立即生成/.test(t(b)) && b.getBoundingClientRect().width > 0);
    if (!gen) return {ok:false, why:'no generate button', settings};
    gen.click();
    await new Promise(r => setTimeout(r, 4000));
    return {ok:true, settings, sourceCount: src};
  })()`);
  console.log('SUBMIT:', JSON.stringify(result));
  if (!result || !result.ok) { console.error('GEN_FAIL: ' + JSON.stringify(result)); process.exit(1); }

  // 5) confirm generation actually started
  let after = before;
  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    after = await evaluate(ARTIFACTS);
    if (after.some((a) => /正在生成|生成中|Generating/i.test(a))) break;
    if (after.length > before.length) break;
  }
  console.log('ARTIFACTS_AFTER:', JSON.stringify(after));
  const started = after.some((a) => /正在生成|生成中|Generating/i.test(a));
  console.log(started ? 'GENERATION_STARTED' : 'GEN_UNCONFIRMED');
  ws.close();
  process.exit(started ? 0 : 1);
})().catch((e) => { console.error('GEN_FAIL:', e.message); process.exit(1); });
