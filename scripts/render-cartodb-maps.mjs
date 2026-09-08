import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

if (!fs.existsSync('site/images/maps')) {
  fs.mkdirSync('site/images/maps', { recursive: true });
}

// 1. Template Canal de Caen avec CartoDB Positron
const htmlCanal = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 800px;
      height: 560px;
      background: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    #map { width: 800px; height: 560px; background: #f8fafc; }
    .spot-badge {
      background: #ffffff;
      color: #0f172a;
      border: 1.5px solid #0f172a;
      border-radius: 3px;
      padding: 3px 7px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: -0.01em;
      white-space: nowrap;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .spot-icon {
      font-size: 10px;
      color: #0284c7;
    }
    .spot-km {
      font-family: monospace;
      font-size: 9.5px;
      color: #64748b;
      margin-left: 2px;
    }
    .leaflet-tile {
      filter: saturate(0.35) contrast(1.18) brightness(1.05);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).fitBounds([
      [49.175, -0.372],
      [49.290, -0.233]
    ]);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 17
    }).addTo(map);

    const spots = [
      { name: 'Bassin St-Pierre (Caen)', km: 'km 0', pos: [49.1838, -0.3561], anchor: [10, 10] },
      { name: 'Viaduc de Calix', km: 'km 2.5', pos: [49.1932, -0.3168], anchor: [10, 10] },
      { name: 'Quais de Colombelles', km: 'km 4.5', pos: [49.2085, -0.2982], anchor: [10, 10] },
      { name: 'Bassin de Blainville', km: 'km 7.5', pos: [49.2312, -0.2834], anchor: [10, 10] },
      { name: 'Pegasus Bridge (Bénouville)', km: 'km 10.5', pos: [49.2423, -0.2749], anchor: [10, 10] },
      { name: 'Écluses d\\'Ouistreham', km: 'km 14', pos: [49.2785, -0.2520], anchor: [10, 10] }
    ];

    spots.forEach(s => {
      L.marker(s.pos, {
        icon: L.divIcon({
          className: 'custom-pin',
          html: \`<div class="spot-badge"><span class="spot-icon">⚓</span> \${s.name} <span class="spot-km">\${s.km}</span></div>\`,
          iconSize: [null, null],
          iconAnchor: s.anchor
        })
      }).addTo(map);
    });

    window.mapReady = false;
    map.whenReady(() => {
      setTimeout(() => { window.mapReady = true; }, 2500);
    });
  </script>
</body>
</html>
`;

// 2. Template Côte de Nacre avec CartoDB Positron
const htmlMer = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 800px;
      height: 500px;
      background: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    #map { width: 800px; height: 500px; background: #f8fafc; }
    .spot-badge {
      background: #ffffff;
      color: #0f172a;
      border: 1.5px solid #0f172a;
      border-radius: 3px;
      padding: 3px 7px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: -0.01em;
      white-space: nowrap;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .badge-mer {
      border-color: #0d9488;
      color: #0f172a;
    }
    .badge-wreck {
      border-color: #b45309;
      color: #78350f;
    }
    .spot-icon-mer { color: #0d9488; font-size: 10px; }
    .spot-icon-wreck { color: #b45309; font-size: 10px; }
    .leaflet-tile {
      filter: saturate(0.35) contrast(1.18) brightness(1.05);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).fitBounds([
      [49.270, -0.470],
      [49.365, -0.220]
    ]);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 17
    }).addTo(map);

    const spots = [
      { name: 'Courseulles-sur-Mer (Juno)', pos: [49.3360, -0.4570], cls: '', icon: '⛵', anchor: [10, 10] },
      { name: 'Plateau des Roches du Calvados', pos: [49.3480, -0.3600], cls: 'badge-mer', icon: '🪨', anchor: [10, 10] },
      { name: 'Ridens de Bernières (Bancs)', pos: [49.3420, -0.4150], cls: 'badge-mer', icon: '〰️', anchor: [10, 10] },
      { name: 'Épaves Sword (1944)', pos: [49.3250, -0.2800], cls: 'badge-wreck', icon: '⚓', anchor: [10, 10] },
      { name: 'Ouistreham Riva-Bella', pos: [49.2880, -0.2520], cls: '', icon: '⛵', anchor: [10, 10] }
    ];

    spots.forEach(s => {
      L.marker(s.pos, {
        icon: L.divIcon({
          className: 'custom-pin',
          html: \`<div class="spot-badge \${s.cls}"><span class="spot-icon-mer">\${s.icon}</span> \${s.name}</div>\`,
          iconSize: [null, null],
          iconAnchor: s.anchor
        })
      }).addTo(map);
    });

    window.mapReady = false;
    map.whenReady(() => {
      setTimeout(() => { window.mapReady = true; }, 2500);
    });
  </script>
</body>
</html>
`;

// 3. Template Vue d'Ensemble Régionale avec CartoDB Positron
const htmlRegional = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 500px;
      height: 500px;
      background: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    #map { width: 500px; height: 500px; background: #f8fafc; }
    .spot-badge {
      background: #ffffff;
      color: #0f172a;
      border: 1.5px solid #0f172a;
      border-radius: 3px;
      padding: 2px 5px;
      font-size: 10px;
      font-weight: 700;
      white-space: nowrap;
      box-shadow: 0 1px 3px rgba(0,0,0,0.15);
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }
    .spot-badge-accent {
      border-color: #0284c7;
      color: #0369a1;
    }
    .leaflet-tile {
      filter: saturate(0.35) contrast(1.18) brightness(1.05);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).fitBounds([
      [49.170, -0.460],
      [49.360, -0.220]
    ]);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 16
    }).addTo(map);

    const spots = [
      { name: 'Caen (Bassin St-Pierre)', pos: [49.1838, -0.3561], cls: 'spot-badge-accent' },
      { name: 'Pegasus Bridge', pos: [49.2423, -0.2749], cls: '' },
      { name: 'Ouistreham', pos: [49.2785, -0.2520], cls: 'spot-badge-accent' },
      { name: 'Roches du Calvados', pos: [49.3450, -0.3600], cls: '' },
      { name: 'Courseulles', pos: [49.3360, -0.4570], cls: '' }
    ];

    spots.forEach(s => {
      L.marker(s.pos, {
        icon: L.divIcon({
          className: 'custom-pin',
          html: \`<div class="spot-badge \${s.cls}">\${s.name}</div>\`,
          iconSize: [null, null],
          iconAnchor: [5, 5]
        })
      }).addTo(map);
    });

    window.mapReady = false;
    map.whenReady(() => {
      setTimeout(() => { window.mapReady = true; }, 2500);
    });
  </script>
</body>
</html>
`;

fs.writeFileSync('site/temp-canal-cartodb.html', htmlCanal);
fs.writeFileSync('site/temp-mer-cartodb.html', htmlMer);
fs.writeFileSync('site/temp-reg-cartodb.html', htmlRegional);

// Serveur HTTP pour permettre à Chrome headless de charger les pages avec leurs dépendances Leaflet/CDN
const PORT = 3358;
const CDP_PORT = 9247;
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

  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 200));
    const ready = await send('Runtime.evaluate', { expression: 'window.mapReady === true', returnByValue: true });
    if (ready.result?.value) break;
  }
  await new Promise(r => setTimeout(r, 1200));

  const screenshot = await send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width, height, scale: 2 }
  });

  fs.writeFileSync(outputFile, Buffer.from(screenshot.data, 'base64'));
  console.log(`Saved CartoDB map to ${outputFile}`);
  ws.close();
}

console.log('Capture des cartes CartoDB Positron (OpenStreetMap épuré)...');
await captureMap('temp-canal-cartodb.html', 800, 560, 'site/images/maps/canal-caen.png');
await captureMap('temp-mer-cartodb.html', 800, 500, 'site/images/maps/cote-de-nacre.png');
await captureMap('temp-reg-cartodb.html', 500, 500, 'site/images/maps/calvados-overview.png');

fs.unlinkSync('site/temp-canal-cartodb.html');
fs.unlinkSync('site/temp-mer-cartodb.html');
fs.unlinkSync('site/temp-reg-cartodb.html');

chrome.kill();
server.close();
process.exit(0);
