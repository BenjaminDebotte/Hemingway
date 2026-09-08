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

export function renderCardBack(fish, isFlipCard = false, currentFilterBiotope = 'all') {
  const isDual = fish.canal.present && fish.bateau.present;
  const defaultTab = currentFilterBiotope === 'bateau' ? 'bateau' : 'canal';
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

    ${isFlipCard && isDual ? `
      <div class="biotope-card-switcher" role="tablist" aria-label="Choisir le milieu">
        <button type="button" class="biotope-switch-btn ${defaultTab === 'canal' ? 'active' : ''}" data-tab="canal" onclick="switchCardBiotope(event, '${fish.id}', 'canal')">
          ${uiIcon('anchor')} Canal de Caen
        </button>
        <button type="button" class="biotope-switch-btn ${defaultTab === 'bateau' ? 'active' : ''}" data-tab="bateau" onclick="switchCardBiotope(event, '${fish.id}', 'bateau')">
          ${uiIcon('boat')} Côte de Nacre
        </button>
      </div>
    ` : ''}

    ${fish.canal.present ? `
      <div class="biotope-section section-canal ${canalHidden}">
        <div class="section-header-row">
          <div class="block-title section-canal-title">${uiIcon('anchor')} Canal de Caen</div>
          <span class="presence-badge">${fish.canal.presenceSeason}</span>
        </div>
        <div class="spots-chip-grid">
          <div class="spot-chip"><span class="spot-tag">Enrochements</span> ${fish.canal.keySpots.enrochements}</div>
          <div class="spot-chip"><span class="spot-tag">Palplanches</span> ${fish.canal.keySpots.palplanches}</div>
          <div class="spot-chip"><span class="spot-tag">Piles/Ponts</span> ${fish.canal.keySpots.pilesDePont}</div>
        </div>
        ${renderCanalTriggers(fish.canal.triggers.ecluseesOuistreham, fish.canal.triggers.luminositeEtNuit)}
        <ul class="tactics-bullets">
          ${fish.canal.tactics.map(t => `<li>${t}</li>`).join('')}
        </ul>
        ${renderExhaustiveTackleBlock(fish.canal.terminalTackle, fish.gear.canalCombo, 'Canal', 'canal')}
      </div>
      ${!isDual ? renderCanalDedicatedMap(fish) : ''}
    ` : ''}

    ${fish.bateau.present ? `
      <div class="biotope-section section-bateau ${bateauHidden}">
        <div class="section-header-row">
          <div class="block-title section-bateau-title">${uiIcon('boat')} Côte de Nacre</div>
          <span class="presence-badge">${fish.bateau.presenceSeason}</span>
        </div>
        <div class="spots-chip-grid">
          <div class="spot-chip"><span class="spot-tag">Roches Calvados</span> ${fish.bateau.habitats.rochesDuCalvados}</div>
          <div class="spot-chip"><span class="spot-tag">Épaves 1944</span> ${fish.bateau.habitats.epavesDDay}</div>
          <div class="spot-chip"><span class="spot-tag">Bancs/Ridens</span> ${fish.bateau.habitats.bancsDeSableEtRidens}</div>
        </div>
        ${renderTideAndWeather(fish.bateau.tideAndCurrent.bestCoefficients, fish.bateau.weatherImpact.favorableWinds)}
        ${renderTwelfthsGauge(fish.bateau.tideAndCurrent.ruleOfTwelfths)}
        <ul class="tactics-bullets">
          ${fish.bateau.tactics.map(t => `<li>${t}</li>`).join('')}
        </ul>
        ${renderExhaustiveTackleBlock(fish.bateau.terminalTackle, fish.gear.boatCombo, 'Mer', 'bateau')}
      </div>
      ${!isDual ? renderCoteDeNacreDedicatedMap(fish) : ''}
    ` : ''}
  `;
}
