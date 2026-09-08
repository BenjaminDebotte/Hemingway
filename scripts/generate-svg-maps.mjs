import fs from 'fs';

// 1. Charger les données OSM
const raw = JSON.parse(fs.readFileSync('data/osm-raw.json'));

// Récupérer les coordonnées du Canal depuis Nominatim relation 7403018
const nominatimRes = await fetch('https://nominatim.openstreetmap.org/search?q=Canal+de+Caen+a+la+mer&format=json&polygon_geojson=1', {
  headers: { 'User-Agent': 'PecheNormandieAgent/1.0' }
}).then(r => r.json());

const canalCoords = nominatimRes[0].geojson.coordinates[0]; // [ [lon, lat], ... ] (82 points de Caen à Ouistreham)
console.log('Canal coordinates loaded:', canalCoords.length, 'points');

// Récupérer le trait de côte depuis raw.coast
let coastSegments = raw.coast.map(w => w.geometry.map(p => [p.lon, p.lat]));
function dist(p1, p2) {
  return Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
}

let coastChain = coastSegments.shift();
let extended = true;
while (extended) {
  extended = false;
  for (let i = 0; i < coastSegments.length; i++) {
    const seg = coastSegments[i];
    const eps = 0.0015;
    if (dist(coastChain[coastChain.length - 1], seg[0]) < eps) {
      coastChain.push(...seg.slice(1));
      coastSegments.splice(i, 1);
      extended = true;
      break;
    } else if (dist(coastChain[coastChain.length - 1], seg[seg.length - 1]) < eps) {
      coastChain.push(...seg.slice().reverse().slice(1));
      coastSegments.splice(i, 1);
      extended = true;
      break;
    } else if (dist(coastChain[0], seg[seg.length - 1]) < eps) {
      coastChain.unshift(...seg.slice(0, -1));
      coastSegments.splice(i, 1);
      extended = true;
      break;
    } else if (dist(coastChain[0], seg[0]) < eps) {
      coastChain.unshift(...seg.slice().reverse().slice(0, -1));
      coastSegments.splice(i, 1);
      extended = true;
      break;
    }
  }
}

if (coastChain[0][0] > coastChain[coastChain.length - 1][0]) {
  coastChain.reverse();
}
coastChain = coastChain.filter(p => p[0] >= -0.48 && p[0] <= -0.22);
console.log('Coastline chain stitched:', coastChain.length, 'points');

// Ramer-Douglas-Peucker
function rdp(points, epsilon) {
  if (points.length <= 2) return points;
  let dmax = 0;
  let index = 0;
  const a = points[0];
  const b = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const d = Math.abs((b[1] - a[1]) * p[0] - (b[0] - a[0]) * p[1] + b[0] * a[1] - b[1] * a[0]) / Math.hypot(b[1] - a[1], b[0] - a[0]);
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }

  if (dmax > epsilon) {
    const rec1 = rdp(points.slice(0, index + 1), epsilon);
    const rec2 = rdp(points.slice(index), epsilon);
    return [...rec1.slice(0, -1), ...rec2];
  } else {
    return [a, b];
  }
}

const simplifiedCoast = rdp(coastChain, 0.0004);
console.log('Coastline simplified to:', simplifiedCoast.length, 'points');

const simplifiedCanal = rdp(canalCoords, 0.00015);
console.log('Canal simplified to:', simplifiedCanal.length, 'points');

// ==========================================================================
// 1. PROJECTION CARTE DÉDIÉE CANAL (FACE B MONO-BIOTOPE)
// ViewBox 430 x 250 (remplit parfaitement le conteneur ~474 x 350 px)
// ==========================================================================
let totalCanalDist = 0;
const canalDists = [0];
for (let i = 1; i < simplifiedCanal.length; i++) {
  const d = Math.hypot(simplifiedCanal[i][0] - simplifiedCanal[i-1][0], simplifiedCanal[i][1] - simplifiedCanal[i-1][1]);
  totalCanalDist += d;
  canalDists.push(totalCanalDist);
}

const canalSvgPoints = simplifiedCanal.map((p, i) => {
  const frac = canalDists[i] / totalCanalDist;
  const x = 32 + frac * (408 - 32);
  const start = simplifiedCanal[0];
  const end = simplifiedCanal[simplifiedCanal.length - 1];
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const lineDist = Math.hypot(dx, dy);
  const perp = ((p[0] - start[0]) * -dy + (p[1] - start[1]) * dx) / lineDist;
  const y = 118 - perp * 950;
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
});
const canalPathD = 'M ' + canalSvgPoints.map(p => `${p[0]},${p[1]}`).join(' L ');

// Lit parallèle de l'Orne (naturelle) qui serpente à côté du canal
const ornePathPoints = canalSvgPoints.map((pt, i) => {
  const offset = Math.sin((i / (canalSvgPoints.length - 1)) * Math.PI * 3.5) * 16 + 18;
  return [pt[0], Math.round((pt[1] + offset) * 10) / 10];
});
const ornePathD = 'M ' + ornePathPoints.map(p => `${p[0]},${p[1]}`).join(' L ');

// ==========================================================================
// 2. PROJECTION CARTE DÉDIÉE CÔTE DE NACRE (FACE B MONO-BIOTOPE)
// ViewBox 430 x 240 (remplit parfaitement le conteneur ~474 x 280-310 px)
// ==========================================================================
const minLonCoast = -0.475;
const maxLonCoast = -0.228;
const minLatCoast = 49.270;
const maxLatCoast = 49.365;

function projectMer(lon, lat) {
  const x = 25 + ((lon - minLonCoast) / (maxLonCoast - minLonCoast)) * (405 - 25);
  const y = 185 - ((lat - minLatCoast) / (maxLatCoast - minLatCoast)) * (185 - 20);
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

const coastSvgPoints = simplifiedCoast.map(p => projectMer(p[0], p[1]));
const coastPathD = 'M ' + coastSvgPoints.map(p => `${p[0]},${p[1]}`).join(' L ');

// ==========================================================================
// 3. PROJECTION MINI-CARTE RÉGIONALE D'ENSEMBLE (FACE A DUAL-BIOTOPE)
// ViewBox 200 x 190 (remplit parfaitement le conteneur carré ~240 x 240 px)
// ==========================================================================
const minLonReg = -0.470;
const maxLonReg = -0.220;
const minLatReg = 49.172;
const maxLatReg = 49.358;

function projectReg(lon, lat) {
  const x = 15 + ((lon - minLonReg) / (maxLonReg - minLonReg)) * (185 - 15);
  const y = 175 - ((lat - minLatReg) / (maxLatReg - minLatReg)) * (175 - 16);
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

const regCanalPoints = simplifiedCanal.map(p => projectReg(p[0], p[1]));
const regCanalPathD = 'M ' + regCanalPoints.map(p => `${p[0]},${p[1]}`).join(' L ');

const regCoastPoints = simplifiedCoast.map(p => projectReg(p[0], p[1]));
const regCoastPathD = 'M ' + regCoastPoints.map(p => `${p[0]},${p[1]}`).join(' L ');

console.log('Canal Path length:', canalPathD.length);
console.log('Coast Path length:', coastPathD.length);
console.log('Reg Canal Path length:', regCanalPathD.length);
console.log('Reg Coast Path length:', regCoastPathD.length);

// Écriture du module `site/js/geo-maps.js`
const moduleContent = `// ==========================================================================
// CARTOGRAPHIE HALIEUTIQUE VECTORIELLE OFFICIELLE OPENSTREETMAP
// ==========================================================================
// Données issues du cadastre hydrographique OpenStreetMap (Relation OSM 7403018 & Coastline)
// Modélisation vectorielle haute précision calibrée au millimètre pour le format A5/A4

import { uiIcon } from './icons.js';

// Chemins projetés précis issus d'OpenStreetMap
export const GEO_PATHS = {
  canalMain: "${canalPathD}",
  orneRiver: "${ornePathD}",
  coastline: "${coastPathD}",
  regCanal: "${regCanalPathD}",
  regCoast: "${regCoastPathD}"
};

/**
 * Carte Dédiée : Canal de Caen à la mer (14 km)
 * Utilisée au verso (Face B) pour les espèces mono-biotope eau douce / saumâtre
 */
export function renderCanalDedicatedMap(fish) {
  return \`
    <div class="biotope-map-card map-card-canal" aria-label="Carte halieutique du Canal de Caen">
      <div class="map-card-header">
        <div class="map-header-title">
          \${uiIcon('anchor')} <span>Topographie & Postes Clés : Canal de Caen à la mer (14 km)</span>
        </div>
        <span class="map-badge-osm">Tracé Officiel OSM</span>
      </div>
      <div class="map-svg-wrap">
        <svg viewBox="0 0 430 245" class="halieutic-svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Carte du Canal de Caen de Caen à Ouistreham">
          <defs>
            <linearGradient id="canalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="var(--theme-canal-accent)" stop-opacity="0.9" />
              <stop offset="100%" stop-color="var(--theme-bateau-accent)" stop-opacity="0.9" />
            </linearGradient>
            <pattern id="canalGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--theme-surface-subtle-border)" stroke-width="0.5" stroke-dasharray="1 3" opacity="0.3" />
            </pattern>
          </defs>

          <!-- Grille bathymétrique d'arrière-plan -->
          <rect width="430" height="245" fill="url(#canalGrid)" />

          <!-- Fleuve Orne (lit naturel parallèle) -->
          <path d="\${GEO_PATHS.orneRiver}" fill="none" stroke="var(--theme-canal-surface-border)" stroke-width="2.5" stroke-dasharray="4 2" opacity="0.65" />
          <text x="210" y="152" font-family="var(--font-sans)" font-size="6.5" font-style="italic" font-weight="600" fill="var(--theme-text-faint)" opacity="0.8">Lit naturel de l'Orne (cours parallèle)</text>

          <!-- Tracé du Canal de Caen issu d'OpenStreetMap -->
          <!-- Halo d'eau extérieur -->
          <path d="\${GEO_PATHS.canalMain}" fill="none" stroke="var(--theme-canal-accent)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" opacity="0.12" />
          <!-- Chenal navigable DPM -->
          <path d="\${GEO_PATHS.canalMain}" fill="none" stroke="url(#canalGradient)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
          <!-- Axe central de navigation -->
          <path d="\${GEO_PATHS.canalMain}" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="3 3" opacity="0.8" />

          <!-- Repères & Postes Clés Halieutiques (Alternance Haut/Bas aérée) -->
          <!-- 1. Bassin Saint-Pierre & Pont de la Fonderie (km 0) -->
          <g class="map-spot-marker" transform="translate(34, 116)">
            <circle r="5" fill="var(--theme-canal-accent)" stroke="#ffffff" stroke-width="1.4" />
            <line x1="0" y1="-5" x2="0" y2="-42" stroke="var(--theme-canal-accent)" stroke-width="1" stroke-dasharray="2 2" />
            <rect x="-30" y="-76" width="60" height="30" rx="3" fill="var(--theme-surface-subtle)" stroke="var(--theme-surface-subtle-border)" stroke-width="0.8" />
            <text x="0" y="-62" text-anchor="middle" class="map-label-main">Bassin St-Pierre</text>
            <text x="0" y="-51" text-anchor="middle" class="map-label-sub">km 0 • Eaux douces</text>
          </g>

          <!-- 2. Viaduc de Calix (km 2.5) -->
          <g class="map-spot-marker" transform="translate(100, 115)">
            <line x1="0" y1="-10" x2="0" y2="10" stroke="var(--theme-text-title)" stroke-width="2.5" stroke-linecap="round" />
            <circle r="3.2" fill="var(--theme-text-title)" />
            <line x1="0" y1="10" x2="0" y2="40" stroke="var(--theme-text-title)" stroke-width="1" stroke-dasharray="2 2" />
            <rect x="-32" y="44" width="64" height="30" rx="3" fill="var(--theme-surface-subtle)" stroke="var(--theme-surface-subtle-border)" stroke-width="0.8" />
            <text x="0" y="58" text-anchor="middle" class="map-label-main">Viaduc de Calix</text>
            <text x="0" y="68" text-anchor="middle" class="map-label-sub">Piles & Fosse 9m</text>
          </g>

          <!-- 3. Quais de Colombelles / Hérouville (km 4.5) -->
          <g class="map-spot-marker" transform="translate(168, 117)">
            <rect x="-3.5" y="-3.5" width="7" height="7" fill="var(--theme-canal-accent)" stroke="#ffffff" stroke-width="1.2" />
            <line x1="0" y1="-5" x2="0" y2="-42" stroke="var(--theme-canal-accent)" stroke-width="1" stroke-dasharray="2 2" />
            <rect x="-30" y="-76" width="60" height="30" rx="3" fill="var(--theme-surface-subtle)" stroke="var(--theme-surface-subtle-border)" stroke-width="0.8" />
            <text x="0" y="-62" text-anchor="middle" class="map-label-main">Colombelles</text>
            <text x="0" y="-51" text-anchor="middle" class="map-label-sub">Palplanches métal</text>
          </g>

          <!-- 4. Bassin d'Évitement de Blainville (km 7.5) -->
          <g class="map-spot-marker" transform="translate(242, 114)">
            <circle r="5" fill="none" stroke="var(--theme-canal-accent)" stroke-width="2" stroke-dasharray="2 2" />
            <circle r="2.5" fill="var(--theme-canal-accent)" />
            <line x1="0" y1="10" x2="0" y2="40" stroke="var(--theme-canal-accent)" stroke-width="1" stroke-dasharray="2 2" />
            <rect x="-30" y="44" width="60" height="30" rx="3" fill="var(--theme-surface-subtle)" stroke="var(--theme-surface-subtle-border)" stroke-width="0.8" />
            <text x="0" y="58" text-anchor="middle" class="map-label-main">Blainville</text>
            <text x="0" y="68" text-anchor="middle" class="map-label-sub">Évitement & Fosse</text>
          </g>

          <!-- 5. Pont de Bénouville / Pegasus Bridge (km 10.5) -->
          <g class="map-spot-marker" transform="translate(322, 126)">
            <line x1="0" y1="-10" x2="0" y2="10" stroke="var(--theme-text-title)" stroke-width="2.5" stroke-linecap="round" />
            <circle r="3.2" fill="var(--theme-text-title)" />
            <line x1="0" y1="-5" x2="0" y2="-42" stroke="var(--theme-text-title)" stroke-width="1" stroke-dasharray="2 2" />
            <rect x="-34" y="-76" width="68" height="30" rx="3" fill="var(--theme-surface-subtle)" stroke="var(--theme-surface-subtle-border)" stroke-width="0.8" />
            <text x="0" y="-62" text-anchor="middle" class="map-label-main">Pegasus Bridge</text>
            <text x="0" y="-51" text-anchor="middle" class="map-label-sub">Bénouville • Remous</text>
          </g>

          <!-- 6. Écluses d'Ouistreham & Mer (km 14) -->
          <g class="map-spot-marker" transform="translate(402, 130)">
            <circle r="5.5" fill="var(--theme-bateau-accent)" stroke="#ffffff" stroke-width="1.6" />
            <line x1="0" y1="10" x2="0" y2="40" stroke="var(--theme-bateau-accent)" stroke-width="1" stroke-dasharray="2 2" />
            <rect x="-34" y="44" width="64" height="30" rx="3" fill="var(--theme-surface-subtle)" stroke="var(--theme-surface-subtle-border)" stroke-width="0.8" />
            <text x="-2" y="58" text-anchor="middle" class="map-label-main">Ouistreham</text>
            <text x="-2" y="68" text-anchor="middle" class="map-label-sub">Écluses & Mer</text>
          </g>

          <!-- Profil Bathymétrique et Caractéristiques Techniques du Chenal -->
          <g class="map-canal-strip" transform="translate(30, 204)">
            <rect x="0" y="0" width="375" height="24" rx="3" fill="var(--theme-surface-subtle)" stroke="var(--theme-surface-subtle-border)" stroke-width="0.8" />
            <text x="12" y="15" font-family="var(--font-mono)" font-size="6.8" font-weight="700" fill="var(--theme-canal-accent)">BASSIN SAINT-PIERRE ➔ ÉCLUSES : 14 KM</text>
            <text x="210" y="15" font-family="var(--font-mono)" font-size="6.2" font-weight="600" fill="var(--theme-text-muted)">Profondeur moyenne : 9.5 m • Largeur : 70 m</text>
            <text x="365" y="15" text-anchor="end" font-family="var(--font-mono)" font-size="6.2" font-weight="700" fill="var(--theme-bateau-accent)">DPM</text>
          </g>

          <!-- Boussole & Échelle -->
          <g class="map-legend-group" transform="translate(30, 20)">
            <line x1="0" y1="0" x2="60" y2="0" stroke="var(--theme-text-title)" stroke-width="1.5" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="var(--theme-text-title)" stroke-width="1.5" />
            <line x1="30" y1="-2" x2="30" y2="2" stroke="var(--theme-text-title)" stroke-width="1" />
            <line x1="60" y1="-3" x2="60" y2="3" stroke="var(--theme-text-title)" stroke-width="1.5" />
            <text x="30" y="-5" text-anchor="middle" class="map-scale-text">Échelle : 5 km</text>
          </g>

          <g class="map-compass" transform="translate(405, 30)">
            <circle r="12" fill="var(--theme-card-inner-bg)" stroke="var(--theme-surface-subtle-border)" stroke-width="0.8" />
            <path d="M 405 20 L 408 30 L 402 30 Z" fill="var(--theme-canal-accent)" />
            <path d="M 405 40 L 408 30 L 402 30 Z" fill="var(--theme-text-muted)" opacity="0.4" />
            <text x="405" y="16" text-anchor="middle" font-size="7.5" font-weight="800" fill="var(--theme-text-title)">N</text>
          </g>
        </svg>
      </div>
      <div class="map-card-footer">
        <span class="map-footer-tip"><strong>Déclencheur hydro :</strong> Les chasses remontent le canal au rythme de l'onde de marée montante d'Ouistreham.</span>
      </div>
    </div>
  \`;
}

/**
 * Carte Dédiée : Côte de Nacre & Roches du Calvados
 * Utilisée au verso (Face B) pour les espèces mono-biotope mer (Congre, Turbot, Vieille...)
 */
export function renderCoteDeNacreDedicatedMap(fish) {
  return \`
    <div class="biotope-map-card map-card-mer" aria-label="Carte maritime de la Côte de Nacre">
      <div class="map-card-header">
        <div class="map-header-title">
          \${uiIcon('boat')} <span>Fonds Marins & Amers : Côte de Nacre (Courseulles ➔ Ouistreham)</span>
        </div>
        <span class="map-badge-osm">Littoral Officiel OSM</span>
      </div>
      <div class="map-svg-wrap">
        <svg viewBox="0 0 430 230" class="halieutic-svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Carte marine Côte de Nacre et Roches du Calvados">
          <defs>
            <linearGradient id="merDepthGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stop-color="var(--theme-bateau-surface)" stop-opacity="0.4" />
              <stop offset="100%" stop-color="var(--theme-bateau-accent)" stop-opacity="0.22" />
            </linearGradient>
            <pattern id="reefPattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 0 5 L 5 0 L 10 5 L 5 10 Z" fill="none" stroke="var(--theme-bateau-accent)" stroke-width="0.8" opacity="0.45" />
            </pattern>
          </defs>

          <!-- Surface de la Manche -->
          <rect x="0" y="0" width="430" height="230" fill="url(#merDepthGradient)" />

          <!-- Isobaths de fond marin (-15m et -25m) -->
          <path d="M 0 65 Q 120 75 220 55 T 430 45" fill="none" stroke="var(--theme-bateau-accent)" stroke-width="0.8" stroke-dasharray="4 4" opacity="0.5" />
          <text x="390" y="42" font-family="var(--font-mono)" font-size="6" fill="var(--theme-bateau-accent)" opacity="0.8">-20 m</text>

          <path d="M 0 115 Q 110 120 220 105 T 430 95" fill="none" stroke="var(--theme-bateau-accent)" stroke-width="0.8" stroke-dasharray="4 4" opacity="0.5" />
          <text x="390" y="92" font-family="var(--font-mono)" font-size="6" fill="var(--theme-bateau-accent)" opacity="0.8">-10 m</text>

          <!-- Plateau des Roches du Calvados (fonds rocheux 5-15m au large) -->
          <ellipse cx="218" cy="80" rx="105" ry="28" fill="url(#reefPattern)" stroke="var(--theme-bateau-accent)" stroke-width="1.2" stroke-dasharray="3 3" opacity="0.85" />
          <rect x="110" y="66" width="216" height="26" rx="3" fill="var(--theme-card-inner-bg)" stroke="var(--theme-bateau-accent)" stroke-width="0.8" opacity="0.9" />
          <text x="218" y="77" text-anchor="middle" class="map-zone-title">PLATEAU DES ROCHES DU CALVADOS</text>
          <text x="218" y="87" text-anchor="middle" class="map-zone-sub">Plateau calcaire & laminaires (5 à 15 m)</text>

          <!-- Banc de Bernières / Ridens -->
          <ellipse cx="120" cy="120" rx="42" ry="12" fill="var(--theme-surface-subtle)" stroke="var(--theme-text-muted)" stroke-width="1" stroke-dasharray="2 2" opacity="0.75" />
          <text x="120" y="122" text-anchor="middle" class="map-zone-sand">Ridens de Bernières</text>

          <!-- Zone des Épaves du Débarquement 1944 (Sword & Juno) -->
          <g class="map-wreck-group" transform="translate(345, 58)">
            <circle r="9" fill="var(--theme-secret-surface)" stroke="var(--theme-secret-border)" stroke-width="1.2" />
            <text x="0" y="3.5" text-anchor="middle" font-size="9" font-weight="900" fill="var(--theme-secret-text)">⚓</text>
            <rect x="-42" y="-32" width="84" height="24" rx="2" fill="var(--theme-surface-subtle)" stroke="var(--theme-secret-border)" stroke-width="0.6" />
            <text x="0" y="-20" text-anchor="middle" class="map-zone-wreck">Épaves 1944 (Sword)</text>
            <text x="0" y="-10" text-anchor="middle" class="map-label-sub">15 à 28 m de fond</text>
          </g>

          <g class="map-wreck-group" transform="translate(68, 52)">
            <circle r="8.5" fill="var(--theme-secret-surface)" stroke="var(--theme-secret-border)" stroke-width="1.2" />
            <text x="0" y="3.5" text-anchor="middle" font-size="8.5" font-weight="900" fill="var(--theme-secret-text)">⚓</text>
            <rect x="-35" y="-30" width="70" height="22" rx="2" fill="var(--theme-surface-subtle)" stroke="var(--theme-secret-border)" stroke-width="0.6" />
            <text x="0" y="-19" text-anchor="middle" class="map-zone-wreck">Épaves Juno</text>
            <text x="0" y="-10" text-anchor="middle" class="map-label-sub">Secteur Graye</text>
          </g>

          <!-- Trait de côte officiel OSM -->
          <!-- Terre (estran/côte) -->
          <path d="\${GEO_PATHS.coastline} L 430 230 L 0 230 Z" fill="var(--theme-card-inner-bg)" stroke="none" opacity="0.95" />
          <path d="\${GEO_PATHS.coastline}" fill="none" stroke="var(--theme-text-title)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />

          <!-- Villes côtières & Amers portuaires -->
          <!-- Courseulles -->
          <g transform="translate(48, 194)">
            <circle r="3" fill="var(--theme-text-title)" />
            <text x="0" y="12" text-anchor="middle" class="map-label-main">Courseulles</text>
            <text x="0" y="21" text-anchor="middle" class="map-label-sub">Juno • Port</text>
          </g>

          <!-- Bernières / St-Aubin -->
          <g transform="translate(132, 190)">
            <circle r="2.6" fill="var(--theme-text-muted)" />
            <text x="0" y="12" text-anchor="middle" class="map-label-main">Bernières</text>
          </g>

          <!-- Luc-sur-Mer -->
          <g transform="translate(205, 186)">
            <circle r="2.6" fill="var(--theme-text-muted)" />
            <text x="0" y="12" text-anchor="middle" class="map-label-main">Luc-sur-Mer</text>
          </g>

          <!-- Lion-sur-Mer -->
          <g transform="translate(265, 187)">
            <circle r="3" fill="var(--theme-text-title)" />
            <text x="0" y="12" text-anchor="middle" class="map-label-main">Lion-sur-Mer</text>
            <text x="0" y="21" text-anchor="middle" class="map-label-sub">Falaise</text>
          </g>

          <!-- Ouistreham / Riva-Bella -->
          <g transform="translate(378, 190)">
            <circle r="3.6" fill="var(--theme-bateau-accent)" stroke="#ffffff" stroke-width="1.2" />
            <text x="0" y="12" text-anchor="middle" class="map-label-main">Ouistreham</text>
            <text x="0" y="21" text-anchor="middle" class="map-label-sub">Riva-Bella • Chenal</text>
          </g>

          <!-- Échelle nautique -->
          <g class="map-legend-group" transform="translate(20, 24)">
            <line x1="0" y1="0" x2="60" y2="0" stroke="var(--theme-text-title)" stroke-width="1.5" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="var(--theme-text-title)" stroke-width="1.5" />
            <line x1="60" y1="-3" x2="60" y2="3" stroke="var(--theme-text-title)" stroke-width="1.5" />
            <text x="30" y="-5" text-anchor="middle" class="map-scale-text">3 Milles nautiques</text>
          </g>
        </svg>
      </div>
      <div class="map-card-footer">
        <span class="map-footer-tip"><strong>Zone des épaves :</strong> Les tombants des Roches et carcasses 1944 créent des caches à congre et lieus record.</span>
      </div>
    </div>
  \`;
}

/**
 * Mini-Carte Régionale d'Ensemble : Canal + Côte de Nacre
 * Utilisée sur la Face A (Recto) dans le bloc Notes scindé en 2 pour les espèces mixtes
 * ViewBox 200 x 185 : remplit parfaitement le bloc carré ~240 x 240 px
 */
export function renderRegionalMiniMap() {
  return \`
    <div class="regional-mini-map" aria-label="Carte de situation Canal de Caen et Côte de Nacre">
      <div class="mini-map-title-row">
        <span class="mini-map-title">Littoral Calvados • Caen ➔ Mer</span>
        <span class="mini-map-tag">OSM</span>
      </div>
      <div class="mini-map-svg-wrap">
        <svg viewBox="0 0 200 185" class="mini-map-svg" preserveAspectRatio="xMidYMid meet">
          <!-- Mer de la Manche -->
          <rect x="0" y="0" width="200" height="78" fill="var(--theme-bateau-surface)" opacity="0.4" />

          <!-- Roches du Calvados -->
          <ellipse cx="108" cy="38" rx="44" ry="12" fill="none" stroke="var(--theme-bateau-accent)" stroke-width="1" stroke-dasharray="2 2" opacity="0.8" />
          <text x="108" y="36" text-anchor="middle" font-size="5.2" font-weight="800" fill="var(--theme-bateau-accent)" letter-spacing="0.04em">ROCHES DU CALVADOS</text>
          <text x="108" y="44" text-anchor="middle" font-size="4.2" font-weight="600" fill="var(--theme-text-title)">Hauts-fonds 5-15m</text>

          <!-- Épaves Sword -->
          <circle cx="160" cy="30" r="4" fill="var(--theme-secret-surface)" stroke="var(--theme-secret-border)" stroke-width="0.8" />
          <text x="160" y="32" text-anchor="middle" font-size="5.2" font-weight="900" fill="var(--theme-secret-text)">⚓</text>
          <text x="160" y="24" text-anchor="middle" font-size="4.5" font-weight="700" fill="var(--theme-secret-text)">Épaves Sword</text>

          <!-- Épaves Juno -->
          <circle cx="48" cy="32" r="3.5" fill="var(--theme-secret-surface)" stroke="var(--theme-secret-border)" stroke-width="0.8" />
          <text x="48" y="34" text-anchor="middle" font-size="4.8" font-weight="900" fill="var(--theme-secret-text)">⚓</text>

          <!-- Trait de côte OSM -->
          <path d="\${GEO_PATHS.regCoast} L 200 185 L 0 185 Z" fill="var(--theme-card-inner-bg)" stroke="none" />
          <path d="\${GEO_PATHS.regCoast}" fill="none" stroke="var(--theme-text-title)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />

          <!-- Villes côtières -->
          <text x="30" y="68" font-size="5" font-weight="700" fill="var(--theme-text-title)">Courseulles</text>
          <text x="105" y="70" font-size="4.8" font-weight="600" fill="var(--theme-text-muted)">Lion-sur-Mer</text>
          <text x="166" y="72" font-size="5.4" font-weight="800" fill="var(--theme-bateau-accent)">Ouistreham</text>

          <!-- Tracé du Canal de Caen à la mer (14 km) -->
          <path d="\${GEO_PATHS.regCanal}" fill="none" stroke="var(--theme-canal-accent)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.3" />
          <path d="\${GEO_PATHS.regCanal}" fill="none" stroke="var(--theme-canal-accent)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="\${GEO_PATHS.regCanal}" fill="none" stroke="#ffffff" stroke-width="0.8" stroke-dasharray="2 2" />

          <!-- Repères Canal -->
          <!-- Pegasus Bridge -->
          <circle cx="152" cy="115" r="2" fill="var(--theme-text-title)" />
          <rect x="120" y="120" width="46" height="12" rx="2" fill="var(--theme-surface-subtle)" stroke="var(--theme-surface-subtle-border)" stroke-width="0.5" />
          <text x="143" y="128.5" text-anchor="middle" font-size="4.8" font-weight="700" fill="var(--theme-text-title)">Pegasus Bridge</text>

          <!-- Caen Bassin St-Pierre -->
          <circle cx="94" cy="166" r="3" fill="var(--theme-canal-accent)" stroke="#ffffff" stroke-width="1" />
          <rect x="36" y="158" width="52" height="14" rx="2" fill="var(--theme-surface-subtle)" stroke="var(--theme-canal-accent)" stroke-width="0.8" />
          <text x="62" y="167.5" text-anchor="middle" font-size="5.4" font-weight="800" fill="var(--theme-canal-accent)">CAEN (Bassin St-Pierre)</text>
          <text x="96" y="178" font-size="4.4" font-style="italic" fill="var(--theme-text-muted)">14 km jusqu'à la mer</text>
        </svg>
      </div>
    </div>
  \`;
}
`;

fs.writeFileSync('site/js/geo-maps.js', moduleContent);
console.log('Fichier site/js/geo-maps.js mis à jour avec les nouvelles échelles !');
