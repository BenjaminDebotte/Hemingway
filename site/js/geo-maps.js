// ==========================================================================
// CARTOGRAPHIE HALIEUTIQUE OFFICIELLE OPENSTREETMAP (OSM)
// ==========================================================================
// Cartes réelles authentiques issues du cadastre cartographique OpenStreetMap
// Intégration haute-densité et haute-résolution pour consultation écran et impression A4

import { uiIcon } from './icons.js';

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
        <span class="map-badge-osm">Cartographie OpenStreetMap</span>
      </div>
      <div class="map-img-wrap">
        <img
          src="images/maps/canal-caen.png"
          alt="Carte OpenStreetMap du Canal de Caen de Caen à Ouistreham avec postes halieutiques"
          class="halieutic-osm-img"
        />
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
    <div class="biotope-map-card map-card-mer" aria-label="Carte maritime OpenStreetMap de la Côte de Nacre">
      <div class="map-card-header">
        <div class="map-header-title">
          ${uiIcon('boat')} <span>Fonds Marins & Amers : Côte de Nacre (Courseulles ➔ Ouistreham)</span>
        </div>
        <span class="map-badge-osm">Cartographie OpenStreetMap</span>
      </div>
      <div class="map-img-wrap">
        <img
          src="images/maps/cote-de-nacre.png"
          alt="Carte OpenStreetMap de la Côte de Nacre et du Plateau des Roches du Calvados"
          class="halieutic-osm-img"
        />
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
    <div class="regional-mini-map" aria-label="Carte OpenStreetMap de situation Canal de Caen et Côte de Nacre">
      <div class="mini-map-title-row">
        <span class="mini-map-title">Littoral Calvados • Caen ➔ Mer</span>
        <span class="mini-map-tag">OSM</span>
      </div>
      <div class="mini-map-img-wrap">
        <img
          src="images/maps/calvados-overview.png"
          alt="Carte OpenStreetMap de situation reliant Caen à la Côte de Nacre"
          class="mini-map-osm-img"
        />
      </div>
      <div class="mini-map-legend-bar" aria-label="Légende vue d'ensemble">
        <span>${uiIcon('permit')} AAPPMA</span>
        <span>${uiIcon('dpm')} DPM</span>
        <span>${uiIcon('reef')} Roches</span>
        <span>${uiIcon('wreck')} Épaves</span>
      </div>
    </div>
  `;
}
