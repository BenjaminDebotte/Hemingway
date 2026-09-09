// ==========================================================================
// TEMPLATE FACE A (RECTO) : IDENTITÉ, BIOLOGIE & RÈGLES
// ==========================================================================

import { uiIcon } from './icons.js';
import { renderHarvestPill, renderMorphologyGauge, getPermitInfo } from './parsers.js';
import { renderRegionalMiniMap } from './geo-maps.js';

export const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export function renderCardFront(fish) {
  const isDual = fish.canal.present && fish.bateau.present;
  const legalSize = fish.regulations.legalSizeCm
    ? `${fish.regulations.legalSizeCm} cm`
    : 'Non fixée';

  const recSize = fish.regulations.recommendedSizeCm
    ? `${fish.regulations.recommendedSizeCm} cm`
    : 'N/A';

  const permitInfo = getPermitInfo(fish);

  return `
    <div class="card-header">
      <div class="header-badges">
        <span class="badge-cat">${fish.identity.category}</span>
        ${fish.canal.present ? `<span class="badge-biotope badge-canal">${uiIcon('anchor')} Canal de Caen</span>` : ''}
        ${fish.bateau.present ? `<span class="badge-biotope badge-mer">${uiIcon('boat')} Côte de Nacre</span>` : ''}
        ${permitInfo.requiresCPMA ? `<span class="badge-biotope badge-permit" title="Timbre CPMA migrateurs obligatoire en secteur fluvial d'eau douce">${uiIcon('scale')} CPMA (Fluvial)</span>` : ''}
        ${permitInfo.requiresAAPPMAInBassin ? `<span class="badge-biotope badge-permit-bassin" title="Pêche libre sans permis sur tout le canal DPM (Caen à Ouistreham) • Carte AAPPMA requise uniquement au Bassin St-Pierre">${uiIcon('scale')} AAPPMA si Bassin St-Pierre</span>` : ''}
      </div>
      <h2 class="species-title">${fish.identity.name}</h2>
      <div class="species-meta">
        <span class="species-scientific">${fish.identity.scientificName}</span>
        <span>•</span>
        <span>${fish.identity.family}</span>
        ${fish.identity.localNames && fish.identity.localNames.length > 0 ? `
          <span class="meta-pipe">|</span>
          <span class="species-local-names">${fish.identity.localNames.join(', ')}</span>
        ` : ''}
      </div>
    </div>

    <div class="recognition-box">
      <div class="recognition-title">${uiIcon('search')} Repères d'identification clés</div>
      <div class="recognition-text">${fish.identity.identificationNotes}</div>
    </div>

    <div class="regs-block">
      <div class="block-title">${uiIcon('scale')} Réglementation & Mailles (${fish.regulations.zone})</div>
      <div class="regs-grid">
        <div class="reg-pill">
          <span class="reg-pill-label">Maille légale</span>
          <span class="reg-pill-val ${fish.regulations.legalSizeCm ? 'val-green' : ''}">${legalSize}</span>
        </div>
        <div class="reg-pill">
          <span class="reg-pill-label">Taille éthique</span>
          <span class="reg-pill-val">${recSize}</span>
        </div>
        ${renderHarvestPill(fish.regulations.bagLimit, fish.id)}
      </div>
      <ul class="regs-rules-list">
        <li><strong>Fermeture :</strong> ${fish.regulations.closedSeason}</li>
        ${fish.regulations.specialRules.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>

    <div class="biology-section">
      ${renderMorphologyGauge(fish.biology)}
      <div class="bio-card bio-diet-card">
        <div class="bio-title">Proies cibles & Régime</div>
        <div class="diet-tags">
          ${fish.biology.diet.map(d => `<span class="diet-tag">${d}</span>`).join('')}
        </div>
      </div>
    </div>

    <div class="secret-local-box">
      <div class="secret-title">${uiIcon('sparkle')} Le Secret du Pêcheur Normand</div>
      <div class="secret-text">${fish.localSecret}</div>
    </div>

    <div class="calendar-block">
      <div class="block-title">${uiIcon('calendar')} Calendrier d'Activité Annuel</div>
      ${fish.canal.present ? `
        <div class="cal-row">
          <span class="cal-label">${uiIcon('anchor')} Canal</span>
          <div class="cal-months">
            ${fish.calendar.canal.map((score, m) => `
              <div class="month-cell heat-${score}" title="${MONTHS[m]} : score ${score}/3">${MONTHS[m]}</div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      ${fish.bateau.present ? `
        <div class="cal-row">
          <span class="cal-label">${uiIcon('boat')} Bateau</span>
          <div class="cal-months">
            ${fish.calendar.bateau.map((score, m) => `
              <div class="month-cell heat-${score}" title="${MONTHS[m]} : score ${score}/3">${MONTHS[m]}</div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>

    ${isDual ? `
      <div class="notes-box notes-box-split">
        <div class="notes-split-col notes-col-map">
          ${renderRegionalMiniMap()}
        </div>
        <div class="notes-split-col notes-col-lines">
          <div class="notes-header">
            <span class="notes-title">${uiIcon('pen')} Notes :</span>
            <span class="notes-hint">Date • Coef • Prises</span>
          </div>
          <div class="notes-lines" aria-label="Lignes pour notes manuscrites">
            <div class="notes-line"></div>
            <div class="notes-line"></div>
            <div class="notes-line"></div>
          </div>
        </div>
      </div>
    ` : `
      <div class="notes-box">
        <div class="notes-header">
          <span class="notes-title">${uiIcon('pen')} Notes :</span>
          <span class="notes-hint">Date • Coef • Poste • Prises / Montages</span>
        </div>
        <div class="notes-lines" aria-label="Lignes pour notes manuscrites">
          <div class="notes-line"></div>
          <div class="notes-line"></div>
          <div class="notes-line"></div>
        </div>
      </div>
    `}
  `;
}
