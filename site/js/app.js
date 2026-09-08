// ==========================================================================
// APPLICATION LOGIQUE, FILTRES & ORCHESTRATION
// ==========================================================================

import { initThemeController } from './theme-controller.js';
import { VIEW_HINTS, renderDuoView, renderFlipView, renderPrintView } from './views.js';
import { uiIcon } from './icons.js';

let currentFilterCategory = 'all';
let currentFilterBiotope = 'all';
let currentSearchTerm = '';
let currentViewMode = 'duo'; // 'duo' (dépliée) | 'flip' (carte 3D) | 'print' (A4)

export function initApp() {
  const data = window.SPECIES_DATA || [];
  console.log(`Initialisation de l'application avec ${data.length} espèces.`);

  initThemeController();
  setupFilterPills(data);
  setupSearch();
  setupToggles();
  setupSpotInteractions();
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
    renderDuoView(speciesList, currentFilterBiotope);
    setupScrollObserver();
  } else if (currentViewMode === 'flip') {
    renderFlipView(speciesList, currentFilterBiotope);
    setupScrollObserver();
  } else {
    renderPrintView(speciesList, currentFilterBiotope);
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

// --------------------------------------------------------------------------
// DÉCLENCHEURS GLOBAUX POUR LE DOM
// --------------------------------------------------------------------------

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

// --------------------------------------------------------------------------
// INTERACTIONS WAYPOINTS GPS, COPIE & TOAST
// --------------------------------------------------------------------------

function setupSpotInteractions() {
  document.addEventListener('click', (e) => {
    // 1. Clic sur bouton de copie coordonnées
    const copyBtn = e.target.closest('.btn-copy-coords, .tooltip-btn-copy');
    if (copyBtn) {
      e.preventDefault();
      e.stopPropagation();
      const nautical = copyBtn.dataset.nautical;
      const decimal = copyBtn.dataset.decimal;
      const name = copyBtn.dataset.name || 'Spot';
      const textToCopy = `${name} : ${nautical} (${decimal})`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).catch(() => {
          fallbackCopyText(textToCopy);
        });
      } else {
        fallbackCopyText(textToCopy);
      }

      if (navigator.vibrate) navigator.vibrate(40);
      showToast(`📍 ${name} copié : ${nautical}`);

      const originalHtml = copyBtn.innerHTML;
      copyBtn.innerHTML = `${uiIcon('check')} <span>Copié !</span>`;
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.innerHTML = originalHtml;
        copyBtn.classList.remove('copied');
      }, 1800);
      return;
    }

    // 2. Clic sur repère de carte interactif (mobile / touch toggle)
    const pin = e.target.closest('.map-interactive-pin');
    if (pin) {
      const wasActive = pin.classList.contains('active-pin');
      document.querySelectorAll('.map-interactive-pin.active-pin').forEach(p => p.classList.remove('active-pin'));
      if (!wasActive) {
        pin.classList.add('active-pin');
      }
      return;
    }

    // 3. Clic en dehors des repères : fermer les infobulles actives
    document.querySelectorAll('.map-interactive-pin.active-pin').forEach(p => p.classList.remove('active-pin'));
  });
}

function fallbackCopyText(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.warn('Impossible de copier dans le presse-papier', err);
  }
  document.body.removeChild(textArea);
}

let toastTimeout = null;
export function showToast(message, duration = 2600) {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'global-toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span class="toast-icon">${uiIcon('crosshair')}</span> <span class="toast-msg">${message}</span>`;
  toast.classList.add('visible');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('visible');
  }, duration);
}

// Initialisation au chargement du DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
