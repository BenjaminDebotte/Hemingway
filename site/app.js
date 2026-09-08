// ==========================================================================
// APPLICATION LOGIQUE & RENDU DES FICHES TECHNIQUES
// ==========================================================================

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

const VIEW_HINTS = {
  duo: 'Mode Déplié : Face A (Identité) et Face B (Tactique) affichées côte-à-côte en pleine largeur',
  flip: "Mode Réversible : Cliquez sur l'icône de rotation pour basculer en 3D",
  print: "Mode Impression : Aperçu des planches A4 paysage duplex prêtes pour l'imprimante"
};

const SVG_ICONS = {
  search: `<svg class="ui-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  scale: `<svg class="ui-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><path d="M12 3v18M6 7l6-2 6 2M3 13l3-6 3 6a3 3 0 0 1-6 0zM15 13l3-6 3 6a3 3 0 0 1-6 0zM4 21h16"/></svg>`,
  calendar: `<svg class="ui-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  anchor: `<svg class="ui-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="21"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><line x1="9" y1="11" x2="15" y2="11"/></svg>`,
  boat: `<svg class="ui-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><path d="M2 17l2 4h16l2-4L2 17z"/><path d="M12 4v11"/><path d="M12 4l6 8H6l6-8z"/></svg>`,
  zap: `<svg class="ui-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  wave: `<svg class="ui-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><path d="M2 12c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 7.5 0"/><path d="M2 17c2.5-3 5-3 7.5 0s5 3 7.5 0 5-3 7.5 0"/></svg>`,
  clock: `<svg class="ui-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M10 2h4"/></svg>`,
  rod: `<svg class="ui-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><line x1="4" y1="20" x2="20" y2="4"/><path d="M20 4l-2 2"/><path d="M15 9l-2 2"/><path d="M10 14l-2 2"/><circle cx="5" cy="19" r="1.5"/></svg>`,
  sparkle: `<svg class="ui-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  rotate: `<svg class="ui-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><polyline points="21 3 21 8 16 8"/></svg>`,
  fish: `<svg class="ui-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><path d="M19 12c-4 4-10 4-15 0 5-4 11-4 15 0z"/><path d="M4 12L2 9.5v5L4 12z"/><circle cx="15" cy="11" r="1" fill="currentColor"/></svg>`,
  hook: `<svg class="ui-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><circle cx="16" cy="4" r="2"/><path d="M16 6v7a5 5 0 0 1-10 0v-2l2 2"/></svg>`,
  moon: `<svg class="ui-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  compass: `<svg class="ui-icon" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polygon points="12 8 10 14 16 12 12 8"/></svg>`
};

function uiIcon(name, extraClass = '') {
  const raw = SVG_ICONS[name] || '';
  if (!raw || !extraClass) return raw;
  return raw.replace('class="ui-icon"', `class="ui-icon ${extraClass}"`);
}

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
    return `<button class="pill ${activeClass}" data-category="${cat}"><span class="pill-dot"></span><span>${label}</span></button>`;
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
    hintEl.textContent = VIEW_HINTS[currentViewMode] || '';
  }

  if (currentViewMode === 'duo') {
    renderDuoView(speciesList);
    setupScrollObserver();
  } else if (currentViewMode === 'flip') {
    renderFlipView(speciesList);
    setupScrollObserver();
  } else {
    renderPrintView(speciesList);
  }
}

// --------------------------------------------------------------------------
// CHORÉGRAPHIE CINÉMATIQUE & INTERSECTION OBSERVER
// --------------------------------------------------------------------------

function setupScrollObserver() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.duo-card-shell, .interactive-card').forEach(el => {
      el.classList.add('is-revealed');
    });
    return;
  }

  const cards = document.querySelectorAll('.duo-card-shell, .interactive-card');
  if (!cards.length) return;

  if (window._cardObserver) {
    window._cardObserver.disconnect();
  }

  if (!('IntersectionObserver' in window)) {
    cards.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  window._cardObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.04,
    rootMargin: '20px 0px -20px 0px'
  });

  cards.forEach(card => {
    window._cardObserver.observe(card);
  });
}

function renderEmptyState() {
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

function renderDuoView(speciesList) {
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
          ${renderCardBack(fish)}
        </div>
      </div>
    </article>
  `).join('');
}

// --------------------------------------------------------------------------
// VUE 2 : FICHES RÉVERSIBLES (ANIMATION 3D GRAND FORMAT)
// --------------------------------------------------------------------------

function renderFlipView(speciesList) {
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
            ${renderCardBack(fish, true)}
          </div>
        </div>
      </div>
    </article>
  `).join('');
}

window.toggleCardFlip = function(id) {
  const el = document.getElementById(`card-${id}`);
  if (el) {
    el.classList.toggle('flipped');
  }
};

window.switchCardBiotope = function(e, fishId, tab) {
  if (e) e.stopPropagation();
  const card = document.getElementById(`card-${fishId}`);
  if (!card) return;
  const switcher = card.querySelector('.biotope-card-switcher');
  if (switcher) {
    switcher.querySelectorAll('.biotope-switch-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
  }
  const canalSection = card.querySelector('.section-canal');
  const bateauSection = card.querySelector('.section-bateau');

  if (canalSection) canalSection.classList.toggle('tab-hidden', tab !== 'canal');
  if (bateauSection) bateauSection.classList.toggle('tab-hidden', tab !== 'bateau');
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
// MOTEURS DE RENDU GRAPHIQUE & GAUGES VISUELLES
// --------------------------------------------------------------------------

function parseTwelfths(text) {
  if (!text) return { hours: [false, false, false, false, false, false], hoursStr: 'N/A', flow: 'Marée active', detail: '' };
  const hours = [false, false, false, false, false, false];

  for (const [, s, e] of text.matchAll(/H([1-6])\s*(?:à|-|–)\s*H([1-6])/gi)) {
    const start = Math.min(+s, +e);
    const end = Math.max(+s, +e);
    for (let h = start; h <= end; h++) hours[h - 1] = true;
  }

  for (const [, h] of text.matchAll(/\bH([1-6])\b/gi)) {
    hours[+h - 1] = true;
  }

  const activeList = hours.map((act, i) => act ? `H${i + 1}` : null).filter(Boolean);
  const hoursStr = activeList.length > 0 ? activeList.join(' • ') : 'Toutes heures';
  const detail = text.includes(':') ? text.split(':').slice(1).join(':').trim() : text;

  let flow = 'Marée active';
  if (hours[2] && hours[3] && !hours[0] && !hours[5]) {
    flow = 'Mi-marée (Courant max)';
  } else if ((hours[0] || hours[5]) && !hours[2] && !hours[3]) {
    flow = 'Étales (Courant faible/nul)';
  } else if (hours[1] || hours[4]) {
    flow = 'Courant modéré (Flot/Jusant)';
  }

  return { hours, hoursStr, flow, detail };
}

function renderTwelfthsGauge(ruleOfTwelfthsText) {
  const tw = parseTwelfths(ruleOfTwelfthsText);
  const steps = [
    { h: 'H1', frac: '1/12', pct: 33, act: tw.hours[0] },
    { h: 'H2', frac: '2/12', pct: 66, act: tw.hours[1] },
    { h: 'H3', frac: '3/12', pct: 100, act: tw.hours[2] },
    { h: 'H4', frac: '3/12', pct: 100, act: tw.hours[3] },
    { h: 'H5', frac: '2/12', pct: 66, act: tw.hours[4] },
    { h: 'H6', frac: '1/12', pct: 33, act: tw.hours[5] }
  ];

  return `
    <div class="twelfths-card">
      <div class="twelfths-top-row">
        <div class="twelfths-title">${uiIcon('clock')} Règle des douzièmes (Courant & Marnage)</div>
        <div class="twelfths-badge-group">
          <span class="twelfths-hours-pill">${tw.hoursStr}</span>
          <span class="twelfths-flow-pill">${tw.flow}</span>
        </div>
      </div>
      <div class="twelfths-chart-container">
        <div class="twelfths-bell-curve" role="img" aria-label="Jauge des 6 heures de marée : ${tw.hoursStr} actives">
          ${steps.map(s => `
            <div class="twelfth-col ${s.act ? 'active' : ''}" title="${s.h} (${s.frac} du marnage)${s.act ? ' — Actif pour cette espèce' : ''}">
              <div class="twelfth-bar-track">
                <div class="twelfth-bar-fill" style="height: ${s.pct}%;"></div>
              </div>
              <span class="twelfth-hour-name">${s.h}</span>
              <span class="twelfth-frac-label">${s.frac}</span>
            </div>
          `).join('')}
        </div>
        <div class="twelfths-note">
          <span class="twelfths-note-text">${tw.detail}</span>
        </div>
      </div>
    </div>
  `;
}

function parseCoefficients(text) {
  if (!text) return { min: 20, max: 120, isAll: true, label: 'Tous coefs', detail: '' };
  if (/tous coefficients/i.test(text)) {
    return { min: 20, max: 120, isAll: true, label: 'Tous coefs (20-120)', detail: text };
  }

  const match = text.match(/(\d{2})\s*(?:-|à|et)\s*(\d{2,3})/i);
  if (match) {
    const min = parseInt(match[1], 10);
    const max = parseInt(match[2], 10);
    let type = 'Moyens';
    if (max <= 65) type = 'Mortes-eaux';
    else if (min >= 70) type = 'Vives-eaux';
    return { min, max, isAll: false, label: `Coefs ${min}-${max} (${type})`, detail: text };
  }

  const single = text.match(/(\d{2})/);
  if (single) {
    const v = parseInt(single[1], 10);
    return { min: v, max: v, isAll: false, label: `Coef ~${v}`, detail: text };
  }

  return { min: 20, max: 120, isAll: true, label: 'Tous coefficients', detail: text };
}

function formatWindCondition(text) {
  if (!text) return { badge: 'Vent variable' };
  let badge = 'Vent variable';
  if (/Sud[\s/-]*SO|Sud-Ouest|terre/i.test(text)) {
    badge = 'Vent de terre (S/SO)';
  } else if (/Est/i.test(text)) {
    badge = "Brise d'Est";
  } else if (/Ouest/i.test(text)) {
    badge = "Brise d'Ouest";
  } else if (/faible|nul|calme/i.test(text)) {
    badge = 'Vent faible / Mer calme';
  } else if (/Beaufort/i.test(text)) {
    badge = '2 à 3 Beaufort';
  }
  return { badge };
}

function renderTideAndWeather(coefText, windText) {
  const cf = parseCoefficients(coefText);
  const wind = formatWindCondition(windText);

  const leftPct = cf.isAll ? 0 : Math.max(0, Math.round(((cf.min - 20) / 100) * 100));
  const widthPct = cf.isAll ? 100 : Math.max(12, Math.round(((cf.max - cf.min) / 100) * 100));

  return `
    <div class="tide-weather-cockpit">
      <div class="cockpit-box coef-gauge-box">
        <div class="cockpit-box-header">
          <span class="cockpit-box-title">${uiIcon('wave')} Coefficients</span>
          <span class="cockpit-pill-val">${cf.label}</span>
        </div>
        <div class="coef-track-wrap" title="${cf.detail}">
          <div class="coef-track">
            <div class="coef-fill ${cf.isAll ? 'is-all' : ''}" style="left: ${leftPct}%; width: ${widthPct}%;"></div>
            <span class="coef-tick" style="left: 25%;" title="Mortes-eaux : 45"></span>
            <span class="coef-tick" style="left: 50%;" title="Moyenne : 70"></span>
            <span class="coef-tick" style="left: 75%;" title="Vives-eaux : 95"></span>
          </div>
          <div class="coef-labels">
            <span>20 (ME)</span>
            <span>70 (Moy)</span>
            <span>120 (VE)</span>
          </div>
        </div>
      </div>

      <div class="cockpit-box wind-weather-box">
        <div class="cockpit-box-header">
          <span class="cockpit-box-title">${uiIcon('compass')} Météo & Vents</span>
          <span class="cockpit-pill-val">${wind.badge}</span>
        </div>
        <div class="wind-desc-text">${windText}</div>
      </div>
    </div>
  `;
}

function renderCanalTriggers(ecluseText, lightText) {
  return `
    <div class="canal-triggers-cockpit">
      <div class="trigger-card trigger-ecluse">
        <div class="trigger-header">${uiIcon('zap')} Éclusées d'Ouistreham</div>
        <div class="trigger-text">${ecluseText}</div>
      </div>
      <div class="trigger-card trigger-light">
        <div class="trigger-header">${uiIcon('moon')} Luminosité & Chasse</div>
        <div class="trigger-text">${lightText}</div>
      </div>
    </div>
  `;
}

function parseLengths(avgStr = '', maxStr = '') {
  const maxVal = parseInt((maxStr.match(/\d+/) || [100])[0], 10);
  const range = avgStr.match(/(\d+)\s*(?:-|à)\s*(\d+)/);
  const single = avgStr.match(/\d+/);

  const minAvg = range ? +range[1] : (single ? +single[0] : 0);
  const maxAvg = range ? +range[2] : minAvg;

  const toPct = (val) => Math.max(0, Math.min(100, Math.round((val / maxVal) * 100)));
  return { minAvg, maxAvg, maxVal, minPercent: toPct(minAvg), maxPercent: toPct(maxAvg) };
}

function renderMorphologyGauge(biology) {
  const len = parseLengths(biology.averageLengthCm, biology.maxLengthCm);
  const barWidth = Math.max(10, len.maxPercent - len.minPercent);

  return `
    <div class="bio-card bio-morpho-card">
      <div class="bio-title">Morphologie & Gabarit</div>
      <div class="size-gauge-track-wrap" title="Longueur moyenne : ${biology.averageLengthCm} | Maximum : ${biology.maxLengthCm}">
        <div class="size-gauge-track">
          <div class="size-gauge-fill" style="left: ${len.minPercent}%; width: ${barWidth}%;"></div>
          <div class="size-gauge-pin" style="left: 100%;" title="Taille maximale record : ${biology.maxLengthCm}"></div>
        </div>
        <div class="size-gauge-labels">
          <span class="size-val-avg"><span class="size-dot"></span>${biology.averageLengthCm}</span>
          <span class="size-val-max">Max: ${biology.maxLengthCm}</span>
        </div>
      </div>
      <div class="bio-weight-row">
        <span class="weight-label">Poids :</span>
        <span class="weight-val">${biology.averageWeightKg} <span class="weight-max">(max ${biology.maxWeightKg})</span></span>
      </div>
    </div>
  `;
}

function renderExhaustiveTackleBlock(terminal, combo, biotopeLabel, biotopeKey) {
  if (!terminal) return '';

  const hasCombo = combo && combo.rod && !combo.rod.includes('Non applicable');

  return `
    <div class="terminal-tackle-card terminal-${biotopeKey}">
      <div class="terminal-card-header">
        <span class="terminal-card-title">${uiIcon('rod')} Matériel, Armement & Leurres ${biotopeLabel}</span>
      </div>
      <div class="terminal-specs-grid">
        ${hasCombo ? `
          <div class="terminal-spec-item spec-combo">
            <span class="terminal-pill pill-combo">Combo</span>
            <span class="terminal-val"><strong>Canne :</strong> ${combo.rod} • <strong>Ligne :</strong> ${combo.line}</span>
          </div>
        ` : ''}
        <div class="terminal-spec-item">
          <span class="terminal-pill pill-leader">Bas de ligne</span>
          <span class="terminal-val">${terminal.leaderRequirement}</span>
        </div>
        <div class="terminal-spec-item">
          <span class="terminal-pill pill-hook">Hameçon</span>
          <span class="terminal-val">${terminal.hookTypeAndSize}</span>
        </div>
        <div class="terminal-spec-item">
          <span class="terminal-pill pill-rigid">Rigide</span>
          <span class="terminal-val">${terminal.rigidLure}</span>
        </div>
        <div class="terminal-spec-item">
          <span class="terminal-pill pill-soft">Souple</span>
          <span class="terminal-val">${terminal.softLure}</span>
        </div>
        <div class="terminal-spec-item">
          <span class="terminal-pill pill-natural">Naturel</span>
          <span class="terminal-val">${terminal.naturalLure}</span>
        </div>
      </div>
    </div>
  `;
}

const HARVEST_RULES = [
  { match: (t) => t.includes('no-kill'), pct: 8, color: 'red', shortLabel: 'No-Kill', desc: 'No-Kill strict' },
  { match: (t, id) => id === 'bar-commun' || t.includes('2 bars'), pct: 15, color: 'red', shortLabel: '2 / jour', desc: 'Quota strict 2/j' },
  { match: (t, id) => id === 'lieu-jaune' || t.includes('2 lieux'), pct: 15, color: 'red', shortLabel: '2 / jour', desc: 'Quota strict 2/j' },
  { match: (t) => t.includes('2 brochets'), pct: 18, color: 'red', shortLabel: 'Max 2 / jour', desc: 'Quota max 2/j' },
  { match: (t) => t.includes('1 à 2'), pct: 18, color: 'red', shortLabel: '1-2 / jour', desc: 'Quota 1-2/j' },
  { match: (t, id) => id === 'anguille-europe' || t.includes('strictement réglementé'), pct: 12, color: 'red', shortLabel: 'Strict (Carnet)', desc: 'Carnet obligatoire' },
  { match: (t) => t.includes('très limité') || t.includes('patrimonial'), pct: 22, color: 'red', shortLabel: 'Très limité', desc: 'Prélèvement très limité' },
  { match: (t) => t.includes('3 carnassiers'), pct: 45, color: 'amber', shortLabel: '3 / jour', desc: 'Quota 3 carnassiers/j' },
  { match: (t) => t.includes('très modéré'), pct: 45, color: 'amber', shortLabel: 'Modéré', desc: 'Prélèvement modéré' },
  { match: (t) => t.includes('non soumis') || t.includes('libre'), pct: 92, color: 'green', shortLabel: 'Libre', desc: 'Sans quota statutaire' }
];

const DEFAULT_HARVEST_GAUGE = { pct: 80, color: 'green', shortLabel: 'Raisonné', desc: 'Prélèvement raisonné' };

function getHarvestGauge(bagLimit, speciesId) {
  const text = (bagLimit || '').toLowerCase();
  const rule = HARVEST_RULES.find(r => r.match(text, speciesId));
  return rule ? { pct: rule.pct, color: rule.color, shortLabel: rule.shortLabel, desc: rule.desc } : DEFAULT_HARVEST_GAUGE;
}

function renderHarvestPill(bagLimit, speciesId) {
  const h = getHarvestGauge(bagLimit, speciesId);

  return `
    <div class="reg-pill reg-pill-harvest" title="Réglementation prélèvement : ${bagLimit}">
      <span class="reg-pill-label">Prélèvement</span>
      <span class="reg-pill-val val-harvest val-${h.color}">${h.shortLabel}</span>
      <div class="harvest-gauge-wrap">
        <div class="harvest-gauge-track">
          <div class="harvest-gauge-cursor" style="left: ${h.pct}%;"></div>
        </div>
        <div class="harvest-gauge-ticks">
          <span class="tick-label tick-strict">Strict</span>
          <span class="tick-label tick-libre">Libre</span>
        </div>
      </div>
    </div>
  `;
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
        ${fish.canal.present ? `<span class="badge-biotope badge-canal">${uiIcon('anchor')} Canal de Caen</span>` : ''}
        ${fish.bateau.present ? `<span class="badge-biotope badge-mer">${uiIcon('boat')} Côte de Nacre</span>` : ''}
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
  `;
}

// --------------------------------------------------------------------------
// TEMPLATE FACE B (VERSO) : TACTIQUES, POSTES & MATÉRIEL
// --------------------------------------------------------------------------

function renderCardBack(fish, isFlipCard = false) {
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
      <div class="biotope-card-switcher" role="tablist" aria-label="Choisir le biotope terrain">
        <button type="button" class="biotope-switch-btn ${defaultTab === 'canal' ? 'active' : ''}" data-tab="canal" onclick="switchCardBiotope(event, '${fish.id}', 'canal')">
          ${uiIcon('anchor')} Volet Canal de Caen
        </button>
        <button type="button" class="biotope-switch-btn ${defaultTab === 'bateau' ? 'active' : ''}" data-tab="bateau" onclick="switchCardBiotope(event, '${fish.id}', 'bateau')">
          ${uiIcon('boat')} Volet Côte de Nacre
        </button>
      </div>
    ` : ''}

    ${fish.canal.present ? `
      <div class="biotope-section section-canal ${canalHidden}">
        <div class="section-header-row">
          <div class="block-title section-canal-title">${uiIcon('anchor')} Volet Canal de Caen à la mer</div>
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
    ` : ''}

    ${fish.bateau.present ? `
      <div class="biotope-section section-bateau ${bateauHidden}">
        <div class="section-header-row">
          <div class="block-title section-bateau-title">${uiIcon('boat')} Volet Côte de Nacre en Bateau</div>
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
    ` : ''}
  `;
}
