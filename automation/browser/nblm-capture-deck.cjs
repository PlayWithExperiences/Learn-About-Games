// Capture a NotebookLM slide deck's real PPTX bytes through the page's own network stack.
//
// Why this exists: the Studio card's *download* route (viewer ⋮ -> 下载 PowerPoint) is a
// browser-process download navigation. On this machine that transfer repeatedly stalls a
// few KB in and then kills the browser (observed 2026-09-15: stalls at 0 / 16,685 / 16,686
// / 31,408 / 39,985 B, every attempt, headless and headed, including a deck that downloaded
// fine the day before). A local-file download through the same browser completes, so the
// download machinery is healthy — it is that asset's transfer that dies.
//
// The working route is the same one asset-capture.cjs uses for images: let the page issue
// the request and stream the response out of CDP.
//   1. Ask the browser to *deny* downloads but report them, open the card and click the
//      "下载 PowerPoint (.pptx)" menu item. `Browser.downloadWillBegin` then hands us the
//      exact signed asset URL and the browser cancels the transfer — no partial file, no
//      browser crash.
//   2. Re-request that URL from inside the page (an <img> load, which img-src allows) with
//      CDP Fetch interception on the response stage, and stream the body to disk.
//
// The URL query string is a signed link: it is never printed, logged or stored.
//
// Usage:
//   LAG_CDP_PORT=9222 node nblm-capture-deck.cjs "<card title fragment>" <out-file> [--timeout-sec=240]
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const port = process.env.LAG_CDP_PORT || '9222';
const cardTitle = process.argv[2];
const outFile = process.argv[3];
const timeoutSec = Number((process.argv.find((a) => a.startsWith('--timeout-sec=')) || '').split('=')[1] || 240);
// A new card can share its exact title with a historical card (2026-09-23); --match-n
// opens the Nth title-matching card (1-based, default 1 = previous behaviour).
const matchN = Math.max(1, Number((process.argv.find((a) => a.startsWith('--match-n=')) || '').split('=')[1] || 1));

if (cardTitle === '--verify') {
  // Validation-only entry point, used by tests: a saved HTML error page or a truncated
  // container must never be accepted as a deck.
  const target = outFile;
  if (!target || !fs.existsSync(target)) { console.error('usage: node nblm-capture-deck.cjs --verify <file>'); process.exit(2); }
  const result = verifyPptx(target);
  console.log(JSON.stringify(result));
  process.exit(result.zip_signature && result.membersPresent && result.bytes >= 100000 ? 0 : 1);
}

if (!cardTitle || !outFile) {
  console.error('usage: node nblm-capture-deck.cjs "<card title fragment>" <out-file> [--timeout-sec=240]');
  process.exit(2);
}

const host4 = (u) => { try { return new URL(u).host; } catch { return 'unparsable'; } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.addEventListener('open', () => {
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
      const send = (method, params = {}, t = 45000) => new Promise((res, rej) => {
        const msgId = ++id;
        const timer = setTimeout(() => { pending.delete(msgId); rej(new Error('cdp timeout ' + method)); }, t);
        pending.set(msgId, { resolve: res, reject: rej, timer });
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
      resolve({ ws, send });
    });
    ws.addEventListener('error', () => reject(new Error('ws connection failed')));
    setTimeout(() => reject(new Error('ws open timeout')), 15000);
  });
}

// A PPTX is a ZIP container; both the signature and one required member are checked so a
// saved HTML error page can never pass as a deck.
function verifyPptx(file) {
  const buf = fs.readFileSync(file);
  const zip = buf.length > 4 && buf[0] === 0x50 && buf[1] === 0x4b && (buf[2] === 0x03 || buf[2] === 0x05 || buf[2] === 0x07);
  const text = buf.slice(0, 4096).toString('latin1');
  const members = buf.toString('latin1').includes('[Content_Types].xml') && text.includes('ppt/');
  return { bytes: buf.length, zip_signature: zip, membersPresent: members, sha256: crypto.createHash('sha256').update(buf).digest('hex') };
}

(async () => {
  const version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
  if (!version.webSocketDebuggerUrl) { console.error('DECK_FAIL: no browser websocket'); process.exit(1); }
  const browser = await connect(version.webSocketDebuggerUrl);
  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const pageInfo = list.find((t) => t.type === 'page' && t.url.includes('notebook.google.com'))
    || list.find((t) => t.type === 'page');
  if (!pageInfo) { console.error('DECK_FAIL: no notebook page target'); process.exit(1); }
  const page = await connect(pageInfo.webSocketDebuggerUrl);

  const evaluate = async (expression, t = 60000) => {
    const r = await page.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, t);
    if (r.exceptionDetails) throw new Error('page eval failed: ' + (r.exceptionDetails.text || ''));
    return r.result.value;
  };

  let assetUrl = null;
  // Collect every download the menu produces and prefer the one that names a .pptx.
  // Taking the FIRST event blindly captured a 128x128 PNG thumbnail on 2026-09-18: the
  // capture then "succeeded" at fetching bytes and only failed the container check, which
  // reads like a network problem instead of a wrong-event problem.
  const downloadEvents = [];
  browser.ws.addEventListener('message', (ev) => {
    let m;
    try { m = JSON.parse(typeof ev.data === 'string' ? ev.data : Buffer.from(ev.data).toString()); } catch { return; }
    if (m.method === 'Browser.downloadWillBegin') {
      downloadEvents.push({ url: m.params.url, file: m.params.suggestedFilename || '' });
    }
  });

  const pickAsset = () => {
    const pptx = downloadEvents.filter((d) => /\.pptx$/i.test(d.file));
    if (pptx.length) return pptx[pptx.length - 1];
    const notImage = downloadEvents.filter((d) => !/\.(png|jpe?g|webp|gif)$/i.test(d.file));
    return notImage.length ? notImage[notImage.length - 1] : null;
  };

  // Deny the transfer itself: the URL is all we need from this step, and letting it start
  // is what stalls the browser on this machine.
  await browser.send('Browser.setDownloadBehavior', {
    behavior: 'deny', eventsEnabled: true, downloadPath: path.join(os.tmpdir(), 'lag-deck-denied'),
  });

  try {
    try {
      execFileSync(process.execPath, [path.join(__dirname, 'nblm-studio-list.cjs')],
        { env: process.env, stdio: 'pipe', timeout: 120000 });
    } catch { /* the card lookup below reports the real problem */ }

    const opened = await evaluate(`(async () => {
      const t = (e) => (e && e.textContent || '').replace(/\\s+/g,' ').trim();
      const back = [...document.querySelectorAll('button,[role=button]')]
        .find(b => /关闭网页查看器/.test(b.getAttribute('aria-label') || ''));
      if (back) { back.click(); await new Promise(r => setTimeout(r, 3000)); }
      let panel = document.querySelector('studio-panel');
      const pick = () => {
        const matches = panel ? [...panel.querySelectorAll('[class*=artifact-item]')]
          .filter(e => t(e).includes(${JSON.stringify(cardTitle)})) : [];
        if (!matches.length) return { card: null, error: 'card not found' };
        if (matches.length < ${matchN}) return { card: null, error: 'only ' + matches.length + ' card(s) match title' };
        return { card: matches[${matchN} - 1], error: null };
      };
      let picked = pick();
      let card = picked.card;
      if (!card && picked.error === 'card not found') {
        const x = [...document.querySelectorAll('button,[role=button]')]
          .find(b => /^(关闭|close)$/i.test((b.getAttribute('aria-label')||'').trim()));
        if (x) { x.click(); await new Promise(r => setTimeout(r, 3000)); }
        panel = document.querySelector('studio-panel');
        picked = pick();
        card = picked.card;
      }
      if (!card) return picked.error;
      if (/正在生成|生成中/.test(t(card))) return 'still generating';
      const btn = card.querySelector('button.artifact-stretched-button') || card.querySelector('button');
      if (!btn) return 'no open button';
      btn.click();
      await new Promise(r => setTimeout(r, 10000));
      return 'opened';
    })()`);
    console.log('OPEN:', opened);
    if (opened !== 'opened') { console.error('DECK_FAIL: ' + opened); process.exit(1); }

    const clicked = await evaluate(`(async () => {
      const t = (e) => (e && e.textContent || '').replace(/\\s+/g,' ').trim();
      const more = [...document.querySelectorAll('button,[role=button]')]
        .find(b => /更多选项/.test(b.getAttribute('aria-label') || ''));
      if (!more) return 'no more button';
      more.click();
      await new Promise(r => setTimeout(r, 2500));
      const item = [...document.querySelectorAll('[role=menuitem],.mdc-menu-item,.mat-mdc-menu-item')]
        .find(e => /PowerPoint|\\.pptx/i.test(t(e)));
      if (!item) return 'no pptx menu item';
      item.click();
      return 'clicked';
    })()`);
    console.log('MENU:', clicked);
    if (clicked !== 'clicked') { console.error('DECK_FAIL: ' + clicked); process.exit(1); }

    const urlDeadline = Date.now() + Math.min(timeoutSec, 90) * 1000;
    while (!pickAsset() && Date.now() < urlDeadline) await sleep(500);
    const asset = pickAsset();
    if (!asset) { console.error('DECK_FAIL: the browser reported no download for this card'); process.exit(1); }
    assetUrl = asset.url;
    console.log('ASSET_HOST:', host4(assetUrl), '| file:', asset.file,
                '| events:', JSON.stringify(downloadEvents.map((d) => d.file)));
  } finally {
    try { await browser.send('Browser.setDownloadBehavior', { behavior: 'default', eventsEnabled: false }); } catch { /* best effort */ }
  }

  // Stream the bytes through the page's network stack (page-level Fetch interception).
  let captured = null;
  let captureError = null;
  const pauses = [];
  page.ws.addEventListener('message', async (ev) => {
    let msg;
    try { msg = JSON.parse(typeof ev.data === 'string' ? ev.data : Buffer.from(ev.data).toString()); } catch { return; }
    if (msg.method !== 'Fetch.requestPaused') return;
    const { requestId, request, responseStatusCode, responseHeaders } = msg.params;
    const ctype = ((responseHeaders || []).find((h) => /^content-type$/i.test(h.name)) || {}).value || '';
    pauses.push(`${responseStatusCode} ${host4((request && request.url) || '')}`);
    if (responseStatusCode === 200 && !captured && !captureError) {
      try {
        const st = await page.send('Fetch.takeResponseBodyAsStream', { requestId });
        const handle = st.stream;
        const chunks = [];
        let eof = false;
        let total = 0;
        while (!eof) {
          const r = await page.send('IO.read', { handle, size: 262144 }, 60000);
          if (r.data) {
            const b = Buffer.from(r.data, r.base64Encoded ? 'base64' : 'utf8');
            chunks.push(b);
            total += b.length;
          }
          eof = r.eof;
          if (total > 200 * 1024 * 1024) break;
        }
        try { await page.send('IO.close', { handle }, 5000); } catch { /* best effort */ }
        const buf = Buffer.concat(chunks);
        fs.mkdirSync(path.dirname(path.resolve(outFile)), { recursive: true });
        fs.writeFileSync(outFile, buf);
        captured = { bytes: buf.length, content_type: ctype };
      } catch (e) {
        captureError = e;
      }
    }
    try { await page.send('Fetch.continueRequest', { requestId }); } catch { /* already continued */ }
  });

  await page.send('Network.enable');
  await page.send('Network.setCacheDisabled', { cacheDisabled: true });
  await page.send('Fetch.enable', {
    patterns: [
      { urlPattern: '*contribution.usercontent.google.com*', requestStage: 'Response' },
      { urlPattern: '*usercontent.google.com*', requestStage: 'Response' },
      { urlPattern: '*lh3*', requestStage: 'Response' },
    ],
  });
  // An <img> load is subject to img-src (which already allows this host on the notebook
  // page), unlike fetch() whose CSP connect-src rejects it.
  await evaluate(`(() => { const i = new Image(); i.src = ${JSON.stringify(assetUrl)}; window.__lagDeckImg = i; return 'triggered'; })()`);

  const capDeadline = Date.now() + timeoutSec * 1000;
  while (!captured && !captureError && Date.now() < capDeadline) await sleep(500);
  try { await page.send('Fetch.disable', {}, 8000); } catch { /* ignore */ }

  if (captureError) { console.error('DECK_FAIL: capture error: ' + captureError.message); process.exit(1); }
  if (!captured) {
    console.error('DECK_FAIL: no 200 response body captured; pauses=' + JSON.stringify(pauses.slice(0, 8)));
    process.exit(1);
  }
  const check = verifyPptx(outFile);
  if (!check.zip_signature || !check.membersPresent || check.bytes < 100000) {
    console.error('DECK_FAIL: captured bytes are not a valid PPTX: ' + JSON.stringify(check));
    process.exit(1);
  }
  // Best effort: leave the Studio panel in list mode. A viewer left open hides the create
  // buttons and makes the next item's pre-claim deck probe report a false "unavailable".
  try {
    execFileSync(process.execPath, [path.join(__dirname, 'nblm-studio-list.cjs')],
      { env: process.env, stdio: 'pipe', timeout: 120000 });
  } catch { /* the capture already succeeded; this is housekeeping */ }
  console.log('CAPTURED_BYTES:', check.bytes);
  console.log('CONTENT_TYPE:', captured.content_type);
  console.log('SHA256:', check.sha256);
  console.log('OUT:', outFile);
  console.log('CAPTURE_OK');
  process.exit(0);
})().catch((e) => { console.error('DECK_FAIL:', e.message); process.exit(1); });
