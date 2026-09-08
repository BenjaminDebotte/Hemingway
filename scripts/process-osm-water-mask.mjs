import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

if (!fs.existsSync('site/images/maps')) {
  fs.mkdirSync('site/images/maps', { recursive: true });
}

// 1. Template Canal de Caen avec coordonnées géographiques exactes
const htmlCanal = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html {
      margin: 0; padding: 0;
      width: 800px; height: 560px;
      background: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    #map { width: 800px; height: 560px; background: #ffffff; }

    .pin-marker {
      position: relative;
    }
    .pin-dot {
      position: absolute;
      left: 0;
      top: 0;
      width: 8px;
      height: 8px;
      background: #0284c7;
      border: 1.5px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 0 1px #0f172a, 0 1px 3px rgba(0,0,0,0.4);
      transform: translate(-50%, -50%);
      z-index: 10;
    }
    .spot-badge {
      position: absolute;
      background: #ffffff;
      color: #0f172a;
      border: 1.5px solid #0f172a;
      border-radius: 3px;
      padding: 2.5px 6px;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: -0.01em;
      white-space: nowrap;
      box-shadow: 0 1px 4px rgba(0,0,0,0.25);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      z-index: 5;
    }
    .spot-icon { font-size: 10.5px; color: #0284c7; }
    .spot-km { font-family: monospace; font-size: 9px; color: #475569; margin-left: 2px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // Bounding box Canal : cadrage au millimètre
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).fitBounds([
      [49.178, -0.368],
      [49.288, -0.235]
    ]);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 17
    }).addTo(map);

    // Positions géographiques réelles mesurées au mètre sur OpenStreetMap
    const spots = [
      {
        name: 'Bassin St-Pierre (Caen)', km: 'km 0',
        pos: [49.1838, -0.3561],
        style: 'transform: translate(-100%, -50%); margin-left: -8px;'
      },
      {
        name: 'Viaduc de Calix (N814)', km: 'km 2.5',
        pos: [49.1866, -0.3293], // Coordonnée exacte du pont N814 franchissant le canal
        style: 'transform: translate(8px, -100%); margin-top: -4px;'
      },
      {
        name: 'Quais de Colombelles', km: 'km 4.5',
        pos: [49.2085, -0.3090], // Quai de Normandie / ducs d'Albe
        style: 'transform: translate(8px, -50%);'
      },
      {
        name: 'Bassin d\\'évitement (Blainville)', km: 'km 7.5',
        pos: [49.2215, -0.3020], // Élargissement du canal de Blainville
        style: 'transform: translate(8px, -50%);'
      },
      {
        name: 'Pegasus Bridge (Bénouville)', km: 'km 10.5',
        pos: [49.2420, -0.2745], // Pont basculant D514
        style: 'transform: translate(8px, -50%);'
      },
      {
        name: 'Écluses d\\'Ouistreham', km: 'km 14',
        pos: [49.2803, -0.2491], // Sas d'écluse maritime
        style: 'transform: translate(-100%, -50%); margin-left: -8px;'
      }
    ];

    spots.forEach(s => {
      L.marker(s.pos, {
        icon: L.divIcon({
          className: 'custom-pin',
          html: \`
            <div class="pin-marker">
              <div class="pin-dot"></div>
              <div class="spot-badge" style="\${s.style}">
                <span class="spot-icon">⚓</span> \${s.name} <span class="spot-km">\${s.km}</span>
              </div>
            </div>
          \`,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        })
      }).addTo(map);
    });

    window.mapReady = false;
    map.whenReady(() => { setTimeout(() => { window.mapReady = true; }, 2500); });
  </script>
</body>
</html>
`;

// 2. Template Côte de Nacre avec coordonnées géographiques exactes
const htmlMer = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html {
      margin: 0; padding: 0;
      width: 800px; height: 500px;
      background: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    #map { width: 800px; height: 500px; background: #ffffff; }

    .pin-marker { position: relative; }
    .pin-dot {
      position: absolute; left: 0; top: 0;
      width: 8px; height: 8px;
      background: #0d9488;
      border: 1.5px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 0 1px #0f172a, 0 1px 3px rgba(0,0,0,0.4);
      transform: translate(-50%, -50%);
      z-index: 10;
    }
    .pin-dot-wreck { background: #b45309; }

    .spot-badge {
      position: absolute;
      background: #ffffff;
      color: #0f172a;
      border: 1.5px solid #0f172a;
      border-radius: 3px;
      padding: 2.5px 6px;
      font-size: 10.5px;
      font-weight: 800;
      letter-spacing: -0.01em;
      white-space: nowrap;
      box-shadow: 0 1px 4px rgba(0,0,0,0.25);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      z-index: 5;
    }
    .badge-mer { border-color: #0369a1; color: #0f172a; }
    .badge-wreck { border-color: #b45309; color: #78350f; }
    .spot-icon-mer { color: #0284c7; font-size: 10.5px; }
    .spot-icon-wreck { color: #b45309; font-size: 10.5px; }
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

    // Coordonnées marines réelles au large
    const spots = [
      {
        name: 'Courseulles-sur-Mer (Juno)',
        pos: [49.3360, -0.4570],
        cls: '', icon: '⛵',
        style: 'transform: translate(8px, -50%);'
      },
      {
        name: 'Plateau des Roches du Calvados (6-15m)',
        pos: [49.3580, -0.3600], // 1.5 milles au large de Lion/Luc
        cls: 'badge-mer', icon: '🪨',
        style: 'transform: translate(-50%, -100%); margin-top: -8px;'
      },
      {
        name: 'Ridens de Bernières (Bancs)',
        pos: [49.3500, -0.4150], // Banc de sable au large de Bernières
        cls: 'badge-mer', icon: '〰️',
        style: 'transform: translate(-50%, -100%); margin-top: -8px;'
      },
      {
        name: 'Épaves Sword 1944 (Courbet)',
        pos: [49.3250, -0.2800], // Zone d'immersion du Courbet / Gooseberry
        cls: 'badge-wreck', icon: '⚓', dotCls: 'pin-dot-wreck',
        style: 'transform: translate(8px, -50%);'
      },
      {
        name: 'Ouistreham Riva-Bella (Chenal)',
        pos: [49.2880, -0.2520],
        cls: '', icon: '⛵',
        style: 'transform: translate(-100%, -50%); margin-left: -8px;'
      }
    ];

    spots.forEach(s => {
      L.marker(s.pos, {
        icon: L.divIcon({
          className: 'custom-pin',
          html: \`
            <div class="pin-marker">
              <div class="pin-dot \${s.dotCls || ''}"></div>
              <div class="spot-badge \${s.cls}" style="\${s.style}">
                <span class="spot-icon-mer">\${s.icon}</span> \${s.name}
              </div>
            </div>
          \`,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        })
      }).addTo(map);
    });

    window.mapReady = false;
    map.whenReady(() => { setTimeout(() => { window.mapReady = true; }, 2500); });
  </script>
</body>
</html>
`;

// 3. Template Vue d'ensemble Régionale avec coordonnées exactes
const htmlRegional = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html {
      margin: 0; padding: 0;
      width: 500px; height: 500px;
      background: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    #map { width: 500px; height: 500px; background: #ffffff; }

    .pin-marker { position: relative; }
    .pin-dot {
      position: absolute; left: 0; top: 0;
      width: 6px; height: 6px;
      background: #0284c7;
      border: 1px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 0 1px #0f172a, 0 1px 2px rgba(0,0,0,0.4);
      transform: translate(-50%, -50%);
      z-index: 10;
    }
    .spot-badge {
      position: absolute;
      background: #ffffff;
      color: #0f172a;
      border: 1.5px solid #0f172a;
      border-radius: 3px;
      padding: 2px 5px;
      font-size: 10px;
      font-weight: 800;
      white-space: nowrap;
      box-shadow: 0 1px 3px rgba(0,0,0,0.25);
      display: inline-flex;
      align-items: center;
      gap: 3px;
      z-index: 5;
    }
    .spot-badge-accent { border-color: #0284c7; color: #0369a1; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).fitBounds([
      [49.172, -0.460],
      [49.362, -0.220]
    ]);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 16
    }).addTo(map);

    const spots = [
      { name: 'Caen (Bassin St-Pierre)', pos: [49.1838, -0.3561], cls: 'spot-badge-accent', style: 'transform: translate(6px, -50%);' },
      { name: 'Viaduc de Calix', pos: [49.1866, -0.3293], cls: '', style: 'transform: translate(6px, 2px);' },
      { name: 'Pegasus Bridge', pos: [49.2420, -0.2745], cls: '', style: 'transform: translate(6px, -50%);' },
      { name: 'Ouistreham', pos: [49.2803, -0.2491], cls: 'spot-badge-accent', style: 'transform: translate(-100%, -50%); margin-left: -6px;' },
      { name: 'Roches du Calvados', pos: [49.3580, -0.3600], cls: '', style: 'transform: translate(-50%, -100%); margin-top: -6px;' },
      { name: 'Courseulles', pos: [49.3360, -0.4570], cls: '', style: 'transform: translate(6px, -50%);' }
    ];

    spots.forEach(s => {
      L.marker(s.pos, {
        icon: L.divIcon({
          className: 'custom-pin',
          html: \`
            <div class="pin-marker">
              <div class="pin-dot"></div>
              <div class="spot-badge \${s.cls}" style="\${s.style}">\${s.name}</div>
            </div>
          \`,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        })
      }).addTo(map);
    });

    window.mapReady = false;
    map.whenReady(() => { setTimeout(() => { window.mapReady = true; }, 2500); });
  </script>
</body>
</html>
`;

fs.writeFileSync('site/temp-canal-bw.html', htmlCanal);
fs.writeFileSync('site/temp-mer-bw.html', htmlMer);
fs.writeFileSync('site/temp-reg-bw.html', htmlRegional);

const PORT = 3362;
const CDP_PORT = 9251;
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

async function captureAndProcessMap(pageUrl, width, height, outputFile) {
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

  // Pixel classification: water in universal nautical blue, land in crisp B&W with white background
  const processedBase64 = await send('Runtime.evaluate', {
    expression: `new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;

        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i+1], b = d[i+2];

          const isWater = (r >= 140 && r <= 200) &&
                          (g >= 180 && g <= 235) &&
                          (b >= 200 && b <= 245) &&
                          (b > r + 18);

          if (isWater) {
            d[i] = 148;
            d[i+1] = 202;
            d[i+2] = 232;
          } else {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            if (gray > 195) {
              d[i] = 255;
              d[i+1] = 255;
              d[i+2] = 255;
            } else if (gray > 140) {
              const soft = Math.min(255, Math.round(gray * 1.1));
              d[i] = soft;
              d[i+1] = soft;
              d[i+2] = soft;
            } else {
              const dark = Math.round(gray * 0.85);
              d[i] = dark;
              d[i+1] = dark;
              d[i+2] = dark;
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png').split(',')[1]);
      };
      img.src = 'data:image/png;base64,${screenshot.data}';
    })`,
    returnByValue: true,
    awaitPromise: true
  });

  fs.writeFileSync(outputFile, Buffer.from(processedBase64.result.value, 'base64'));
  console.log(`Saved exact B&W + Water Colored map to ${outputFile}`);
  ws.close();
}

console.log('Génération des cartes de haute précision géographique...');
await captureAndProcessMap('temp-canal-bw.html', 800, 560, 'site/images/maps/canal-caen.png');
await captureAndProcessMap('temp-mer-bw.html', 800, 500, 'site/images/maps/cote-de-nacre.png');
await captureAndProcessMap('temp-reg-bw.html', 500, 500, 'site/images/maps/calvados-overview.png');

fs.unlinkSync('site/temp-canal-bw.html');
fs.unlinkSync('site/temp-mer-bw.html');
fs.unlinkSync('site/temp-reg-bw.html');

chrome.kill();
server.close();
process.exit(0);
