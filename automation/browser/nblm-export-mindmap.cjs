// Open a NotebookLM mind map, expand every node, verify the expansion, and render it
// to a PNG.
//
// The mind map is the contract's hard gate, so this script refuses to export unless
// the DOM proves the expansion: zero remaining ">" (collapsed) affordances, at least
// three levels below the root, and a render that stops changing.
//
// Route: the viewer is an OOPIF (*.scf.usercontent.goog, MindmapApp) whose
// "Expand all nodes" toolbar button is the v2 contract path. The render is produced by
// extracting the SVG with computed styles inlined and rasterising it in a standalone
// headless Chrome (a viewer download stalls in headless, and this adapter has no
// pageAssets/bundle capability).
//
// Usage:
//   LAG_CDP_PORT=9222 node nblm-export-mindmap.cjs "<card title fragment>" <out.png> [targetWidth]
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const port = process.env.LAG_CDP_PORT || '9222';
const cardTitle = process.argv[2];
const outPng = process.argv[3];
const targetWidth = Number(process.argv[4] || 2664);

if (!cardTitle || !outPng) {
  console.error('usage: node nblm-export-mindmap.cjs "<card title fragment>" <out.png> [targetWidth]');
  process.exit(2);
}

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    ws.addEventListener('open', () => resolve(ws));
    ws.addEventListener('error', reject);
    setTimeout(() => reject(new Error('ws open timeout')), 15000);
  });
}

function makeSend(ws) {
  let id = 0;
  const pending = new Map();
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
  return (method, params = {}, t = 60000) => new Promise((resolve, reject) => {
    const msgId = ++id;
    const timer = setTimeout(() => { pending.delete(msgId); reject(new Error('cdp timeout ' + method)); }, t);
    pending.set(msgId, { resolve, reject, timer });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
}

(async () => {
  // ---- 1) open the card in the notebook tab ----
  let list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = list.find((t) => t.type === 'page' && t.url.includes('notebook.google.com'));
  if (!page) { console.error('NO_PAGE_TARGET'); process.exit(1); }
  const pageWs = await connect(page.webSocketDebuggerUrl);
  const pageSend = makeSend(pageWs);
  const pageEval = async (expression) => {
    const r = await pageSend('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error('page eval failed: ' + (r.exceptionDetails.text || ''));
    return r.result.value;
  };

  // Normalise the Studio panel to list mode first. The image viewer has no
  // 关闭网页查看器 control (only an ✕), so a viewer left open by a previous export makes
  // the card lookup fail with a misleading "card not found".
  try {
    execFileSync(process.execPath, [path.join(__dirname, 'nblm-studio-list.cjs')],
      { env: process.env, stdio: 'pipe', timeout: 120000 });
  } catch { /* list tool exits non-zero only when it found nothing; carry on and report below */ }
  list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();

  const opened = await pageEval(`(async () => {
    const t = (e) => (e && e.textContent || '').replace(/\\s+/g,' ').trim();
    const panel = document.querySelector('studio-panel');
    if (!panel) return 'no studio panel';
    const card = [...panel.querySelectorAll('[class*=artifact-item]')]
      .find(e => t(e).includes(${JSON.stringify(cardTitle)}));
    if (!card) return 'card not found';
    if (/正在生成|生成中/.test(t(card))) return 'still generating';
    const btn = card.querySelector('button.artifact-stretched-button') || card.querySelector('button');
    if (!btn) return 'no open button';
    btn.click();
    await new Promise(r => setTimeout(r, 9000));
    return 'opened';
  })()`);
  console.log('OPEN:', opened);
  if (opened !== 'opened') { console.error('MINDMAP_FAIL: ' + opened); process.exit(1); }

  // ---- 2) talk to the OOPIF viewer ----
  list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const oopif = list.find((t) => (t.url || '').includes('scf.usercontent'));
  if (!oopif) { console.error('MINDMAP_FAIL: no OOPIF viewer target'); process.exit(1); }
  const vWs = await connect(oopif.webSocketDebuggerUrl);
  const vSend = makeSend(vWs);
  const vEval = async (expression) => {
    const r = await vSend('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error('viewer eval failed: ' + (r.exceptionDetails.text || ''));
    return r.result.value;
  };

  const expanded = await vEval(`(async () => {
    const btn = document.querySelector('button[aria-label="Expand all nodes"]');
    if (!btn) {
      const already = document.querySelector('button[aria-label="Collapse all nodes"]');
      return already ? 'already-expanded' : 'no expand button';
    }
    btn.click();
    await new Promise(r => setTimeout(r, 7000));
    return 'clicked';
  })()`);
  console.log('EXPAND:', expanded);
  if (/no expand button/.test(String(expanded))) { console.error('MINDMAP_FAIL: ' + expanded); process.exit(1); }

  // ---- 3) verify the expansion, then extract ----
  const verify = await vEval(`(async () => {
    const svg = document.querySelector('svg');
    if (!svg) return {err:'no svg'};
    const count = () => svg.querySelectorAll('text,tspan').length;
    const first = count();
    await new Promise(r => setTimeout(r, 4000));
    const second = document.querySelector('svg').querySelectorAll('text,tspan').length;
    const nodes = [...svg.querySelectorAll('text,tspan')].map(t => {
      const r = t.getBoundingClientRect();
      return { t: (t.textContent||'').trim(), x: Math.round(r.x) };
    }).filter(n => n.t);
    const expandAffordances = nodes.filter(n => n.t === '>').length;
    const content = nodes.filter(n => n.t !== '>' && n.t !== '<');
    const columns = [...new Set(content.map(n => n.x))].sort((a,b)=>a-b);

    const clone = svg.cloneNode(true);
    const src = [svg, ...svg.querySelectorAll('*')];
    const dst = [clone, ...clone.querySelectorAll('*')];
    const keep = ['fill','fill-opacity','stroke','stroke-width','stroke-opacity','font-family','font-size','font-weight','font-style','opacity','color','text-anchor','dominant-baseline','letter-spacing'];
    for (let i = 0; i < src.length; i++) {
      const cs = getComputedStyle(src[i]);
      let style = '';
      for (const k of keep) { const v = cs.getPropertyValue(k); if (v) style += k + ':' + v + ';'; }
      dst[i].setAttribute('style', style);
      dst[i].removeAttribute('class');
    }
    [...clone.querySelectorAll('text,tspan')].forEach(t => {
      const s = (t.textContent || '').trim();
      if (s === '<' || s === '>') t.remove();
    });
    const bb = svg.getBBox();
    clone.setAttribute('viewBox', bb.x + ' ' + bb.y + ' ' + bb.width + ' ' + bb.height);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    return {
      contentNodes: content.length,
      expandAffordances,
      columns: columns.length,
      renderStable: first === second,
      counts: [first, second],
      bbox: {w: bb.width, h: bb.height},
      svg: clone.outerHTML
    };
  })()`);
  if (!verify || verify.err) { console.error('MINDMAP_FAIL: ' + JSON.stringify(verify)); process.exit(1); }

  console.log('VERIFY:', JSON.stringify({
    contentNodes: verify.contentNodes,
    expandAffordances: verify.expandAffordances,
    columns: verify.columns,
    renderStable: verify.renderStable,
    counts: verify.counts,
  }));

  // contract gate: no collapsed nodes, at least 3 levels below the root
  const depthBelowRoot = verify.columns - 1;
  if (verify.expandAffordances !== 0) { console.error('MINDMAP_FAIL: ' + verify.expandAffordances + ' node(s) still collapsed'); process.exit(1); }
  if (depthBelowRoot < 3) { console.error('MINDMAP_FAIL: depth ' + depthBelowRoot + ' below root, need >= 3'); process.exit(1); }
  if (!verify.renderStable) { console.error('MINDMAP_FAIL: render still changing'); process.exit(1); }

  // ---- 4) rasterise ----
  const scale = targetWidth / verify.bbox.w;
  const height = Math.round(verify.bbox.h * scale);
  const svgWithSize = verify.svg.replace(
    /<svg([^>]*?)width="100%"\s+height="100%"/,
    `<svg$1width="${targetWidth}" height="${height}"`
  ).replace('<svg', `<svg width="${targetWidth}" height="${height}"`);
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#fff}svg{display:block}</style></head><body>${svgWithSize}</body></html>`;
  const htmlPath = outPng.replace(/\.png$/, '.html');
  fs.writeFileSync(htmlPath, html);

  execFileSync(CHROME, [
    '--headless', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=1', '--virtual-time-budget=8000',
    `--screenshot=${outPng}`, `--window-size=${targetWidth},${height}`,
    'file://' + htmlPath,
  ], { stdio: 'pipe' });

  const buf = fs.readFileSync(outPng);
  const isPng = buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const dims = isPng ? `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}` : 'not-png';
  console.log('RENDERED:', outPng, buf.length, 'bytes', dims);
  console.log('DEPTH_BELOW_ROOT:', depthBelowRoot);
  if (!isPng || buf.length < 50000) { console.error('MINDMAP_FAIL: render looks wrong'); process.exit(1); }
  console.log('MINDMAP_OK');
  process.exit(0);
})().catch((e) => { console.error('MINDMAP_FAIL:', e.message); process.exit(1); });
