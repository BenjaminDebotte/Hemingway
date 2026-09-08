import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

// Créer le dossier pour les cartes réelles
if (!fs.existsSync('site/images/maps')) {
  fs.mkdirSync('site/images/maps', { recursive: true });
}

// Nous allons créer une page HTML locale temporaire qui charge Leaflet avec les tuiles OpenStreetMap
// et affiche la carte avec les marqueurs halieutiques officiels.
const htmlCanal = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html { margin: 0; padding: 0; width: 800px; height: 560px; background: #e2e8f0; font-family: sans-serif; }
    #map { width: 800px; height: 560px; }
    .spot-pin {
      background: #0284c7;
      color: #ffffff;
      border: 2px solid #ffffff;
      border-radius: 4px;
      padding: 3px 6px;
      font-size: 11px;
      font-weight: bold;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .spot-pin-mer {
      background: #0d9488;
    }
    .spot-pin-wreck {
      background: #b45309;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // Bounding box Canal de Caen : Caen (49.18, -0.36) à Ouistreham (49.29, -0.25)
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).fitBounds([
      [49.175, -0.370],
      [49.290, -0.235]
    ]);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 16
    }).addTo(map);

    // Repères clés du Canal
    const spots = [
      { name: 'Bassin St-Pierre (Caen) • km 0', pos: [49.1838, -0.3561] },
      { name: 'Viaduc de Calix • km 2.5', pos: [49.1932, -0.3168] },
      { name: 'Quais de Colombelles • km 4.5', pos: [49.2085, -0.2982] },
      { name: 'Bassin de Blainville • km 7.5', pos: [49.2312, -0.2834] },
      { name: 'Pegasus Bridge (Bénouville) • km 10.5', pos: [49.2423, -0.2749] },
      { name: 'Écluses d\\'Ouistreham • km 14', pos: [49.2785, -0.2520] }
    ];

    spots.forEach(s => {
      L.marker(s.pos, {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: \`<div class=\"spot-pin\">⚓ \${s.name}</div>\`,
          iconSize: [null, null],
          iconAnchor: [10, 10]
        })
      }).addTo(map);
    });

    window.mapReady = false;
    map.whenReady(() => {
      setTimeout(() => { window.mapReady = true; }, 2000);
    });
  </script>
</body>
</html>
`;

fs.writeFileSync('site/temp-canal-osm.html', htmlCanal);
console.log('Page temporaire Canal OSM générée.');

const htmlMer = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html { margin: 0; padding: 0; width: 800px; height: 500px; background: #e2e8f0; font-family: sans-serif; }
    #map { width: 800px; height: 500px; }
    .spot-pin {
      background: #0284c7;
      color: #ffffff;
      border: 2px solid #ffffff;
      border-radius: 4px;
      padding: 3px 6px;
      font-size: 11px;
      font-weight: bold;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .spot-pin-mer {
      background: #0d9488;
    }
    .spot-pin-wreck {
      background: #b45309;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // Bounding box Côte de Nacre : Courseulles-sur-Mer (-0.46) à Ouistreham/Sallenelles (-0.22), et au large
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).fitBounds([
      [49.270, -0.470],
      [49.365, -0.220]
    ]);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 16
    }).addTo(map);

    // Repères maritimes
    const spots = [
      { name: 'Courseulles-sur-Mer (Juno)', pos: [49.3360, -0.4570], cls: 'spot-pin' },
      { name: 'Plateau des Roches du Calvados', pos: [49.3450, -0.3600], cls: 'spot-pin-mer' },
      { name: 'Ridens de Bernières', pos: [49.3400, -0.4100], cls: 'spot-pin-mer' },
      { name: 'Épaves Sword (1944)', pos: [49.3250, -0.2800], cls: 'spot-pin-wreck' },
      { name: 'Ouistreham Riva-Bella', pos: [49.2880, -0.2520], cls: 'spot-pin' }
    ];

    spots.forEach(s => {
      L.marker(s.pos, {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: \`<div class=\"spot-pin \${s.cls}\">⛵ \${s.name}</div>\`,
          iconSize: [null, null],
          iconAnchor: [10, 10]
        })
      }).addTo(map);
    });

    window.mapReady = false;
    map.whenReady(() => {
      setTimeout(() => { window.mapReady = true; }, 2000);
    });
  </script>
</body>
</html>
`;

fs.writeFileSync('site/temp-mer-osm.html', htmlMer);
console.log('Page temporaire Mer OSM générée.');

const htmlRegional = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body, html { margin: 0; padding: 0; width: 500px; height: 500px; background: #e2e8f0; font-family: sans-serif; }
    #map { width: 500px; height: 500px; }
    .spot-pin {
      background: #0284c7;
      color: #ffffff;
      border: 1.5px solid #ffffff;
      border-radius: 3px;
      padding: 2px 5px;
      font-size: 10px;
      font-weight: bold;
      white-space: nowrap;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    .spot-pin-mer { background: #0d9488; }
    .spot-pin-wreck { background: #b45309; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // Bounding box Régionale : Caen à la mer
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).fitBounds([
      [49.170, -0.460],
      [49.360, -0.220]
    ]);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 15
    }).addTo(map);

    const spots = [
      { name: 'Caen (Bassin St-Pierre)', pos: [49.1838, -0.3561], cls: 'spot-pin' },
      { name: 'Pegasus Bridge', pos: [49.2423, -0.2749], cls: 'spot-pin' },
      { name: 'Ouistreham', pos: [49.2785, -0.2520], cls: 'spot-pin' },
      { name: 'Roches du Calvados', pos: [49.3450, -0.3600], cls: 'spot-pin-mer' },
      { name: 'Courseulles', pos: [49.3360, -0.4570], cls: 'spot-pin' }
    ];

    spots.forEach(s => {
      L.marker(s.pos, {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: \`<div class=\"spot-pin \${s.cls}\">\${s.name}</div>\`,
          iconSize: [null, null],
          iconAnchor: [5, 5]
        })
      }).addTo(map);
    });

    window.mapReady = false;
    map.whenReady(() => {
      setTimeout(() => { window.mapReady = true; }, 2000);
    });
  </script>
</body>
</html>
`;

fs.writeFileSync('site/temp-reg-osm.html', htmlRegional);
console.log('Page temporaire Régionale OSM générée.');
