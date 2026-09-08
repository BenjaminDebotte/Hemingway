import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 3355;
const CDP_PORT = 9244;
const SITE_DIR = path.resolve('site');

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  const filePath = path.join(SITE_DIR, reqPath);
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  fs.createReadStream(filePath).pipe(res);
});
await new Promise(r => server.listen(PORT, r));

const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new',
  `--remote-debugging-port=${CDP_PORT}`,
  '--disable-gpu',
  '--window-size=1200,900'
]);
await new Promise(r => setTimeout(r, 1000));

async function captureMap(pageUrl, width, height, outputFile) {
  const newPageRes = await fetch(`http://localhost:${CDP_PORT}/json/new?http://localhost:${PORT}/${pageUrl}`, { method: 'PUT' });
  const { webSocketDebuggerUrl } = await newPageRes.json();
  const ws = new WebSocket(webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 0;
  const send = (method, params = {}) => new Promise(resolve => {
    const cur = ++id;
    const handler = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.id === cur) {
        ws.removeEventListener('message', handler);
        resolve(data.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id: cur, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');

  // Attendre que les tuiles OSM soient chargées
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 200));
    const ready = await send('Runtime.evaluate', { expression: 'window.mapReady === true', returnByValue: true });
    if (ready.result?.value) break;
  }
  await new Promise(r => setTimeout(r, 1000));

  const screenshot = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width, height, scale: 2 } // 2x scale for retina / high-DPI print sharpness!
  });

  fs.writeFileSync(outputFile, Buffer.from(screenshot.data, 'base64'));
  console.log(`Saved high-res OSM map to ${outputFile}`);
  ws.close();
}

console.log('Capture des cartes réelles OpenStreetMap...');
await captureMap('temp-canal-osm.html', 800, 560, 'site/images/maps/canal-caen.png');
await captureMap('temp-mer-osm.html', 800, 500, 'site/images/maps/cote-de-nacre.png');
await captureMap('temp-reg-osm.html', 500, 500, 'site/images/maps/calvados-overview.png');

// Nettoyer les fichiers HTML temporaires
fs.unlinkSync('site/temp-canal-osm.html');
fs.unlinkSync('site/temp-mer-osm.html');
fs.unlinkSync('site/temp-reg-osm.html');

chrome.kill();
server.close();
process.exit(0);
