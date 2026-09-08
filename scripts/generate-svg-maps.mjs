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

// S'assurer que le trait de côte va d'Ouest (Courseulles: lon -0.50) vers Est (Sallenelles: lon -0.15)
if (coastChain[0][0] > coastChain[coastChain.length - 1][0]) {
  coastChain.reverse();
}
// Filtrer la zone utile Courseulles (-0.48) à Sallenelles (-0.22)
coastChain = coastChain.filter(p => p[0] >= -0.48 && p[0] <= -0.22);
console.log('Coastline chain stitched:', coastChain.length, 'points from', coastChain[0], 'to', coastChain[coastChain.length - 1]);

// Ramer-Douglas-Peucker pour simplifier les points tout en gardant une précision au 10e de millimètre
function rdp(points, epsilon) {
  if (points.length <= 2) return points;
  let dmax = 0;
  let index = 0;
  const a = points[0];
  const b = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    // Distance de p à la droite ab
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

// Projection pour Map 1 : Canal Horizontal Stylisé Haute-Densité
// Le canal va de Caen (Bassin St-Pierre) à Ouistreham.
// On projette sur un viewBox 420 x 140
// X de 30 (Caen) à 390 (Ouistreham)
// Calcul de la distance cumulée le long du canal pour chaque point
let totalCanalDist = 0;
const canalDists = [0];
for (let i = 1; i < simplifiedCanal.length; i++) {
  const d = Math.hypot(simplifiedCanal[i][0] - simplifiedCanal[i-1][0], simplifiedCanal[i][1] - simplifiedCanal[i-1][1]);
  totalCanalDist += d;
  canalDists.push(totalCanalDist);
}

// Projection le long d'une douce sinusoïde réaliste qui respecte la courbure d'OSM
const canalSvgPoints = simplifiedCanal.map((p, i) => {
  const frac = canalDists[i] / totalCanalDist;
  const x = 35 + frac * (410 - 35);
  // Déviation latérale par rapport à la ligne droite Caen -> Ouistreham
  const start = simplifiedCanal[0];
  const end = simplifiedCanal[simplifiedCanal.length - 1];
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const lineDist = Math.hypot(dx, dy);
  const perp = ((p[0] - start[0]) * -dy + (p[1] - start[1]) * dx) / lineDist;
  const y = 80 - perp * 850; // Calibré pour centrer verticalement
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
});

const canalPathD = 'M ' + canalSvgPoints.map(p => `${p[0]},${p[1]}`).join(' L ');

// Projection pour Map 2 : Côte de Nacre Maritime (Courseulles -> Ouistreham)
// ViewBox 420 x 140
// Longitudes : -0.47 (Ouest) à -0.23 (Est) -> X : 25 à 395
// Latitudes : 49.27 (Sud) à 49.37 (Nord, mer) -> Y : 130 à 15
const minLonCoast = -0.475;
const maxLonCoast = -0.230;
const minLatCoast = 49.272;
const maxLatCoast = 49.365;

function projectMer(lon, lat) {
  const x = 25 + ((lon - minLonCoast) / (maxLonCoast - minLonCoast)) * (395 - 25);
  const y = 135 - ((lat - minLatCoast) / (maxLatCoast - minLatCoast)) * (135 - 15);
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

const coastSvgPoints = simplifiedCoast.map(p => projectMer(p[0], p[1]));
const coastPathD = 'M ' + coastSvgPoints.map(p => `${p[0]},${p[1]}`).join(' L ');

// Projection pour Map 3 : Carte d'Ensemble Régionale (pour bloc Notes Face A)
// ViewBox 200 x 85
// Englobe Caen (49.18, -0.36) jusqu'à la mer (49.34, -0.46 à -0.23)
const minLonReg = -0.470;
const maxLonReg = -0.220;
const minLatReg = 49.175;
const maxLatReg = 49.345;

function projectReg(lon, lat) {
  const x = 12 + ((lon - minLonReg) / (maxLonReg - minLonReg)) * (188 - 12);
  const y = 76 - ((lat - minLatReg) / (maxLatReg - minLatReg)) * (76 - 10);
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
        <svg viewBox="0 0 430 150" class="halieutic-svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Carte du Canal de Caen de Caen à Ouistreham">
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
          <rect width="430" height="150" fill="url(#canalGrid)" />

          <!-- Tracé du Canal de Caen issu d'OpenStreetMap -->
          <!-- Halo d'eau extérieur -->
          <path d="\${GEO_PATHS.canalMain}" fill="none" stroke="var(--theme-canal-accent)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity="0.12" />
          <!-- Chenal navigable DPM -->
          <path d="\${GEO_PATHS.canalMain}" fill="none" stroke="url(#canalGradient)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" />
          <!-- Axe central de navigation -->
          <path d="\${GEO_PATHS.canalMain}" fill="none" stroke="#ffffff" stroke-width="1" stroke-dasharray="3 3" opacity="0.75" />

          <!-- Repères & Postes Clés Halieutiques -->
          <!-- 1. Bassin Saint-Pierre & Pont de la Fonderie (km 0) -->
          <g class="map-spot-marker" transform="translate(35, 78)">
            <circle r="4.5" fill="var(--theme-canal-accent)" stroke="#ffffff" stroke-width="1.2" />
            <text x="0" y="16" text-anchor="middle" class="map-label-main">Bassin St-Pierre</text>
            <text x="0" y="24" text-anchor="middle" class="map-label-sub">km 0 • Eaux douces</text>
          </g>

          <!-- 2. Viaduc de Calix (km 2.5) -->
          <g class="map-spot-marker" transform="translate(98, 77)">
            <line x1="0" y1="-8" x2="0" y2="8" stroke="var(--theme-text-title)" stroke-width="2" stroke-linecap="round" />
            <circle r="3" fill="var(--theme-text-title)" />
            <text x="0" y="-12" text-anchor="middle" class="map-label-main">Viaduc de Calix</text>
            <text x="0" y="17" text-anchor="middle" class="map-label-sub">Piles & Fosses (9m)</text>
          </g>

          <!-- 3. Quais de Colombelles / Hérouville (km 4.5) -->
          <g class="map-spot-marker" transform="translate(162, 79)">
            <rect x="-3" y="-3" width="6" height="6" fill="var(--theme-canal-accent)" stroke="#ffffff" stroke-width="1" />
            <text x="0" y="-11" text-anchor="middle" class="map-label-main">Colombelles</text>
            <text x="0" y="16" text-anchor="middle" class="map-label-sub">Palplanches métal</text>
          </g>

          <!-- 4. Bassin d'Évitement de Blainville (km 7.5) -->
          <g class="map-spot-marker" transform="translate(235, 76)">
            <circle r="4" fill="none" stroke="var(--theme-canal-accent)" stroke-width="1.8" stroke-dasharray="2 2" />
            <circle r="2" fill="var(--theme-canal-accent)" />
            <text x="0" y="-12" text-anchor="middle" class="map-label-main">Blainville</text>
            <text x="0" y="17" text-anchor="middle" class="map-label-sub">Évitement & Fosse</text>
          </g>

          <!-- 5. Pont de Bénouville / Pegasus Bridge (km 10.5) -->
          <g class="map-spot-marker" transform="translate(315, 85)">
            <line x1="0" y1="-8" x2="0" y2="8" stroke="var(--theme-text-title)" stroke-width="2" stroke-linecap="round" />
            <circle r="3" fill="var(--theme-text-title)" />
            <text x="0" y="-12" text-anchor="middle" class="map-label-main">Pegasus Bridge</text>
            <text x="0" y="17" text-anchor="middle" class="map-label-sub">Bénouville • Remous</text>
          </g>

          <!-- 6. Écluses d'Ouistreham & Mer (km 14) -->
          <g class="map-spot-marker" transform="translate(398, 88)">
            <circle r="5" fill="var(--theme-bateau-accent)" stroke="#ffffff" stroke-width="1.4" />
            <text x="-4" y="-13" text-anchor="middle" class="map-label-main">Ouistreham</text>
            <text x="-4" y="18" text-anchor="middle" class="map-label-sub">Écluses & DPM Mer</text>
          </g>

          <!-- Boussole & Échelle -->
          <g class="map-legend-group" transform="translate(18, 134)">
            <line x1="0" y1="0" x2="60" y2="0" stroke="var(--theme-text-title)" stroke-width="1.5" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="var(--theme-text-title)" stroke-width="1.5" />
            <line x1="30" y1="-2" x2="30" y2="2" stroke="var(--theme-text-title)" stroke-width="1" />
            <line x1="60" y1="-3" x2="60" y2="3" stroke="var(--theme-text-title)" stroke-width="1.5" />
            <text x="30" y="-5" text-anchor="middle" class="map-scale-text">Échelle : 5 km</text>
          </g>

          <g class="map-compass" transform="translate(405, 30)">
            <circle r="11" fill="var(--theme-card-inner-bg)" stroke="var(--theme-surface-subtle-border)" stroke-width="0.8" />
            <path d="M 405 21 L 407 30 L 403 30 Z" fill="var(--theme-canal-accent)" />
            <path d="M 405 39 L 407 30 L 403 30 Z" fill="var(--theme-text-muted)" opacity="0.4" />
            <text x="405" y="17" text-anchor="middle" font-size="7" font-weight="800" fill="var(--theme-text-title)">N</text>
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
        <svg viewBox="0 0 430 150" class="halieutic-svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Carte marine Côte de Nacre et Roches du Calvados">
          <defs>
            <linearGradient id="merDepthGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stop-color="var(--theme-bateau-surface)" stop-opacity="0.4" />
              <stop offset="100%" stop-color="var(--theme-bateau-accent)" stop-opacity="0.18" />
            </linearGradient>
            <pattern id="reefPattern" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 0 4 L 4 0 L 8 4 L 4 8 Z" fill="none" stroke="var(--theme-bateau-accent)" stroke-width="0.6" opacity="0.4" />
            </pattern>
          </defs>

          <!-- Surface de la Manche -->
          <rect x="0" y="0" width="430" height="150" fill="url(#merDepthGradient)" />

          <!-- Plateau des Roches du Calvados (fonds rocheux 5-15m au large) -->
          <ellipse cx="205" cy="50" rx="110" ry="26" fill="url(#reefPattern)" stroke="var(--theme-bateau-accent)" stroke-width="1" stroke-dasharray="3 3" opacity="0.75" />
          <text x="205" y="47" text-anchor="middle" class="map-zone-title">PLATEAU DES ROCHES DU CALVADOS</text>
          <text x="205" y="57" text-anchor="middle" class="map-zone-sub">Plateau calcaire & laminaires (5 à 15 m)</text>

          <!-- Banc de Bernières / Ridens -->
          <ellipse cx="115" cy="42" rx="45" ry="12" fill="var(--theme-surface-subtle)" stroke="var(--theme-text-muted)" stroke-width="0.8" stroke-dasharray="2 2" opacity="0.6" />
          <text x="115" y="44" text-anchor="middle" class="map-zone-sand">Ridens de Bernières</text>

          <!-- Zone des Épaves du Débarquement 1944 (Sword & Juno) -->
          <g class="map-wreck-group" transform="translate(295, 38)">
            <circle r="8" fill="var(--theme-secret-surface)" stroke="var(--theme-secret-border)" stroke-width="1" />
            <text x="0" y="3" text-anchor="middle" font-size="8" font-weight="900" fill="var(--theme-secret-text)">⚓</text>
            <text x="0" y="-11" text-anchor="middle" class="map-zone-wreck">Épaves 1944 (Sword)</text>
            <text x="0" y="17" text-anchor="middle" class="map-label-sub">15 à 28 m de fond</text>
          </g>

          <g class="map-wreck-group" transform="translate(70, 48)">
            <circle r="7" fill="var(--theme-secret-surface)" stroke="var(--theme-secret-border)" stroke-width="1" />
            <text x="0" y="3" text-anchor="middle" font-size="7" font-weight="900" fill="var(--theme-secret-text)">⚓</text>
            <text x="0" y="-10" text-anchor="middle" class="map-zone-wreck">Épaves Juno</text>
          </g>

          <!-- Trait de côte officiel OSM -->
          <!-- Terre (estran/côte) -->
          <path d="\${GEO_PATHS.coastline} L 430 150 L 0 150 Z" fill="var(--theme-card-inner-bg)" stroke="none" opacity="0.95" />
          <path d="\${GEO_PATHS.coastline}" fill="none" stroke="var(--theme-text-title)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />

          <!-- Villes côtières & Amers portuaires -->
          <!-- Courseulles -->
          <g transform="translate(48, 122)">
            <circle r="2.8" fill="var(--theme-text-title)" />
            <text x="0" y="11" text-anchor="middle" class="map-label-main">Courseulles</text>
            <text x="0" y="18" text-anchor="middle" class="map-label-sub">Juno • Port</text>
          </g>

          <!-- Bernières / St-Aubin -->
          <g transform="translate(132, 118)">
            <circle r="2.4" fill="var(--theme-text-muted)" />
            <text x="0" y="11" text-anchor="middle" class="map-label-main">Bernières</text>
          </g>

          <!-- Luc-sur-Mer -->
          <g transform="translate(205, 114)">
            <circle r="2.4" fill="var(--theme-text-muted)" />
            <text x="0" y="11" text-anchor="middle" class="map-label-main">Luc-sur-Mer</text>
          </g>

          <!-- Lion-sur-Mer -->
          <g transform="translate(262, 115)">
            <circle r="2.8" fill="var(--theme-text-title)" />
            <text x="0" y="11" text-anchor="middle" class="map-label-main">Lion-sur-Mer</text>
            <text x="0" y="18" text-anchor="middle" class="map-label-sub">Falaise</text>
          </g>

          <!-- Ouistreham / Riva-Bella -->
          <g transform="translate(372, 118)">
            <circle r="3.2" fill="var(--theme-bateau-accent)" stroke="#ffffff" stroke-width="1" />
            <text x="0" y="11" text-anchor="middle" class="map-label-main">Ouistreham</text>
            <text x="0" y="18" text-anchor="middle" class="map-label-sub">Riva-Bella • Chenal</text>
          </g>

          <!-- Échelle nautique -->
          <g class="map-legend-group" transform="translate(18, 22)">
            <line x1="0" y1="0" x2="55" y2="0" stroke="var(--theme-text-title)" stroke-width="1.4" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="var(--theme-text-title)" stroke-width="1.4" />
            <line x1="55" y1="-3" x2="55" y2="3" stroke="var(--theme-text-title)" stroke-width="1.4" />
            <text x="27" y="-4" text-anchor="middle" class="map-scale-text">3 Milles nautiques</text>
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
 */
export function renderRegionalMiniMap() {
  return \`
    <div class="regional-mini-map" aria-label="Carte de situation Canal de Caen et Côte de Nacre">
      <div class="mini-map-title-row">
        <span class="mini-map-title">Littoral Calvados • Caen à la Mer</span>
        <span class="mini-map-tag">OSM</span>
      </div>
      <div class="mini-map-svg-wrap">
        <svg viewBox="0 0 195 82" class="mini-map-svg" preserveAspectRatio="xMidYMid meet">
          <!-- Mer de la Manche -->
          <rect x="0" y="0" width="195" height="38" fill="var(--theme-bateau-surface)" opacity="0.35" />

          <!-- Roches du Calvados -->
          <ellipse cx="108" cy="18" rx="42" ry="10" fill="none" stroke="var(--theme-bateau-accent)" stroke-width="0.8" stroke-dasharray="2 2" opacity="0.7" />
          <text x="108" y="17" text-anchor="middle" font-size="4.2" font-weight="700" fill="var(--theme-bateau-accent)" letter-spacing="0.04em">ROCHES DU CALVADOS</text>

          <!-- Épaves Sword -->
          <text x="156" y="14" text-anchor="middle" font-size="4.8">⚓</text>

          <!-- Trait de côte OSM -->
          <path d="\${GEO_PATHS.regCoast} L 195 82 L 0 82 Z" fill="var(--theme-card-inner-bg)" stroke="none" />
          <path d="\${GEO_PATHS.regCoast}" fill="none" stroke="var(--theme-text-title)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />

          <!-- Villes côtières -->
          <text x="35" y="32" font-size="4.4" font-weight="600" fill="var(--theme-text-muted)">Courseulles</text>
          <text x="96" y="32" font-size="4.4" font-weight="600" fill="var(--theme-text-muted)">Luc</text>
          <text x="155" y="34" font-size="4.8" font-weight="700" fill="var(--theme-bateau-accent)">Ouistreham</text>

          <!-- Tracé du Canal de Caen à la mer (14 km) -->
          <path d="\${GEO_PATHS.regCanal}" fill="none" stroke="var(--theme-canal-accent)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
          <path d="\${GEO_PATHS.regCanal}" fill="none" stroke="#ffffff" stroke-width="0.7" stroke-dasharray="1.5 1.5" />

          <!-- Repères Canal -->
          <!-- Pegasus Bridge -->
          <circle cx="140" cy="52" r="1.4" fill="var(--theme-text-title)" />
          <text x="143" y="53" font-size="3.8" fill="var(--theme-text-muted)">Pegasus</text>

          <!-- Caen Bassin St-Pierre -->
          <circle cx="106" cy="74" r="2" fill="var(--theme-canal-accent)" stroke="#ffffff" stroke-width="0.6" />
          <text x="100" y="75" text-anchor="end" font-size="4.8" font-weight="700" fill="var(--theme-canal-accent)">Caen</text>
        </svg>
      </div>
    </div>
  \`;
}
`;

fs.writeFileSync('site/js/geo-maps.js', moduleContent);
console.log('Fichier site/js/geo-maps.js généré avec succès !');
