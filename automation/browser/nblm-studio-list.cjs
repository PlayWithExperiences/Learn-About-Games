// Ensure the Studio panel is showing its artifact LIST, then print it.
//
// Different artifact viewers close differently: the mind-map viewer exposes a
// 关闭网页查看器 button, the image viewer only an ✕, and the slide-deck viewer neither
// reliably. So try the known controls in order and fall back to a page reload, which
// always restores list mode (notebook state is server-side).
//
// `--reload` forces a real page reload before reading. The panel can keep rendering an
// old snapshot — on 2026-09-17 it still showed "正在生成信息图…" twelve minutes after the
// artifact list had been read back with all three cards finished — and only a reload has
// ever cleared that state. Generation itself is server-side, so reloading cannot cancel
// an artifact; it does reset the source-panel selection to ALL sources.
//
// Usage: LAG_CDP_PORT=9222 node nblm-studio-list.cjs [--json] [--reload] [--settle-ms=N]
const port = process.env.LAG_CDP_PORT || '9222';
const asJson = process.argv.includes('--json');
const forceReload = process.argv.includes('--reload');
const settleMs = Number((process.argv.find((a) => a.startsWith('--settle-ms=')) || '').split('=')[1]) || 12000;

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

  // A panel that is mounted but not rendering its list answers with zero cards, which is a
  // different fact from "the notebook has no artifacts". Report which one it is so the
  // caller never has to guess (2026-09-17: a wait read an empty list for its whole cap and
  // reported "no card of this type appeared" while the finished card was in the notebook).
  const STATE = `(() => {
    const panel = document.querySelector('studio-panel');
    const create = [...document.querySelectorAll('button,[role=button]')]
      .filter(b => /create-artifact/.test((b.className||'').toString())).length;
    return {panel: !!panel, createButtons: create, ready: document.readyState};
  })()`;

  const state = async () => {
    try { return await evaluate(STATE); } catch { return {panel: false, createButtons: 0, ready: 'unknown'}; }
  };

  // The panel renders progressively after a reload; a single sample right after the load
  // can read an empty list and look like "no artifacts".
  const readItems = async (waitMs = 0) => {
    const until = Date.now() + waitMs;
    let out = [];
    do {
      out = await evaluate(ITEMS);
      if (out.length) return out;
      await new Promise((r) => setTimeout(r, 2500));
    } while (Date.now() < until);
    return out;
  };

  const reloadPage = async (settle) => {
    await send('Page.enable');
    await send('Page.reload', { ignoreCache: false });
    await new Promise((r) => setTimeout(r, settle));
  };

  let items = [];
  let how = 'already-list';
  let reloaded = false;

  if (forceReload) {
    await reloadPage(settleMs);
    how = 'forced-reload';
    reloaded = true;
  }

  items = await readItems(forceReload ? 40000 : 0);

  // An empty list means the panel is not showing its artifacts: close a leftover viewer,
  // and if that does not help, reload — whatever the reason we got here.
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
    how = how === 'already-list' ? closed : how + '+' + closed;
    items = await readItems(15000);
  }

  if (!items.length) {
    await reloadPage(settleMs);
    how = how.includes('reload') ? how : how + '+reloaded';
    reloaded = true;
    items = await readItems(45000);
  }

  const panelState = await state();
  if (asJson) {
    console.log(JSON.stringify({ how, reloaded, panel: panelState.panel,
                                 createButtons: panelState.createButtons,
                                 count: items.length, artifacts: items }));
  } else {
    console.log('HOW:', how, '| panel:', panelState.panel, '| create:', panelState.createButtons,
                '| artifacts:', items.length);
    for (const a of items) console.log('  -', a);
  }
  ws.close();
  process.exit(items.length ? 0 : 1);
})().catch((e) => { console.error('STUDIO_LIST_FAIL:', e.message); process.exit(1); });
