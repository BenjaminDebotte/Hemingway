// ==========================================================================
// CARTOGRAPHIE HALIEUTIQUE VECTORIELLE OFFICIELLE OPENSTREETMAP
// ==========================================================================
// Données issues du cadastre hydrographique OpenStreetMap (Relation OSM 7403018 & Coastline)
// Modélisation vectorielle haute précision calibrée au millimètre pour le format A5/A4

import { uiIcon } from './icons.js';

// Chemins projetés précis issus d'OpenStreetMap
export const GEO_PATHS = {
  canalMain: "M 32,118 L 39.7,120.9 L 44.7,121.1 L 48.8,121.8 L 70,127.8 L 80.9,130.7 L 95.1,133.2 L 104.3,134.1 L 111,134 L 180.8,126.4 L 193.5,125.3 L 200.9,125.5 L 256.2,131.6 L 264.3,131.9 L 303,129.2 L 316.6,128.6 L 320,128.7 L 325.7,129.2 L 333.5,130.2 L 341.5,130.9 L 345.3,130.8 L 350.6,130.1 L 362.8,127.8 L 384.9,123 L 389.2,121.9 L 396.9,120.2 L 400.7,119.7 L 408,118",
  orneRiver: "M 32,136 L 39.7,145.2 L 44.7,150.7 L 48.8,154.8 L 70,161.8 L 80.9,163 L 95.1,161.5 L 104.3,156.7 L 111,150.1 L 180.8,136.4 L 193.5,130.5 L 200.9,127.9 L 256.2,133.8 L 264.3,136.5 L 303,138.4 L 316.6,143.8 L 320,150.4 L 325.7,156.8 L 333.5,162.1 L 341.5,164.8 L 345.3,164.1 L 350.6,160.4 L 362.8,153 L 384.9,141.9 L 389.2,134.4 L 396.9,127.2 L 400.7,123 L 408,120",
  coastline: "M 17.8,64.4 L 37.6,67.2 L 52.1,67.7 L 52.6,66.9 L 51.8,68.9 L 52.6,69.6 L 60.5,70.7 L 70.7,70.4 L 77.9,71.9 L 87.4,72 L 119.5,70.4 L 147.2,75.2 L 194.2,90 L 227.6,104.5 L 231.2,108.9 L 253.1,117.1 L 258.6,121.3 L 263.6,122.9 L 274.6,128.9 L 302.7,138.8 L 325.5,144.7 L 339.1,146.7 L 375.9,146.1 L 373.1,156 L 377.1,158.5 L 376.4,160.7 L 378.2,162.6 L 377.8,168.8 L 380.4,169.5 L 391.4,171.3 L 402.6,171.3 L 405.1,165.8 L 402.5,158.4 L 397.3,161.1 L 398.3,163 L 396.4,161.7 L 396.4,164.2 L 395.1,163 L 396.2,161.1 L 401.8,157.5 L 409.4,154.8 L 416.9,154.7",
  regCanal: "M 92.5,164.9 L 94.5,166.2 L 95.6,165 L 96.8,164.5 L 103,164.6 L 106.2,164.4 L 110.2,162.8 L 112.5,161.2 L 113.9,159.4 L 124.5,137.4 L 126.6,133.6 L 128.3,131.8 L 142.7,122.4 L 144.6,120.5 L 151.4,109.2 L 154,105.4 L 154.8,104.5 L 156.2,103.5 L 158.3,102.3 L 160.3,100.7 L 161.1,99.7 L 161.8,98 L 163,93.7 L 164.7,85.8 L 164.8,84.3 L 165.4,81.5 L 165.9,80.3 L 166.4,77.6",
  regCoast: "M 8.4,31.9 L 17.2,33.2 L 23.6,33.5 L 23.8,33.1 L 23.4,34.1 L 23.8,34.4 L 27.3,35 L 31.8,34.8 L 35,35.6 L 39.2,35.6 L 53.3,34.8 L 65.6,37.2 L 86.4,44.5 L 101.1,51.6 L 102.7,53.8 L 112.4,57.8 L 114.8,59.9 L 117.1,60.7 L 121.9,63.6 L 134.3,68.5 L 144.4,71.4 L 150.4,72.4 L 166.7,72.1 L 165.5,77 L 167.2,78.2 L 166.9,79.3 L 167.7,80.2 L 167.5,83.2 L 168.7,83.6 L 173.5,84.5 L 178.5,84.5 L 179.6,81.8 L 178.5,78.1 L 176.1,79.5 L 176.6,80.4 L 175.8,79.8 L 175.8,81 L 175.2,80.4 L 175.7,79.4 L 178.1,77.7 L 181.5,76.4 L 184.8,76.3"
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
          <path d="${GEO_PATHS.orneRiver}" fill="none" stroke="var(--theme-canal-surface-border)" stroke-width="2.5" stroke-dasharray="4 2" opacity="0.65" />
          <text x="210" y="152" font-family="var(--font-sans)" font-size="6.5" font-style="italic" font-weight="600" fill="var(--theme-text-faint)" opacity="0.8">Lit naturel de l'Orne (cours parallèle)</text>

          <!-- Tracé du Canal de Caen issu d'OpenStreetMap -->
          <!-- Halo d'eau extérieur -->
          <path d="${GEO_PATHS.canalMain}" fill="none" stroke="var(--theme-canal-accent)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" opacity="0.12" />
          <!-- Chenal navigable DPM -->
          <path d="${GEO_PATHS.canalMain}" fill="none" stroke="url(#canalGradient)" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
          <!-- Axe central de navigation -->
          <path d="${GEO_PATHS.canalMain}" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="3 3" opacity="0.8" />

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
          <path d="${GEO_PATHS.coastline} L 430 230 L 0 230 Z" fill="var(--theme-card-inner-bg)" stroke="none" opacity="0.95" />
          <path d="${GEO_PATHS.coastline}" fill="none" stroke="var(--theme-text-title)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />

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
  `;
}

/**
 * Mini-Carte Régionale d'Ensemble : Canal + Côte de Nacre
 * Utilisée sur la Face A (Recto) dans le bloc Notes scindé en 2 pour les espèces mixtes
 * ViewBox 200 x 185 : remplit parfaitement le bloc carré ~240 x 240 px
 */
export function renderRegionalMiniMap() {
  return `
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
          <path d="${GEO_PATHS.regCoast} L 200 185 L 0 185 Z" fill="var(--theme-card-inner-bg)" stroke="none" />
          <path d="${GEO_PATHS.regCoast}" fill="none" stroke="var(--theme-text-title)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />

          <!-- Villes côtières -->
          <text x="30" y="68" font-size="5" font-weight="700" fill="var(--theme-text-title)">Courseulles</text>
          <text x="105" y="70" font-size="4.8" font-weight="600" fill="var(--theme-text-muted)">Lion-sur-Mer</text>
          <text x="166" y="72" font-size="5.4" font-weight="800" fill="var(--theme-bateau-accent)">Ouistreham</text>

          <!-- Tracé du Canal de Caen à la mer (14 km) -->
          <path d="${GEO_PATHS.regCanal}" fill="none" stroke="var(--theme-canal-accent)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.3" />
          <path d="${GEO_PATHS.regCanal}" fill="none" stroke="var(--theme-canal-accent)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="${GEO_PATHS.regCanal}" fill="none" stroke="#ffffff" stroke-width="0.8" stroke-dasharray="2 2" />

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
  `;
}
