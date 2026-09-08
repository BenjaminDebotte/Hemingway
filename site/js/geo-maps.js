// ==========================================================================
// CARTOGRAPHIE HALIEUTIQUE OFFICIELLE OPENSTREETMAP (OSM)
// ==========================================================================
// Cartes réelles authentiques issues du cadastre cartographique OpenStreetMap
// Repères interactifs vectoriels WGS84 avec infobulles de coordonnées complètes

import { uiIcon } from './icons.js';
import { getSpotsForMap } from './spots-data.js';

/**
 * Génère la couche de repères interactifs avec coordonnées WGS84 au survol
 */
function renderPinsLayer(mapType) {
  const spots = getSpotsForMap(mapType);
  if (!spots || !spots.length) return '';

  return `
    <div class="map-pins-layer" aria-label="Repères GPS interactifs">
      ${spots.map(spot => {
        const top = spot.mapPos.top;
        const left = spot.mapPos.left;
        const isTop = top < 35;
        const isRight = left > 65;
        const isLeft = left < 35;
        const alignClasses = [
          isTop ? 'align-down' : 'align-up',
          isRight ? 'align-left' : (isLeft ? 'align-right' : 'align-center')
        ].join(' ');

        return `
          <div
            class="map-interactive-pin ${alignClasses} pin-zone-${spot.zone}"
            style="left: ${left}%; top: ${top}%;"
            data-spot-id="${spot.id}"
            tabindex="0"
            role="button"
            aria-label="${spot.name} - ${spot.nautical}"
          >
            <div class="pin-beacon">
              <span class="pin-dot"></span>
              <span class="pin-pulse"></span>
            </div>
            <div class="map-pin-tooltip" role="tooltip">
              <div class="tooltip-header">
                <span class="tooltip-title">${uiIcon(spot.icon)} ${spot.shortName}</span>
                <span class="tooltip-depth">${spot.depth}</span>
              </div>
              <p class="tooltip-tip">${spot.tip}</p>
              <div class="tooltip-coords-box">
                <div class="tooltip-coord-row">
                  <span class="coord-tag">Marin :</span>
                  <strong class="coord-val val-nautical">${spot.nautical}</strong>
                </div>
                <div class="tooltip-coord-row">
                  <span class="coord-tag">Décimal :</span>
                  <span class="coord-val val-decimal">${spot.decimal}</span>
                </div>
              </div>
              <div class="tooltip-actions">
                <button
                  type="button"
                  class="tooltip-btn-copy"
                  data-nautical="${spot.nautical}"
                  data-decimal="${spot.decimal}"
                  data-name="${spot.shortName}"
                  title="Copier les coordonnées dans le presse-papier"
                >
                  ${uiIcon('copy')} <span>Copier GPS</span>
                </button>
                <a
                  href="${spot.mapsUrl}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="tooltip-btn-nav"
                  title="Ouvrir dans Google Maps"
                >
                  ${uiIcon('compass')} <span>Maps ↗</span>
                </a>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Carte Dédiée : Canal de Caen à la mer (14 km)
 * Utilisée au verso (Face B) pour les espèces mono-biotope eau douce / saumâtre
 */
export function renderCanalDedicatedMap(fish) {
  return `
    <div class="biotope-map-card map-card-canal" aria-label="Carte halieutique OpenStreetMap du Canal de Caen">
      <div class="map-card-header">
        <div class="map-header-title">
          ${uiIcon('anchor')} <span>Topographie & Postes Clés : Canal de Caen à la mer (14 km)</span>
        </div>
        <a
          href="https://www.openstreetmap.org/#map=13/49.2330/-0.3015"
          target="_blank"
          rel="noopener noreferrer"
          class="map-badge-osm"
          title="Ouvrir le Canal de Caen sur OpenStreetMap"
        >OSM ↗</a>
      </div>
      <div class="map-img-wrap interactive-map-container" data-map="canal">
        <img
          src="images/maps/canal-caen.png"
          alt="Carte OpenStreetMap du Canal de Caen de Caen à Ouistreham avec postes halieutiques"
          class="halieutic-osm-img"
        />
        ${renderPinsLayer('canal')}
      </div>
      <div class="map-legend-bar" aria-label="Légende cartographique du Canal">
        <span class="legend-title">Légende :</span>
        <span class="legend-item">${uiIcon('permit')} AAPPMA</span>
        <span class="legend-item">${uiIcon('dpm')} DPM libre</span>
        <span class="legend-item">${uiIcon('bridge')} Pont</span>
        <span class="legend-item">${uiIcon('quay')} Palplanches</span>
        <span class="legend-item">${uiIcon('slipway')} Cale slipway</span>
        <span class="legend-item">${uiIcon('locks')} Écluses</span>
      </div>
      <div class="map-habitats-grid">
        <div class="map-habitat-chip">
          <span class="map-habitat-tag">${uiIcon('reef')} Enrochements</span>
          <span class="map-habitat-val">${fish.canal.keySpots.enrochements}</span>
        </div>
        <div class="map-habitat-chip">
          <span class="map-habitat-tag">${uiIcon('quay')} Palplanches</span>
          <span class="map-habitat-val">${fish.canal.keySpots.palplanches}</span>
        </div>
        <div class="map-habitat-chip">
          <span class="map-habitat-tag">${uiIcon('bridge')} Piles / Ponts</span>
          <span class="map-habitat-val">${fish.canal.keySpots.pilesDePont}</span>
        </div>
      </div>
      <div class="map-card-footer">
        <span class="map-footer-tip"><strong>Déclencheur hydro :</strong> Les chasses remontent le canal au rythme de l'onde de marée montante d'Ouistreham. Survoler un repère pour relever ses coordonnées GPS exactes.</span>
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
    <div class="biotope-map-card map-card-mer" aria-label="Carte maritime OpenStreetMap de la Côte de Nacre">
      <div class="map-card-header">
        <div class="map-header-title">
          ${uiIcon('boat')} <span>Fonds Marins & Amers : Côte de Nacre (Courseulles ➔ Ouistreham)</span>
        </div>
        <a
          href="https://www.openstreetmap.org/#map=12/49.3175/-0.3450"
          target="_blank"
          rel="noopener noreferrer"
          class="map-badge-osm"
          title="Ouvrir la Côte de Nacre sur OpenStreetMap"
        >OSM ↗</a>
      </div>
      <div class="map-img-wrap interactive-map-container" data-map="mer">
        <img
          src="images/maps/cote-de-nacre.png"
          alt="Carte OpenStreetMap de la Côte de Nacre et du Plateau des Roches du Calvados"
          class="halieutic-osm-img"
        />
        ${renderPinsLayer('mer')}
      </div>
      <div class="map-legend-bar" aria-label="Légende cartographique de la Côte de Nacre">
        <span class="legend-title">Légende :</span>
        <span class="legend-item">${uiIcon('reef')} Roches (6-15m)</span>
        <span class="legend-item">${uiIcon('sandbank')} Bancs / Ridens</span>
        <span class="legend-item">${uiIcon('wreck')} Épave 1944</span>
        <span class="legend-item">${uiIcon('pier')} Jetée pêche</span>
        <span class="legend-item">${uiIcon('slipway')} Cale slipway</span>
      </div>
      <div class="map-habitats-grid">
        <div class="map-habitat-chip">
          <span class="map-habitat-tag">${uiIcon('reef')} Roches Calvados</span>
          <span class="map-habitat-val">${fish.bateau.habitats.rochesDuCalvados}</span>
        </div>
        <div class="map-habitat-chip">
          <span class="map-habitat-tag">${uiIcon('wreck')} Épaves 1944</span>
          <span class="map-habitat-val">${fish.bateau.habitats.epavesDDay}</span>
        </div>
        <div class="map-habitat-chip">
          <span class="map-habitat-tag">${uiIcon('sandbank')} Bancs / Ridens</span>
          <span class="map-habitat-val">${fish.bateau.habitats.bancsDeSableEtRidens}</span>
        </div>
      </div>
      <div class="map-card-footer">
        <span class="map-footer-tip"><strong>Zone des épaves :</strong> Les tombants des Roches et carcasses 1944 créent des caches à congre et lieus record. Survoler un repère pour relever ses coordonnées GPS exactes.</span>
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
    <div class="regional-mini-map" aria-label="Carte OpenStreetMap de situation Canal de Caen et Côte de Nacre">
      <div class="mini-map-title-row">
        <span class="mini-map-title">Littoral Calvados • Caen ➔ Mer</span>
        <a
          href="https://www.openstreetmap.org/#map=11/49.2670/-0.3400"
          target="_blank"
          rel="noopener noreferrer"
          class="mini-map-tag"
          title="Ouvrir le secteur Caen - Côte de Nacre sur OpenStreetMap"
        >OSM ↗</a>
      </div>
      <div class="mini-map-img-wrap interactive-map-container" data-map="reg">
        <img
          src="images/maps/calvados-overview.png"
          alt="Carte OpenStreetMap de situation reliant Caen à la Côte de Nacre"
          class="mini-map-osm-img"
        />
        ${renderPinsLayer('reg')}
      </div>
      <div class="mini-map-legend-bar" aria-label="Légende vue d'ensemble">
        <span>${uiIcon('permit')} AAPPMA</span>
        <span>${uiIcon('bridge')} Ponts</span>
        <span>${uiIcon('locks')} Écluses</span>
        <span>${uiIcon('reef')} Roches</span>
      </div>
    </div>
  `;
}
