// ==========================================================================
// TEMPLATE FACE B (VERSO) : TACTIQUES, POSTES & MATÉRIEL
// ==========================================================================

import { uiIcon } from './icons.js';
import {
  renderCanalTriggers,
  renderTideAndWeather,
  renderTwelfthsGauge,
  renderExhaustiveTackleBlock
} from './parsers.js';
import {
  renderCanalDedicatedMap,
  renderCoteDeNacreDedicatedMap
} from './geo-maps.js';
import { getSpotsForFish } from './spots-data.js';

export function getTacticIconName(tacticText = '') {
  const text = tacticText.toLowerCase();

  if (/éclus|courant|piston|vidange|chasse|appel/i.test(text)) return 'zap';
  if (/nuit|obscur|lumièr|lampadaire|cône|ombre|crépuscule/i.test(text)) return 'moon';
  if (/épave|epave|dday|d-day|tôle|carcasse/i.test(text)) return 'wreck';
  if (/roche|plateau|roches|caillou/i.test(text)) return 'reef';
  if (/banc|sable|riden|dune/i.test(text)) return 'sandbank';
  if (/ancre|mouillage|enrochement|palplanche|quai|piler|pont/i.test(text)) return 'anchor';
  if (/bateau|dérive|moteur|sondeur|ancrage|coque/i.test(text)) return 'boat';
  if (/marée|marnage|étale|coef|jusant|flot/i.test(text)) return 'wave';
  if (/heure|horaire|moment|temps|saison/i.test(text)) return 'clock';
  if (/canne|animation|moulinet|scion|tirée|traction|vitesse|mouliner/i.test(text)) return 'rod';
  if (/leurre|jig|souple|hameçon|suiveur|appât|ver|grappin|montage|bas de ligne/i.test(text)) return 'hook';
  if (/discrétion|finesse|fluorocarbone|transparence|furtif/i.test(text)) return 'sparkle';

  return 'compass';
}

/**
 * Encart dédié « Repères & Waypoints GPS » sur Face B
 * Présentation haute-précision au format marin WGS84 (DD° MM.MMM') avec copie décimale
 */
export function renderWaypointsBlock(fish, zone = null) {
  const isDual = fish.canal.present && fish.bateau.present;
  const maxSpots = isDual ? 2 : 3;
  const spots = getSpotsForFish(fish, maxSpots, zone);
  if (!spots.length) return '';

  const zoneLabel = zone === 'canal' ? 'Canal de Caen' : (zone === 'bateau' ? 'Côte de Nacre' : 'Normandie');
  const zoneIcon = zone === 'canal' ? 'anchor' : (zone === 'bateau' ? 'boat' : 'compass');

  return `
    <div class="waypoints-block waypoints-manifest-table waypoints-${zone || 'mixed'}" aria-label="Waypoints GPS de référence pour ${fish.identity.name}">
      <div class="waypoints-header-row">
        <div class="waypoints-title">
          ${uiIcon(zoneIcon)} <span>Repères & Waypoints GPS • ${zoneLabel}</span>
        </div>
        <span class="waypoints-badge-wgs84">WGS84 Marin • Clic pour copier</span>
      </div>
      <div class="waypoints-cards-list waypoints-manifest-rows">
        ${spots.map(spot => `
          <div class="waypoint-card waypoint-manifest-row" data-spot-id="${spot.id}">
            <span class="waypoint-icon-badge">${uiIcon(spot.icon)}</span>
            <div class="waypoint-details">
              <div class="waypoint-name-row">
                <strong class="waypoint-name">${spot.name}</strong>
                <span class="waypoint-depth-pill">${spot.depth}</span>
              </div>
              <div class="waypoint-coords-wrap">
                <span class="waypoint-coord-item coord-nautical" title="Format marin sondeur traceur WGS84">
                  <span class="coord-prefix">Marin :</span>
                  <strong class="coord-val val-nautical">${spot.nautical}</strong>
                </span>
                <span class="waypoint-coord-item coord-decimal" title="Format décimal Google Maps / smartphone">
                  <span class="coord-prefix">Décimal :</span>
                  <span class="coord-val val-decimal">${spot.decimal}</span>
                </span>
              </div>
            </div>
            <div class="waypoint-actions">
              <button
                type="button"
                class="btn-copy-coords"
                data-nautical="${spot.nautical}"
                data-decimal="${spot.decimal}"
                data-name="${spot.shortName}"
                title="Copier les coordonnées GPS dans le presse-papier"
                aria-label="Copier les coordonnées de ${spot.name}"
              >
                ${uiIcon('copy')}
                <span class="btn-copy-label">Copier</span>
              </button>
              <a
                href="${spot.mapsUrl}"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-nav-coords"
                title="Ouvrir ${spot.name} sur Google Maps"
                aria-label="Ouvrir ${spot.name} sur Maps"
              >
                ${uiIcon('compass')}
                <span class="btn-nav-label">Maps ↗</span>
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderFlipSwitcher(fish, isDual, defaultTab) {
  if (isDual) {
    return `
      <div class="biotope-card-switcher" role="tablist" aria-label="Choisir le milieu">
        <button type="button" class="biotope-switch-btn ${defaultTab === 'canal' ? 'active' : ''}" data-tab="canal" role="tab" aria-selected="${defaultTab === 'canal'}" onclick="switchCardBiotope(event, '${fish.id}', 'canal')">
          ${uiIcon('anchor')} Canal de Caen
        </button>
        <button type="button" class="biotope-switch-btn ${defaultTab === 'bateau' ? 'active' : ''}" data-tab="bateau" role="tab" aria-selected="${defaultTab === 'bateau'}" onclick="switchCardBiotope(event, '${fish.id}', 'bateau')">
          ${uiIcon('boat')} Côte de Nacre
        </button>
      </div>
    `;
  }
  const icon = fish.canal.present ? 'anchor' : 'boat';
  return `
    <div class="biotope-card-switcher mono-card-switcher" role="tablist" aria-label="Choisir la vue tactique ou cartographique">
      <button type="button" class="biotope-switch-btn active" data-tab="tactique" role="tab" aria-selected="true" onclick="switchMonoCardTab(event, '${fish.id}', 'tactique')">
        ${uiIcon(icon)} Tactique & Postes
      </button>
      <button type="button" class="biotope-switch-btn" data-tab="carte" role="tab" aria-selected="false" onclick="switchMonoCardTab(event, '${fish.id}', 'carte')">
        ${uiIcon('compass')} Carte Interactive OSM
      </button>
    </div>
  `;
}

export function renderCardBack(fish, isFlipCard = false, currentFilterBiotope = 'all') {
  const isDual = fish.canal.present && fish.bateau.present;
  const isBateauBiotope = typeof currentFilterBiotope === 'string' && currentFilterBiotope.includes('bateau');
  const defaultTab = isBateauBiotope && !fish.canal.present ? 'bateau' : (isBateauBiotope ? 'bateau' : 'canal');
  const canalHidden = isFlipCard && isDual && defaultTab !== 'canal' ? 'tab-hidden' : '';
  const bateauHidden = isFlipCard && isDual && defaultTab !== 'bateau' ? 'tab-hidden' : '';

  return `
    <div class="verso-header">
      <div>
        <span class="verso-eyebrow">Tactique Terrain Normandie</span>
        <h3 class="verso-title">${fish.identity.name}</h3>
      </div>
      <span class="verso-badge">Guide Pratique</span>
    </div>

    ${isFlipCard ? renderFlipSwitcher(fish, isDual, defaultTab) : ''}

    ${fish.canal.present ? `
      <div class="biotope-section section-canal ${canalHidden}">
        <div class="section-header-row">
          <div class="block-title section-canal-title">${uiIcon('anchor')} Canal de Caen</div>
          <span class="presence-badge">${fish.canal.presenceSeason}</span>
        </div>
        <div class="spots-chip-grid spots-manifest-matrix">
          <div class="spot-chip spot-manifest-cell"><span class="spot-tag spot-manifest-tag">[ ENROCHEMENTS ]</span> ${fish.canal.keySpots.enrochements}</div>
          <div class="spot-chip spot-manifest-cell"><span class="spot-tag spot-manifest-tag">[ PALPLANCHES ]</span> ${fish.canal.keySpots.palplanches}</div>
          <div class="spot-chip spot-manifest-cell"><span class="spot-tag spot-manifest-tag">[ PILES DE PONTS ]</span> ${fish.canal.keySpots.pilesDePont}</div>
        </div>
        ${renderWaypointsBlock(fish, 'canal')}
        ${renderCanalTriggers(fish.canal.triggers.ecluseesOuistreham, fish.canal.triggers.luminositeEtNuit)}
        <ul class="tactics-bullets tactics-manifest-list">
          ${fish.canal.tactics.map(t => `<li class="tactic-manifest-row"><span class="tactic-icon-badge">${uiIcon(getTacticIconName(t))}</span><span class="tactic-text">${t}</span></li>`).join('')}
        </ul>
        ${renderExhaustiveTackleBlock(fish.canal.terminalTackle, fish.gear.canalCombo, 'Canal', 'canal')}
      </div>
      ${!isDual ? `<div class="mono-map-wrap ${isFlipCard ? 'tab-hidden' : ''}">${renderCanalDedicatedMap(fish)}</div>` : ''}
    ` : ''}

    ${fish.bateau.present ? `
      <div class="biotope-section section-bateau ${bateauHidden}">
        <div class="section-header-row">
          <div class="block-title section-bateau-title">${uiIcon('boat')} Côte de Nacre</div>
          <span class="presence-badge">${fish.bateau.presenceSeason}</span>
        </div>
        <div class="spots-chip-grid spots-manifest-matrix">
          <div class="spot-chip spot-manifest-cell"><span class="spot-tag spot-manifest-tag">[ ROCHES CALVADOS ]</span> ${fish.bateau.habitats.rochesDuCalvados}</div>
          <div class="spot-chip spot-manifest-cell"><span class="spot-tag spot-manifest-tag">[ ÉPAVES 1944 ]</span> ${fish.bateau.habitats.epavesDDay}</div>
          <div class="spot-chip spot-manifest-cell"><span class="spot-tag spot-manifest-tag">[ BANCS & RIDENS ]</span> ${fish.bateau.habitats.bancsDeSableEtRidens}</div>
        </div>
        ${renderWaypointsBlock(fish, 'bateau')}
        ${renderTideAndWeather(fish.bateau.tideAndCurrent.bestCoefficients, fish.bateau.weatherImpact.favorableWinds)}
        ${renderTwelfthsGauge(fish.bateau.tideAndCurrent.ruleOfTwelfths)}
        <ul class="tactics-bullets tactics-manifest-list">
          ${fish.bateau.tactics.map(t => `<li class="tactic-manifest-row"><span class="tactic-icon-badge">${uiIcon(getTacticIconName(t))}</span><span class="tactic-text">${t}</span></li>`).join('')}
        </ul>
        ${renderExhaustiveTackleBlock(fish.bateau.terminalTackle, fish.gear.boatCombo, 'Mer', 'bateau')}
      </div>
      ${!isDual ? `<div class="mono-map-wrap ${isFlipCard ? 'tab-hidden' : ''}">${renderCoteDeNacreDedicatedMap(fish)}</div>` : ''}
    ` : ''}
  `;
}
