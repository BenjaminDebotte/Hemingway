// ==========================================================================
// APPLICATION LOGIQUE & RENDU DES FICHES TECHNIQUES
// ==========================================================================

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

let currentFilterCategory = 'all';
let currentFilterBiotope = 'all';
let currentSearchTerm = '';
let currentViewMode = 'duo'; // 'duo' (dépliée) | 'flip' (carte 3D) | 'print' (A4)

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  const data = window.SPECIES_DATA || [];
  console.log(`Initialisation de l'application avec ${data.length} espèces.`);

  setupFilterPills(data);
  setupSearch();
  setupToggles();
  renderApp();
}

// --------------------------------------------------------------------------
// FILTRES ET ÉVÉNEMENTS
// --------------------------------------------------------------------------

function setupFilterPills(data) {
  const container = document.getElementById('category-pills');
  if (!container) return;

  const categories = ['all', ...new Set(data.map(d => d.identity.category))];

  container.innerHTML = categories.map(cat => {
    const label = cat === 'all' ? 'Toutes les catégories' : cat;
    const activeClass = cat === currentFilterCategory ? 'active' : '';
    return `<button class="pill ${activeClass}" data-category="${cat}">${label}</button>`;
  }).join('');

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.pill');
    if (!btn) return;
    currentFilterCategory = btn.dataset.category;
    container.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    renderApp();
  });
}

function setupSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    currentSearchTerm = e.target.value.toLowerCase().trim();
    renderApp();
  });
}

function setupToggles() {
  const biotopeSelect = document.getElementById('biotope-select');
  if (biotopeSelect) {
    biotopeSelect.addEventListener('change', (e) => {
      currentFilterBiotope = e.target.value;
      renderApp();
    });
  }

  const modeBtns = document.querySelectorAll('.mode-btn');
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentViewMode = btn.dataset.mode;
      document.body.classList.toggle('print-mode', currentViewMode === 'print');
      renderApp();
    });
  });

  const printBtn = document.getElementById('btn-print');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      // Basculer en mode print avant d'imprimer
      currentViewMode = 'print';
      document.body.classList.add('print-mode');
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === 'print'));
      renderApp();
      setTimeout(() => {
        window.print();
      }, 300);
    });
  }
}

// --------------------------------------------------------------------------
// FILTRAGE DES DONNÉES
// --------------------------------------------------------------------------

function getFilteredSpecies() {
  const data = window.SPECIES_DATA || [];
  return data.filter(fish => {
    // Filtre Catégorie
    if (currentFilterCategory !== 'all' && fish.identity.category !== currentFilterCategory) {
      return false;
    }

    // Filtre Biotope
    if (currentFilterBiotope === 'canal' && !fish.canal.present) {
      return false;
    }
    if (currentFilterBiotope === 'bateau' && !fish.bateau.present) {
      return false;
    }

    // Recherche texte
    if (currentSearchTerm) {
      const searchPool = [
        fish.identity.name,
        fish.identity.scientificName,
        ...(fish.identity.localNames || []),
        fish.identity.family,
        fish.localSecret
      ].join(' ').toLowerCase();

      if (!searchPool.includes(currentSearchTerm)) {
        return false;
      }
    }

    return true;
  });
}

// --------------------------------------------------------------------------
// MOTEUR DE RENDU
// --------------------------------------------------------------------------

function renderApp() {
  const speciesList = getFilteredSpecies();

  const statsEl = document.getElementById('view-stats');
  if (statsEl) {
    const plural = speciesList.length > 1 ? 's' : '';
    statsEl.textContent = `${speciesList.length} espèce${plural} affichée${plural} sur 32`;
  }

  const hintEl = document.getElementById('view-hint');
  if (hintEl) {
    if (currentViewMode === 'duo') {
      hintEl.textContent = 'Mode Déplié : Face A (Identité) et Face B (Tactique) affichées côte-à-côte en pleine largeur';
    } else if (currentViewMode === 'flip') {
      hintEl.textContent = 'Mode Réversible : Cliquez sur "🔄 Tourner la fiche" pour basculer en 3D';
    } else {
      hintEl.textContent = 'Mode Impression : Aperçu des planches A4 paysage duplex prêtes pour l\'imprimante';
    }
  }

  if (currentViewMode === 'duo') {
    renderDuoView(speciesList);
  } else if (currentViewMode === 'flip') {
    renderFlipView(speciesList);
  } else {
    renderPrintView(speciesList);
  }
}

// --------------------------------------------------------------------------
// VUE 1 : DÉPLIÉE CÔTE-À-CÔTE (CONFORT ÉCRAN MAXIMAL)
// --------------------------------------------------------------------------

function renderDuoView(speciesList) {
  const container = document.getElementById('cards-grid');
  if (!container) return;

  if (speciesList.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--slate-500);">
        <h3>Aucun poisson ne correspond à ces critères</h3>
        <p>Essayez de réinitialiser la recherche ou les filtres.</p>
      </div>
    `;
    return;
  }

  container.className = 'duo-cards-container';
  container.innerHTML = speciesList.map(fish => `
    <div class="duo-card" id="duo-${fish.id}">
      <div class="duo-card-column col-recto">
        ${renderCardFront(fish)}
      </div>
      <div class="duo-card-column col-verso">
        ${renderCardBack(fish)}
      </div>
    </div>
  `).join('');
}

// --------------------------------------------------------------------------
// VUE 2 : FICHES RÉVERSIBLES (ANIMATION 3D GRAND FORMAT)
// --------------------------------------------------------------------------

function renderFlipView(speciesList) {
  const container = document.getElementById('cards-grid');
  if (!container) return;

  if (speciesList.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--slate-500);">
        <h3>Aucun poisson ne correspond à ces critères</h3>
        <p>Essayez de réinitialiser la recherche ou les filtres.</p>
      </div>
    `;
    return;
  }

  container.className = 'cards-grid';
  container.innerHTML = speciesList.map(fish => `
    <div class="interactive-card" id="card-${fish.id}">
      <button class="card-flip-trigger" onclick="toggleCardFlip('${fish.id}')">
        <span>🔄 Tourner la fiche</span>
      </button>
      <div class="card-inner">
        <div class="card-face front">
          ${renderCardFront(fish)}
        </div>
        <div class="card-face back">
          ${renderCardBack(fish)}
        </div>
      </div>
    </div>
  `).join('');
}

window.toggleCardFlip = function(id) {
  const el = document.getElementById(`card-${id}`);
  if (el) {
    el.classList.toggle('flipped');
  }
};

function renderPrintView(speciesList) {
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

  container.innerHTML = pairs.map(([fishA, fishB], index) => {
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
          ${fishB ? renderCardBack(fishB) : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;">Emplacement libre</div>'}
        </div>
        <div class="card-face">
          ${renderCardBack(fishA)}
        </div>
      </div>
    `;

    return sheet1 + sheet2;
  }).join('');
}

// --------------------------------------------------------------------------
// TEMPLATE FACE A (RECTO) : IDENTITÉ, BIOLOGIE & RÈGLES
// --------------------------------------------------------------------------

function renderCardFront(fish) {
  const legalSize = fish.regulations.legalSizeCm
    ? `${fish.regulations.legalSizeCm} cm`
    : 'Non fixée';

  const recSize = fish.regulations.recommendedSizeCm
    ? `${fish.regulations.recommendedSizeCm} cm`
    : 'N/A';

  return `
    <div class="card-header">
      <div class="header-badges">
        <span class="badge-cat">${fish.identity.category}</span>
        ${fish.canal.present ? '<span class="badge-biotope badge-canal">⚓ Canal de Caen</span>' : ''}
        ${fish.bateau.present ? '<span class="badge-biotope badge-mer">🚤 Côte de Nacre</span>' : ''}
      </div>
      <h2 class="species-title">${fish.identity.name}</h2>
      <div class="species-meta">
        <span class="species-scientific">${fish.identity.scientificName}</span>
        <span>•</span>
        <span>${fish.identity.family}</span>
      </div>
      ${fish.identity.localNames && fish.identity.localNames.length > 0 ? `
        <div class="species-meta" style="font-size: 0.68rem; margin-top: 0.15rem;">
          <span style="color: var(--slate-500);">Noms locaux :</span>
          <span class="species-local-names">${fish.identity.localNames.join(', ')}</span>
        </div>
      ` : ''}
    </div>

    <div class="recognition-box">
      <div class="recognition-title">🔍 Repères d'identification clés</div>
      <div>${fish.identity.identificationNotes}</div>
    </div>

    <div class="regs-block">
      <div class="block-title">⚖️ Réglementation & Mailles (${fish.regulations.zone})</div>
      <div class="regs-grid">
        <div class="reg-pill">
          <span class="reg-pill-label">Maille légale</span>
          <span class="reg-pill-val ${fish.regulations.legalSizeCm ? 'val-green' : ''}">${legalSize}</span>
        </div>
        <div class="reg-pill">
          <span class="reg-pill-label">Taille éthique</span>
          <span class="reg-pill-val">${recSize}</span>
        </div>
        <div class="reg-pill">
          <span class="reg-pill-label">Quota jour</span>
          <span class="reg-pill-val" style="font-size: 0.75rem;">${fish.regulations.bagLimit.replace(' par jour et par pêcheur', '/jour')}</span>
        </div>
      </div>
      <ul class="regs-rules-list">
        <li><strong>Fermeture :</strong> ${fish.regulations.closedSeason}</li>
        ${fish.regulations.specialRules.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </div>

    <div class="biology-section">
      <div class="bio-card">
        <div class="bio-title">Morphologie</div>
        <div class="bio-metric-row">
          <span>Longueur :</span>
          <span class="bio-metric-val">${fish.biology.averageLengthCm}</span>
        </div>
        <div class="bio-metric-row">
          <span>Maxi :</span>
          <span class="bio-metric-val">${fish.biology.maxLengthCm}</span>
        </div>
        <div class="bio-metric-row">
          <span>Poids moy. :</span>
          <span class="bio-metric-val">${fish.biology.averageWeightKg}</span>
        </div>
        <div class="bio-metric-row">
          <span>Poids max :</span>
          <span class="bio-metric-val">${fish.biology.maxWeightKg}</span>
        </div>
      </div>
      <div class="bio-card">
        <div class="bio-title">Proies cibles & Régime</div>
        <div class="diet-tags">
          ${fish.biology.diet.map(d => `<span class="diet-tag">${d}</span>`).join('')}
        </div>
      </div>
    </div>

    <div class="calendar-block">
      <div class="block-title" style="margin-bottom: 0.25rem;">📅 Calendrier d'Activité Annuel</div>
      <div class="cal-row">
        <span class="cal-label">⚓ Canal</span>
        <div class="cal-months">
          ${fish.calendar.canal.map((score, m) => `
            <div class="month-cell heat-${score}" title="${MONTHS[m]} : score ${score}/3">${MONTHS[m]}</div>
          `).join('')}
        </div>
      </div>
      <div class="cal-row">
        <span class="cal-label">🚤 Bateau</span>
        <div class="cal-months">
          ${fish.calendar.bateau.map((score, m) => `
            <div class="month-cell heat-${score}" title="${MONTHS[m]} : score ${score}/3">${MONTHS[m]}</div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// TEMPLATE FACE B (VERSO) : TACTIQUES, POSTES & MATÉRIEL
// --------------------------------------------------------------------------

function renderCardBack(fish) {
  return `
    <div class="verso-header">
      <div>
        <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--slate-500); font-weight: 700;">Tactique Terrain Normandie</span>
        <h3 class="verso-title">${fish.identity.name}</h3>
      </div>
      <span class="verso-badge">Guide Pratique</span>
    </div>

    ${fish.canal.present ? `
      <div class="biotope-section">
        <div class="section-header-row">
          <div class="block-title" style="margin: 0; color: #0369a1;">⚓ Volet Canal de Caen à la mer</div>
          <span style="font-size: 0.65rem; font-weight: 700; color: var(--slate-600);">${fish.canal.presenceSeason}</span>
        </div>
        <div class="spots-compact-list">
          <div class="spot-item"><strong>Enrochements :</strong> ${fish.canal.keySpots.enrochements}</div>
          <div class="spot-item"><strong>Palplanches :</strong> ${fish.canal.keySpots.palplanches}</div>
          <div class="spot-item"><strong>Piles & Ouvrages :</strong> ${fish.canal.keySpots.pilesDePont}</div>
        </div>
        <div style="font-size: 0.68rem; color: var(--slate-700); margin-bottom: 0.3rem;">
          <strong>⚡ Déclencheurs :</strong> ${fish.canal.triggers.ecluseesOuistreham} ${fish.canal.triggers.luminositeEtNuit}
        </div>
        <ul class="tactics-bullets">
          ${fish.canal.tactics.map(t => `<li>${t}</li>`).join('')}
        </ul>
        <div class="lures-row">
          <strong>Top Leurres/Appâts Canal :</strong> ${fish.canal.recommendedLuresAndBaits.join(' • ')}
        </div>
      </div>
    ` : ''}

    ${fish.bateau.present ? `
      <div class="biotope-section">
        <div class="section-header-row">
          <div class="block-title" style="margin: 0; color: #0f766e;">🚤 Volet Côte de Nacre en Bateau</div>
          <span style="font-size: 0.65rem; font-weight: 700; color: var(--slate-600);">${fish.bateau.presenceSeason}</span>
        </div>
        <div class="spots-compact-list">
          <div class="spot-item"><strong>Roches Calvados :</strong> ${fish.bateau.habitats.rochesDuCalvados}</div>
          <div class="spot-item"><strong>Épaves 1944 :</strong> ${fish.bateau.habitats.epavesDDay}</div>
          <div class="spot-item"><strong>Bancs de sable :</strong> ${fish.bateau.habitats.bancsDeSableEtRidens}</div>
        </div>
        <div style="font-size: 0.68rem; color: var(--slate-700); margin-bottom: 0.3rem;">
          <strong>🌊 Marée & Vents :</strong> ${fish.bateau.tideAndCurrent.bestCoefficients} | ${fish.bateau.weatherImpact.favorableWinds}
        </div>
        <ul class="tactics-bullets">
          ${fish.bateau.tactics.map(t => `<li>${t}</li>`).join('')}
        </ul>
        <div class="lures-row">
          <strong>Top Leurres/Appâts Mer :</strong> ${fish.bateau.recommendedLuresAndBaits.join(' • ')}
        </div>
      </div>
    ` : ''}

    <div class="gear-grid">
      <div class="gear-box">
        <div class="gear-box-title">🎣 Combo Canal</div>
        <div class="gear-row"><span class="gear-row-label">Canne:</span><span class="gear-row-val">${fish.gear.canalCombo.rod}</span></div>
        <div class="gear-row"><span class="gear-row-label">Ligne:</span><span class="gear-row-val">${fish.gear.canalCombo.line}</span></div>
        <div class="gear-row"><span class="gear-row-label">B.D.L:</span><span class="gear-row-val">${fish.gear.canalCombo.leader}</span></div>
      </div>
      <div class="gear-box">
        <div class="gear-box-title">⚓ Combo Bateau</div>
        <div class="gear-row"><span class="gear-row-label">Canne:</span><span class="gear-row-val">${fish.gear.boatCombo.rod}</span></div>
        <div class="gear-row"><span class="gear-row-label">Ligne:</span><span class="gear-row-val">${fish.gear.boatCombo.line}</span></div>
        <div class="gear-row"><span class="gear-row-label">B.D.L:</span><span class="gear-row-val">${fish.gear.boatCombo.leader}</span></div>
      </div>
    </div>

    <div class="secret-local-box">
      <div class="secret-title">💡 Le Secret du Pêcheur Normand</div>
      <div>${fish.localSecret}</div>
    </div>
  `;
}
