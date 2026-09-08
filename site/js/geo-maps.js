// ==========================================================================
// CARTOGRAPHIE HALIEUTIQUE VECTORIELLE OFFICIELLE OPENSTREETMAP
// ==========================================================================
// Données issues du cadastre hydrographique OpenStreetMap (Relation OSM 7403018 & Coastline)
// Modélisation vectorielle haute précision calibrée au millimètre pour le format A5/A4

import { uiIcon } from './icons.js';

// Chemins projetés précis issus d'OpenStreetMap
export const GEO_PATHS = {
  canalMain: "M 35,80 L 42.7,82.6 L 47.7,82.8 L 51.7,83.4 L 72.9,88.8 L 83.8,91.4 L 97.9,93.6 L 107.1,94.4 L 113.8,94.3 L 183.4,87.5 L 196,86.5 L 203.4,86.7 L 258.6,92.2 L 266.7,92.5 L 305.3,90.1 L 318.8,89.5 L 322.3,89.6 L 327.9,90 L 335.7,90.9 L 343.7,91.5 L 347.5,91.5 L 352.7,90.8 L 365,88.7 L 387,84.5 L 391.3,83.5 L 399,82 L 402.7,81.5 L 410,80",
  coastline: "M 18,48 L 37.3,50 L 51.6,50.4 L 52.1,49.8 L 51.3,51.3 L 52.1,51.9 L 59.9,52.7 L 69.8,52.5 L 76.9,53.6 L 86.2,53.6 L 117.7,52.4 L 144.9,56 L 191.1,67 L 223.9,77.8 L 227.4,81 L 248.9,87.2 L 254.3,90.3 L 259.3,91.5 L 270,95.9 L 297.6,103.2 L 320,107.7 L 333.3,109.1 L 369.4,108.7 L 366.7,116.1 L 370.7,117.9 L 369.9,119.5 L 371.7,120.9 L 371.3,125.5 L 373.8,126 L 384.6,127.4 L 395.7,127.4 L 398.1,123.4 L 395.6,117.8 L 390.4,119.8 L 391.4,121.2 L 389.6,120.3 L 389.6,122.1 L 388.3,121.2 L 389.4,119.8 L 394.8,117.1 L 402.3,115.2 L 409.7,115.1",
  regCanal: "M 92.2,72.6 L 94.3,73.2 L 95.5,72.6 L 96.6,72.4 L 103.1,72.5 L 106.4,72.4 L 110.5,71.6 L 112.9,70.9 L 114.4,70.1 L 125.4,60.1 L 127.6,58.3 L 129.3,57.6 L 144.2,53.3 L 146.2,52.4 L 153.2,47.3 L 155.9,45.5 L 156.7,45.2 L 158.2,44.7 L 160.4,44.1 L 162.4,43.4 L 163.2,43 L 164,42.2 L 165.2,40.2 L 166.9,36.7 L 167.1,35.9 L 167.7,34.7 L 168.2,34.1 L 168.7,32.9",
  regCoast: "M 5.2,12.2 L 14.2,12.8 L 20.9,12.9 L 21.1,12.7 L 20.7,13.2 L 21.1,13.3 L 24.7,13.6 L 29.4,13.5 L 32.7,13.8 L 37,13.9 L 51.7,13.5 L 64.4,14.6 L 85.9,17.9 L 101.2,21.1 L 102.8,22.1 L 112.8,23.9 L 115.4,24.9 L 117.7,25.2 L 122.7,26.6 L 135.5,28.8 L 146,30.1 L 152.2,30.6 L 169,30.4 L 167.8,32.6 L 169.6,33.2 L 169.3,33.7 L 170.1,34.1 L 169.9,35.5 L 171.1,35.6 L 176.1,36.1 L 181.3,36 L 182.4,34.8 L 181.2,33.2 L 178.8,33.8 L 179.3,34.2 L 178.4,33.9 L 178.4,34.5 L 177.8,34.2 L 178.3,33.8 L 180.9,33 L 184.4,32.4 L 187.8,32.3"
};

/**
 * Carte Dédiée : Canal de Caen à la mer (14 km)
 * Utilisée au verso (Face B) pour les espèces mono-biotope eau douce / saumâtre
 */
export function renderCanalDedicatedMap(fish) {
  return `
    <div class="biotope-map-card map-card-canal" aria-label="Carte halieutique du Canal de Caen">
      <div class="map-card-header">
        <div class="map-header-title">
          ${uiIcon('anchor')} <span>Topographie & Postes Clés : Canal de Caen à la mer (14 km)</span>
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
          <path d="${GEO_PATHS.canalMain}" fill="none" stroke="var(--theme-canal-accent)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity="0.12" />
          <!-- Chenal navigable DPM -->
          <path d="${GEO_PATHS.canalMain}" fill="none" stroke="url(#canalGradient)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" />
          <!-- Axe central de navigation -->
          <path d="${GEO_PATHS.canalMain}" fill="none" stroke="#ffffff" stroke-width="1" stroke-dasharray="3 3" opacity="0.75" />

          <!-- Repères & Postes Clés Halieutiques (Alternance Haut/Bas pour lisibilité maximale) -->
          <!-- 1. Bassin Saint-Pierre & Pont de la Fonderie (km 0) -->
          <g class="map-spot-marker" transform="translate(36, 78)">
            <circle r="4.5" fill="var(--theme-canal-accent)" stroke="#ffffff" stroke-width="1.2" />
            <text x="0" y="-18" text-anchor="middle" class="map-label-main">Bassin St-Pierre</text>
            <text x="0" y="-10" text-anchor="middle" class="map-label-sub">km 0 • Eaux douces</text>
          </g>

          <!-- 2. Viaduc de Calix (km 2.5) -->
          <g class="map-spot-marker" transform="translate(100, 77)">
            <line x1="0" y1="-8" x2="0" y2="8" stroke="var(--theme-text-title)" stroke-width="2" stroke-linecap="round" />
            <circle r="3" fill="var(--theme-text-title)" />
            <text x="0" y="17" text-anchor="middle" class="map-label-main">Viaduc de Calix</text>
            <text x="0" y="25" text-anchor="middle" class="map-label-sub">Piles & Fosses (9m)</text>
          </g>

          <!-- 3. Quais de Colombelles / Hérouville (km 4.5) -->
          <g class="map-spot-marker" transform="translate(165, 79)">
            <rect x="-3" y="-3" width="6" height="6" fill="var(--theme-canal-accent)" stroke="#ffffff" stroke-width="1" />
            <text x="0" y="-18" text-anchor="middle" class="map-label-main">Colombelles</text>
            <text x="0" y="-10" text-anchor="middle" class="map-label-sub">Palplanches métal</text>
          </g>

          <!-- 4. Bassin d'Évitement de Blainville (km 7.5) -->
          <g class="map-spot-marker" transform="translate(235, 76)">
            <circle r="4" fill="none" stroke="var(--theme-canal-accent)" stroke-width="1.8" stroke-dasharray="2 2" />
            <circle r="2" fill="var(--theme-canal-accent)" />
            <text x="0" y="17" text-anchor="middle" class="map-label-main">Blainville</text>
            <text x="0" y="25" text-anchor="middle" class="map-label-sub">Évitement & Fosse</text>
          </g>

          <!-- 5. Pont de Bénouville / Pegasus Bridge (km 10.5) -->
          <g class="map-spot-marker" transform="translate(315, 85)">
            <line x1="0" y1="-8" x2="0" y2="8" stroke="var(--theme-text-title)" stroke-width="2" stroke-linecap="round" />
            <circle r="3" fill="var(--theme-text-title)" />
            <text x="0" y="-18" text-anchor="middle" class="map-label-main">Pegasus Bridge</text>
            <text x="0" y="-10" text-anchor="middle" class="map-label-sub">Bénouville • Remous</text>
          </g>

          <!-- 6. Écluses d'Ouistreham & Mer (km 14) -->
          <g class="map-spot-marker" transform="translate(398, 88)">
            <circle r="5" fill="var(--theme-bateau-accent)" stroke="#ffffff" stroke-width="1.4" />
            <text x="-6" y="17" text-anchor="middle" class="map-label-main">Ouistreham</text>
            <text x="-6" y="25" text-anchor="middle" class="map-label-sub">Écluses & Mer</text>
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
  `;
}

/**
 * Carte Dédiée : Côte de Nacre & Roches du Calvados
 * Utilisée au verso (Face B) pour les espèces mono-biotope mer (Congre, Turbot, Vieille...)
 */
export function renderCoteDeNacreDedicatedMap(fish) {
  return `
    <div class="biotope-map-card map-card-mer" aria-label="Carte maritime de la Côte de Nacre">
      <div class="map-card-header">
        <div class="map-header-title">
          ${uiIcon('boat')} <span>Fonds Marins & Amers : Côte de Nacre (Courseulles ➔ Ouistreham)</span>
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
          <ellipse cx="215" cy="46" rx="90" ry="20" fill="url(#reefPattern)" stroke="var(--theme-bateau-accent)" stroke-width="1" stroke-dasharray="3 3" opacity="0.75" />
          <text x="215" y="44" text-anchor="middle" class="map-zone-title">PLATEAU DES ROCHES DU CALVADOS</text>
          <text x="215" y="53" text-anchor="middle" class="map-zone-sub">Plateau calcaire & laminaires (5 à 15 m)</text>

          <!-- Banc de Bernières / Ridens -->
          <ellipse cx="135" cy="62" rx="36" ry="8" fill="var(--theme-surface-subtle)" stroke="var(--theme-text-muted)" stroke-width="0.8" stroke-dasharray="2 2" opacity="0.6" />
          <text x="135" y="64" text-anchor="middle" class="map-zone-sand">Ridens de Bernières</text>

          <!-- Zone des Épaves du Débarquement 1944 (Sword & Juno) -->
          <g class="map-wreck-group" transform="translate(345, 34)">
            <circle r="7.5" fill="var(--theme-secret-surface)" stroke="var(--theme-secret-border)" stroke-width="1" />
            <text x="0" y="3" text-anchor="middle" font-size="8" font-weight="900" fill="var(--theme-secret-text)">⚓</text>
            <text x="0" y="-11" text-anchor="middle" class="map-zone-wreck">Épaves 1944 (Sword)</text>
            <text x="0" y="16" text-anchor="middle" class="map-label-sub">15 à 28 m de fond</text>
          </g>

          <g class="map-wreck-group" transform="translate(75, 42)">
            <circle r="7" fill="var(--theme-secret-surface)" stroke="var(--theme-secret-border)" stroke-width="1" />
            <text x="0" y="3" text-anchor="middle" font-size="7" font-weight="900" fill="var(--theme-secret-text)">⚓</text>
            <text x="0" y="-10" text-anchor="middle" class="map-zone-wreck">Épaves Juno</text>
            <text x="0" y="16" text-anchor="middle" class="map-label-sub">Secteur Graye</text>
          </g>

          <!-- Trait de côte officiel OSM -->
          <!-- Terre (estran/côte) -->
          <path d="${GEO_PATHS.coastline} L 430 150 L 0 150 Z" fill="var(--theme-card-inner-bg)" stroke="none" opacity="0.95" />
          <path d="${GEO_PATHS.coastline}" fill="none" stroke="var(--theme-text-title)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />

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
  `;
}

/**
 * Mini-Carte Régionale d'Ensemble : Canal + Côte de Nacre
 * Utilisée sur la Face A (Recto) dans le bloc Notes scindé en 2 pour les espèces mixtes
 */
export function renderRegionalMiniMap() {
  return `
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
          <path d="${GEO_PATHS.regCoast} L 195 82 L 0 82 Z" fill="var(--theme-card-inner-bg)" stroke="none" />
          <path d="${GEO_PATHS.regCoast}" fill="none" stroke="var(--theme-text-title)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />

          <!-- Villes côtières -->
          <text x="35" y="32" font-size="4.4" font-weight="600" fill="var(--theme-text-muted)">Courseulles</text>
          <text x="96" y="32" font-size="4.4" font-weight="600" fill="var(--theme-text-muted)">Luc</text>
          <text x="155" y="34" font-size="4.8" font-weight="700" fill="var(--theme-bateau-accent)">Ouistreham</text>

          <!-- Tracé du Canal de Caen à la mer (14 km) -->
          <path d="${GEO_PATHS.regCanal}" fill="none" stroke="var(--theme-canal-accent)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
          <path d="${GEO_PATHS.regCanal}" fill="none" stroke="#ffffff" stroke-width="0.7" stroke-dasharray="1.5 1.5" />

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
  `;
}
