import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

if (!fs.existsSync('site/images/maps')) {
  fs.mkdirSync('site/images/maps', { recursive: true });
}

// Icônes vectorielles SVG 100% Noir & Blanc
const SVG = {
  permit: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  dpm: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c2.5-3 5-3 7.5 0s5 3 7.5 0"/><path d="M2 17c2.5-3 5-3 7.5 0s5 3 7.5 0"/></svg>`,
  bridge: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18h18M4 18v-3c0-3.5 3-6 8-6s8 2.5 8 6v3M8 18v-5M12 18V9M16 18v-5M3 8h18"/></svg>`,
  quay: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="1"/><line x1="9" y1="4" x2="9" y2="20"/><line x1="15" y1="4" x2="15" y2="20"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="15" x2="21" y2="15"/></svg>`,
  slipway: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20l20-5"/><path d="M6 14l2.5-1.5h6l3 1.5-1.5 2h-8z"/><line x1="11" y1="7" x2="11" y2="12.5"/></svg>`,
  locks: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="1"/><line x1="12" y1="4" x2="12" y2="20"/><path d="M7 10l5 2 5-2M7 14l5 2 5-2"/></svg>`,
  reef: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 3 3 19 21 19 12 3"/><polygon points="8 13 12 7 16 13 8 13"/></svg>`,
  sandbank: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 8c3-2 6 2 10 0s7-2 10 0"/><path d="M2 13c3-2 6 2 10 0s7-2 10 0"/><path d="M2 18c3-2 6 2 10 0s7-2 10 0"/></svg>`,
  wreck: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="12" y1="7" x2="12" y2="17"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/><line x1="8.5" y1="15.5" x2="15.5" y2="8.5"/></svg>`,
  pier: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 10h20M6 10v9M12 10v9M18 10v9M2 14h20"/></svg>`
};

// 1. Template Canal de Caen avec micro-badges vectoriels noir et blanc
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

    .pin-marker { position: relative; }
    .pin-dot {
      position: absolute; left: 0; top: 0;
      width: 7px; height: 7px;
      background: #0284c7;
      border: 1.5px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 0 1px #0f172a, 0 1px 3px rgba(0,0,0,0.4);
      transform: translate(-50%, -50%);
      z-index: 10;
    }
    .pin-dot-dpm { background: #0d9488; }
    .spot-badge {
      position: absolute;
      background: #ffffff;
      color: #0f172a;
      border: 1.5px solid #0f172a;
      border-radius: 3px;
      padding: 2px 5px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: -0.01em;
      white-space: nowrap;
      box-shadow: 0 1px 3px rgba(0,0,0,0.25);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      z-index: 5;
    }
    .spot-badge svg {
      width: 11px;
      height: 11px;
      display: inline-block;
      vertical-align: -1px;
      flex-shrink: 0;
    }
    .spot-km { font-family: monospace; font-size: 8.5px; color: #475569; margin-left: 2px; }
    .badge-dpm { border-color: #0d9488; color: #047857; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
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

    // Micro-badges vectoriels noir et blanc
    const spots = [
      {
        html: '${SVG.permit} Bassin St-Pierre <span class=\"spot-km\">km 0 • AAPPMA</span>',
        pos: [49.1838, -0.3561],
        style: 'transform: translate(-100%, -50%); margin-left: -7px;'
      },
      {
        html: '${SVG.dpm} Pont Fonderie <span class=\"spot-km\">Limite DPM</span>',
        pos: [49.1834, -0.3518],
        cls: 'badge-dpm', dotCls: 'pin-dot-dpm',
        style: 'transform: translate(-50%, 8px);'
      },
      {
        html: '${SVG.bridge} Calix <span class=\"spot-km\">km 2.5</span>',
        pos: [49.1866, -0.3293],
        style: 'transform: translate(7px, -50%);'
      },
      {
        html: '${SVG.quay} Colombelles <span class=\"spot-km\">km 4.5</span>',
        pos: [49.2085, -0.3090],
        style: 'transform: translate(7px, -50%);'
      },
      {
        html: '${SVG.slipway} Cale Blainville <span class=\"spot-km\">km 7.5</span>',
        pos: [49.2215, -0.3020],
        style: 'transform: translate(7px, -50%);'
      },
      {
        html: '${SVG.bridge} Pegasus <span class=\"spot-km\">km 10.5</span>',
        pos: [49.2420, -0.2745],
        style: 'transform: translate(7px, -50%);'
      },
      {
        html: '${SVG.locks} Écluses <span class=\"spot-km\">km 14 • Mer</span>',
        pos: [49.2803, -0.2491],
        style: 'transform: translate(-100%, -50%); margin-left: -7px;'
      }
    ];

    spots.forEach(s => {
      L.marker(s.pos, {
        icon: L.divIcon({
          className: 'custom-pin',
          html: \`
            <div class="pin-marker">
              <div class="pin-dot \${s.dotCls || ''}"></div>
              <div class="spot-badge \${s.cls || ''}" style="\${s.style}">
                \${s.html}
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

// 2. Template Côte de Nacre avec micro-badges vectoriels noir et blanc
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
      width: 7px; height: 7px;
      background: #0d9488;
      border: 1.5px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 0 1px #0f172a, 0 1px 3px rgba(0,0,0,0.4);
      transform: translate(-50%, -50%);
      z-index: 10;
    }
    .pin-dot-wreck { background: #b45309; }
    .pin-dot-pier { background: #0284c7; }

    .spot-badge {
      position: absolute;
      background: #ffffff;
      color: #0f172a;
      border: 1.5px solid #0f172a;
      border-radius: 3px;
      padding: 2px 5px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: -0.01em;
      white-space: nowrap;
      box-shadow: 0 1px 3px rgba(0,0,0,0.25);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      z-index: 5;
    }
    .spot-badge svg {
      width: 11px;
      height: 11px;
      display: inline-block;
      vertical-align: -1px;
      flex-shrink: 0;
    }
    .badge-mer { border-color: #0d9488; color: #047857; }
    .badge-wreck { border-color: #b45309; color: #78350f; }
    .badge-pier { border-color: #0284c7; color: #0369a1; }
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

    // Micro-badges vectoriels noir et blanc
    const spots = [
      {
        html: '${SVG.slipway} Cale Courseulles',
        pos: [49.3360, -0.4570],
        style: 'transform: translate(7px, -50%);'
      },
      {
        html: '${SVG.reef} Roches 6-15m',
        pos: [49.3580, -0.3600],
        cls: 'badge-mer',
        style: 'transform: translate(-50%, -100%); margin-top: -6px;'
      },
      {
        html: '${SVG.sandbank} Ridens',
        pos: [49.3500, -0.4150],
        cls: 'badge-mer',
        style: 'transform: translate(-50%, -100%); margin-top: -6px;'
      },
      {
        html: '${SVG.pier} Jetée Luc',
        pos: [49.3183, -0.3473],
        cls: 'badge-pier', dotCls: 'pin-dot-pier',
        style: 'transform: translate(-100%, -50%); margin-left: -7px;'
      },
      {
        html: '${SVG.reef} Lion-sur-Mer',
        pos: [49.3030, -0.3160],
        cls: 'badge-mer',
        style: 'transform: translate(-100%, 4px); margin-left: -6px;'
      },
      {
        html: '${SVG.sandbank} Hermanville',
        pos: [49.2940, -0.2980],
        cls: 'badge-mer',
        style: 'transform: translate(-50%, 8px);'
      },
      {
        html: '${SVG.wreck} Courbet 1944',
        pos: [49.3250, -0.2800],
        cls: 'badge-wreck', dotCls: 'pin-dot-wreck',
        style: 'transform: translate(7px, -50%);'
      },
      {
        html: '${SVG.slipway} Ouistreham',
        pos: [49.2880, -0.2520],
        style: 'transform: translate(7px, -50%);'
      }
    ];

    spots.forEach(s => {
      L.marker(s.pos, {
        icon: L.divIcon({
          className: 'custom-pin',
          html: \`
            <div class="pin-marker">
              <div class="pin-dot \${s.dotCls || ''}"></div>
              <div class="spot-badge \${s.cls || ''}" style="\${s.style}">
                \${s.html}
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

// 3. Template Vue d'ensemble Régionale avec micro-badges vectoriels noir et blanc
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
      padding: 1.5px 4px;
      font-size: 9.5px;
      font-weight: 800;
      white-space: nowrap;
      box-shadow: 0 1px 3px rgba(0,0,0,0.25);
      display: inline-flex;
      align-items: center;
      gap: 3px;
      z-index: 5;
    }
    .spot-badge svg {
      width: 10px;
      height: 10px;
      display: inline-block;
      vertical-align: -1px;
      flex-shrink: 0;
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
      [49.172, -0.460],
      [49.362, -0.220]
    ]);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 16
    }).addTo(map);

    const spots = [
      { html: '${SVG.permit} Caen', pos: [49.1838, -0.3561], style: 'transform: translate(-100%, -50%); margin-left: -6px;' },
      { html: '${SVG.bridge} Calix', pos: [49.1866, -0.3293], style: 'transform: translate(6px, -50%);' },
      { html: '${SVG.bridge} Pegasus', pos: [49.2420, -0.2745], style: 'transform: translate(6px, -50%);' },
      { html: '${SVG.locks} Ouistreham', pos: [49.2803, -0.2491], style: 'transform: translate(6px, -50%);' },
      { html: '${SVG.sandbank} Hermanville', pos: [49.2940, -0.2980], style: 'transform: translate(-100%, 6px); margin-left: -4px;' },
      { html: '${SVG.reef} Lion', pos: [49.3030, -0.3160], style: 'transform: translate(6px, -50%);' },
      { html: '${SVG.pier} Luc', pos: [49.3183, -0.3473], style: 'transform: translate(-100%, -50%); margin-left: -6px;' },
      { html: '${SVG.reef} Roches', pos: [49.3580, -0.3600], style: 'transform: translate(-50%, -100%); margin-top: -6px;' },
      { html: '${SVG.slipway} Courseulles', pos: [49.3360, -0.4570], style: 'transform: translate(6px, -50%);' }
    ];

    spots.forEach(s => {
      L.marker(s.pos, {
        icon: L.divIcon({
          className: 'custom-pin',
          html: \`
            <div class="pin-marker">
              <div class="pin-dot"></div>
              <div class="spot-badge" style="\${s.style}">\${s.html}</div>
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

const PORT = 3364;
const CDP_PORT = 9253;
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
  console.log(`Saved 100% monochrome vector map to ${outputFile}`);
  ws.close();
}

console.log('Génération des cartes avec micro-badges vectoriels noir et blanc...');
await captureAndProcessMap('temp-canal-bw.html', 800, 560, 'site/images/maps/canal-caen.png');
await captureAndProcessMap('temp-mer-bw.html', 800, 500, 'site/images/maps/cote-de-nacre.png');
await captureAndProcessMap('temp-reg-bw.html', 500, 500, 'site/images/maps/calvados-overview.png');

fs.unlinkSync('site/temp-canal-bw.html');
fs.unlinkSync('site/temp-mer-bw.html');
fs.unlinkSync('site/temp-reg-bw.html');

chrome.kill();
server.close();
process.exit(0);
