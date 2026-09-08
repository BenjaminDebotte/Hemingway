// ==========================================================================
// VUES D'AFFICHAGE (DÉPLIÉE CÔTE-À-CÔTE, CARTE 3D, PLANCHES A4 DUPLEX)
// ==========================================================================

import { uiIcon } from './icons.js';
import { renderCardFront } from './render-front.js';
import { renderCardBack } from './render-back.js';

export const VIEW_HINTS = {
  duo: 'Mode Déplié : Face A (Identité) et Face B (Tactique) affichées côte-à-côte en pleine largeur',
  flip: "Mode Réversible : Cliquez sur l'icône de rotation pour basculer en 3D",
  print: "Mode Impression : Aperçu des planches A4 paysage duplex prêtes pour l'imprimante"
};

export function renderEmptyState() {
  return `
    <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--slate-500);">
      <h3>Aucun poisson ne correspond à ces critères</h3>
      <p>Essayez de réinitialiser la recherche ou les filtres.</p>
    </div>
  `;
}

// --------------------------------------------------------------------------
// VUE 1 : DÉPLIÉE CÔTE-À-CÔTE (CONFORT ÉCRAN MAXIMAL)
// --------------------------------------------------------------------------

export function renderDuoView(speciesList, currentFilterBiotope = 'all') {
  const container = document.getElementById('cards-grid');
  if (!container) return;

  if (speciesList.length === 0) {
    container.innerHTML = renderEmptyState();
    return;
  }

  container.className = 'duo-cards-container';
  container.innerHTML = speciesList.map((fish, index) => `
    <article class="duo-card-shell" id="duo-${fish.id}" style="transition-delay: ${Math.min(index * 35, 240)}ms;">
      <div class="duo-card">
        <div class="duo-card-column col-recto">
          ${renderCardFront(fish)}
        </div>
        <div class="duo-card-column col-verso">
          ${renderCardBack(fish, false, currentFilterBiotope)}
        </div>
      </div>
    </article>
  `).join('');
}

// --------------------------------------------------------------------------
// VUE 2 : FICHES RÉVERSIBLES (ANIMATION 3D GRAND FORMAT)
// --------------------------------------------------------------------------

export function renderFlipView(speciesList, currentFilterBiotope = 'all') {
  const container = document.getElementById('cards-grid');
  if (!container) return;

  if (speciesList.length === 0) {
    container.innerHTML = renderEmptyState();
    return;
  }

  container.className = 'cards-grid';
  container.innerHTML = speciesList.map((fish, index) => `
    <article class="interactive-card" id="card-${fish.id}" style="transition-delay: ${Math.min(index * 35, 240)}ms;">
      <button type="button" class="card-flip-trigger" onclick="toggleCardFlip('${fish.id}')" title="Tourner la fiche" aria-label="Tourner la fiche technique de ${fish.identity.name}">
        <span class="flip-icon-wrap" aria-hidden="true">${uiIcon('rotate')}</span>
      </button>
      <div class="card-inner">
        <div class="card-face-shell front">
          <div class="card-face">
            ${renderCardFront(fish)}
          </div>
        </div>
        <div class="card-face-shell back">
          <div class="card-face">
            ${renderCardBack(fish, true, currentFilterBiotope)}
          </div>
        </div>
      </div>
    </article>
  `).join('');
}

// --------------------------------------------------------------------------
// VUE 3 : PLANCHES D'IMPRESSION DUPLEX A4 PAYSAGE
// --------------------------------------------------------------------------

export function renderPrintView(speciesList, currentFilterBiotope = 'all') {
  const container = document.getElementById('print-sheets-container');
  if (!container) return;

  if (speciesList.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 3rem;">Aucun poisson à imprimer.</p>';
    return;
  }

  // Regroupement des espèces par paires (2 espèces par planche A4)
  const pairs = [];
  for (let i = 0; i < speciesList.length; i += 2) {
    pairs.push([speciesList[i], speciesList[i + 1] || null]);
  }

  container.innerHTML = pairs.map(([fishA, fishB]) => {
    // Page 1 (Rectos) : [Poisson A - Face A] | [Poisson B - Face A]
    const sheet1 = `
      <div class="a4-sheet-preview print-sheet-recto">
        <div class="card-face">
          ${renderCardFront(fishA)}
        </div>
        <div class="card-face">
          ${fishB ? renderCardFront(fishB) : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;">Emplacement libre</div>'}
        </div>
      </div>
    `;

    // Page 2 (Versos) : [Poisson B - Face B] | [Poisson A - Face B]
    // Inversion horizontale pour correspondre au recto-verso retournement bord court
    const sheet2 = `
      <div class="a4-sheet-preview print-sheet-verso">
        <div class="card-face">
          ${fishB ? renderCardBack(fishB, false, currentFilterBiotope) : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;">Emplacement libre</div>'}
        </div>
        <div class="card-face">
          ${renderCardBack(fishA, false, currentFilterBiotope)}
        </div>
      </div>
    `;

    return sheet1 + sheet2;
  }).join('');
}
