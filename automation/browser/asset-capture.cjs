// Capture the real bytes of a NotebookLM artifact through the browser's own session.
//
// Why this exists: artifact images (infographic) are served from
// lh3.googleusercontent.com and require the signed-in session. curl yields the Google
// sign-in page; in-page fetch() is blocked by CSP/CORS; canvas readback is blocked
// because the image is cross-origin without CORS; and browser download events stall in
// headless Chrome. CDP Fetch interception sidesteps all of that: the browser performs
// the request itself and we read the response stream.
//
// Two behaviours of this endpoint that the implementation must respect:
//   1. The asset URL 302-redirects (`/notebooklm/...` -> `lh3.google.com/rd-notebooklm`
//      -> `lh3.googleusercontent.com/rd-notebooklm/...`) under one requestId. Capture on
//      the final 200, not on the redirects.
//   2. Fetch.getResponseBody / Network.getResponseBody deadlock on this multi-MB body.
//      Stream it instead: Fetch.takeResponseBodyAsStream + IO.read.
//
// Usage:
//   LAG_CDP_PORT=9222 node asset-capture.cjs <asset-url> <out-file>
//
// The page must already be showing the artifact (so img-src CSP allows that host).
// Never prints the URL query string or any credential.
const fs = require('fs');
const crypto = require('crypto');

const port = process.env.LAG_CDP_PORT || '9222';
const url = process.argv[2];
const outFile = process.argv[3];
const debug = process.env.LAG_CAPTURE_DEBUG === '1';
const log = (...a) => { if (debug) console.error('[capture]', ...a); };

if (!url || !outFile) {
  console.error('usage: node asset-capture.cjs <asset-url> <out-file>');
  process.exit(2);
}

(async () => {
  const startedAt = Date.now();
  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = list.find((t) => t.type === 'page' && t.url.includes('notebook.google.com'))
    || list.find((t) => t.type === 'page');
  if (!page) { console.error('NO_PAGE_TARGET'); process.exit(1); }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res);
    ws.addEventListener('error', rej);
    setTimeout(() => rej(new Error('ws open timeout')), 15000);
  });

  let id = 0;
  const pending = new Map();
  const send = (method, params = {}, t = 45000) => new Promise((resolve, reject) => {
    const msgId = ++id;
    const timer = setTimeout(() => { pending.delete(msgId); reject(new Error('cdp timeout ' + method)); }, t);
    pending.set(msgId, { resolve, reject, timer });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

  let capturing = false;   // re-entry guard
  let captured = false;    // set only after bytes are on disk
  let captureError = null;
  const pauses = [];
  ws.addEventListener('message', async (ev) => {
    let msg;
    try { msg = JSON.parse(typeof ev.data === 'string' ? ev.data : Buffer.from(ev.data).toString()); } catch { return; }
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      clearTimeout(p.timer);
      if (msg.error) p.reject(new Error(msg.error.message)); else p.resolve(msg.result);
      return;
    }
    if (msg.method !== 'Fetch.requestPaused') return;

    const { requestId, request, responseStatusCode } = msg.params;
    const pausedUrl = (request && request.url) || '';
    pauses.push(`${responseStatusCode} ${pausedUrl.slice(0, 48)}`);

    if (responseStatusCode === 200 && /^https:\/\/lh3\./.test(pausedUrl) && !capturing && !captured) {
      capturing = true;
      try {
        const st = await send('Fetch.takeResponseBodyAsStream', { requestId });
        const handle = st.stream;
        const chunks = [];
        let eof = false;
        let total = 0;
        while (!eof) {
          const r = await send('IO.read', { handle, size: 262144 }, 30000);
          if (r.data) {
            const b = Buffer.from(r.data, r.base64Encoded ? 'base64' : 'utf8');
            chunks.push(b);
            total += b.length;
          }
          eof = r.eof;
          if (total > 40 * 1024 * 1024) break;
        }
        try { await send('IO.close', { handle }, 5000); } catch { /* best effort */ }
        const buf = Buffer.concat(chunks);
        fs.writeFileSync(outFile, buf);
        captured = true;
        log('streamed in', chunks.length, 'chunks after', Date.now() - startedAt, 'ms');
        console.log('CAPTURED_BYTES:', buf.length);
        console.log('SHA256:', crypto.createHash('sha256').update(buf).digest('hex'));
        console.log('OUT:', outFile);
      } catch (e) {
        captureError = e;
      }
    }

    try { await send('Fetch.continueRequest', { requestId }); } catch { /* already continued */ }
  });

  await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });
  await send('Fetch.enable', {
    patterns: [
      { urlPattern: '*lh3.googleusercontent.com*', requestStage: 'Response' },
      { urlPattern: '*lh3.google.com*', requestStage: 'Response' },
    ],
  });

  // An <img> load is subject to img-src (already allowed because the artifact is on
  // screen), unlike fetch() which CSP connect-src blocks.
  const trigger = `(() => { const i = new Image(); i.src = ${JSON.stringify(url)}; window.__lagCaptureImg = i; return 'triggered'; })()`;
  await send('Runtime.evaluate', { expression: trigger, returnByValue: true });

  const deadline = Date.now() + 90000;
  while (!captured && !captureError && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 500));
  }
  log('pauses:', JSON.stringify(pauses));
  try { await send('Fetch.disable', {}, 8000); } catch { /* ignore */ }

  if (captureError) {
    console.error('CAPTURE_FAIL:', captureError.message);
    ws.close();
    process.exit(1);
  }
  if (!captured) {
    console.error('CAPTURE_FAIL: no 200 response body captured. pauses=' + JSON.stringify(pauses));
    ws.close();
    process.exit(1);
  }
  ws.close();
  process.exit(0);
})().catch((e) => { console.error('CAPTURE_FAIL:', e.message); process.exit(1); });
