import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 3338;
const CDP_PORT = 9227;
const SITE_DIR = path.resolve('site');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(SITE_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
});

await new Promise(r => server.listen(PORT, r));

function findChrome() {
  const candidates = [
    process.env.CHROME_BIN,
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ];
  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c;
  }
  return null;
}

const chromePath = findChrome();
if (!chromePath) {
  console.error('[TEST-MAP-PINS] Aucun binaire Chrome trouve.');
  server.close();
  process.exit(1);
}

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${CDP_PORT}`,
  '--disable-gpu',
  '--no-first-run'
]);

for (let i = 0; i < 20; i++) {
  await new Promise(r => setTimeout(r, 200));
  try {
    const res = await fetch(`http://localhost:${CDP_PORT}/json/version`);
    if (res.ok) break;
  } catch(e){}
}

const newPageRes = await fetch(`http://localhost:${CDP_PORT}/json/new?http://localhost:${PORT}/index.html`, { method: 'PUT' });
const pageData = await newPageRes.json();
const ws = new WebSocket(pageData.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);

let reqId = 0;
function send(method, params = {}) {
  const id = ++reqId;
  return new Promise((resolve) => {
    const handler = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.id === id) {
        ws.removeEventListener('message', handler);
        resolve(data.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

await send('Page.enable');
await send('Runtime.enable');
await send('DOM.enable');
await send('Page.reload');

// Wait for 32 cards to be rendered
for (let i = 0; i < 30; i++) {
  await new Promise(r => setTimeout(r, 200));
  const res = await send('Runtime.evaluate', { expression: 'document.querySelectorAll(".duo-card-shell").length', returnByValue: true });
  if (res.result?.value === 32) break;
}

const evalRes = await send('Runtime.evaluate', {
  expression: `(() => {
    const results = [];
    const mapContainers = document.querySelectorAll('.interactive-map-container');

    mapContainers.forEach((container) => {
      const mapType = container.getAttribute('data-map');
      const img = container.querySelector('img');
      const layer = container.querySelector('.map-pins-layer');
      const pins = container.querySelectorAll('.map-interactive-pin');

      if (!img || !layer || !pins.length) return;

      const cRect = container.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();
      const lRect = layer.getBoundingClientRect();

      const cardParent = container.closest('.duo-card, .interactive-card, .a4-sheet-preview');
      let viewMode = 'duo';
      if (cardParent) {
        if (cardParent.classList.contains('interactive-card')) viewMode = 'flip';
        else if (cardParent.classList.contains('a4-sheet-preview')) viewMode = 'print';
      }

      pins.forEach(pin => {
        const spotId = pin.getAttribute('data-spot-id');
        const pRect = pin.getBoundingClientRect();

        const pinCenterX = pRect.left + pRect.width / 2;
        const pinCenterY = pRect.top + pRect.height / 2;

        const styleLeftPct = parseFloat(pin.style.left);
        const styleTopPct = parseFloat(pin.style.top);

        // Expected pin center relative to imgRect
        const targetX_img = imgRect.left + (styleLeftPct / 100) * imgRect.width;
        const targetY_img = imgRect.top + (styleTopPct / 100) * imgRect.height;

        const dx = Math.abs(pinCenterX - targetX_img);
        const dy = Math.abs(pinCenterY - targetY_img);

        results.push({
          viewMode,
          mapType,
          spotId,
          styleLeftPct,
          styleTopPct,
          containerRect: { w: Math.round(cRect.width), h: Math.round(cRect.height) },
          imgRect: { w: Math.round(imgRect.width), h: Math.round(imgRect.height), left: Math.round(imgRect.left), top: Math.round(imgRect.top) },
          layerRect: { w: Math.round(lRect.width), h: Math.round(lRect.height), left: Math.round(lRect.left), top: Math.round(lRect.top) },
          pinCenter: { x: Math.round(pinCenterX), y: Math.round(pinCenterY) },
          targetCenter: { x: Math.round(targetX_img), y: Math.round(targetY_img) },
          deltaPx: { dx: Number(dx.toFixed(2)), dy: Number(dy.toFixed(2)) }
        });
      });
    });
    return results;
  })()`,
  returnByValue: true
});

console.log('\n============================================================');
console.log('=== TEST MESURE D\'ALIGNEMENT GÉOMÉTRIQUE MAPS & PINS GPS ===');
console.log('============================================================\n');

const data = evalRes.result?.value || [];
console.log(`Nombre total de repères mesurés : ${data.length}`);

let failedCount = 0;
data.forEach(item => {
  const isAligned = item.deltaPx.dx <= 1.5 && item.deltaPx.dy <= 1.5;
  if (!isAligned) {
    failedCount++;
    console.error(`  ✗ [DESALIGNÉ] [${item.viewMode.toUpperCase()}] Map '${item.mapType}' - Spot '${item.spotId}' (${item.styleLeftPct}%, ${item.styleTopPct}%): Delta = (${item.deltaPx.dx}px, ${item.deltaPx.dy}px) | Container=${item.containerRect.w}x${item.containerRect.h} | Img=${item.imgRect.w}x${item.imgRect.h}`);
  }
});

if (failedCount === 0) {
  console.log(`  ✓ [ PASS ] 100% des ${data.length} repères GPS sont parfaitement alignés à < 1.5px près avec leurs fonds de cartes !`);
} else {
  console.error(`  ✗ [ FAIL ] ${failedCount}/${data.length} repères GPS présentent une dérive géométrique !`);
}

console.log('\nÉchantillon de mesures (5 premiers) :');
console.log(JSON.stringify(data.slice(0, 5), null, 2));

chrome.kill();
server.close();
process.exit(failedCount === 0 ? 0 : 1);
