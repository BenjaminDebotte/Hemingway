// ==========================================================================
// APPLICATION LOGIQUE, FILTRES & ORCHESTRATION
// ==========================================================================

import { initThemeController } from './theme-controller.js';
import { VIEW_HINTS, renderDuoView, renderFlipView, renderPrintView } from './views.js';
import { uiIcon } from './icons.js';
import { getPermitInfo, requiresPermit } from './parsers.js';

let showPrintMaps = true;
let currentViewMode = 'duo'; // 'duo' (dépliée) | 'flip' (carte 3D) | 'print' (A4)

const STATE_KEYS = {
  category: 'categories',
  biotope: 'biotopes',
  permit: 'permits',
  regulation: 'regulations',
  month: 'months'
};

const filterState = {
  categories: new Set(['all']),
  biotopes: new Set(['all']),
  permits: new Set(['all']),
  regulations: new Set(['all']),
  months: new Set(['all']),
  searchTerm: '',
  isRegexMode: false,
  combinationMode: 'AND' // 'AND' | 'OR'
};

const MULTISELECT_LABELS = {
  category: { all: 'Toutes' },
  biotope: {
    all: 'Tous',
    canal: 'Présent au Canal',
    bateau: 'Présent en Bateau',
    canal_only: 'Exclusif Canal',
    bateau_only: 'Exclusif Bateau',
    both: 'Présent partout'
  },
  permit: {
    all: 'Tous',
    free_dpm: 'Pêche libre DPM',
    bassin_st_pierre: 'AAPPMA (Bassin St-Pierre)',
    cpma_fluvial: 'Timbre CPMA (Migrateurs)'
  },
  regulation: {
    all: 'Toutes',
    legal_size: 'Maille légale',
    bag_limit: 'Quota journalier',
    closed_season: 'Période de fermeture',
    no_kill: 'Pratique No-Kill'
  },
  month: {
    all: 'Tous mois',
    1: 'Janvier', 2: 'Février', 3: 'Mars', 4: 'Avril', 5: 'Mai', 6: 'Juin',
    7: 'Juillet', 8: 'Août', 9: 'Septembre', 10: 'Octobre', 11: 'Novembre', 12: 'Décembre'
  }
};

export function initApp() {
  const data = window.SPECIES_DATA || [];
  console.log(`Initialisation de l'application avec ${data.length} espèces.`);

  initThemeController();
  setupSearch();
  setupMultiselectControls();
  setupToggles();
  setupSpotInteractions();
  renderApp();
}

// --------------------------------------------------------------------------
// FILTRES ET ÉVÉNEMENTS
// --------------------------------------------------------------------------

function setupSearch() {
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  const regexToggleBtn = document.getElementById('btn-regex-toggle');
  if (!searchInput) return;

  let rafId = null;

  const triggerSearch = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      renderApp();
    });
  };

  searchInput.addEventListener('input', (e) => {
    filterState.searchTerm = e.target.value.trim();
    if (clearBtn) clearBtn.hidden = !filterState.searchTerm;
    triggerSearch();
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      filterState.searchTerm = '';
      searchInput.focus();
      clearBtn.hidden = true;
      triggerSearch();
    });
  }

  if (regexToggleBtn) {
    regexToggleBtn.addEventListener('click', () => {
      filterState.isRegexMode = !filterState.isRegexMode;
      regexToggleBtn.setAttribute('aria-pressed', filterState.isRegexMode ? 'true' : 'false');
      regexToggleBtn.classList.toggle('active', filterState.isRegexMode);
      triggerSearch();
    });
  }
}

function updateMultiselectTriggerLabel(groupKey) {
  const trigger = document.getElementById(`trigger-${groupKey}`);
  const labelEl = document.getElementById(`label-${groupKey}`);
  if (!labelEl) return;

  const stateKey = STATE_KEYS[groupKey] || groupKey;
  const set = filterState[stateKey];
  const dict = MULTISELECT_LABELS[groupKey] || {};

  const isCustomActive = set && !set.has('all') && set.size > 0;
  if (trigger) {
    trigger.classList.toggle('is-active', isCustomActive);
  }

  if (!set || set.has('all') || set.size === 0) {
    labelEl.textContent = dict.all || 'Tous';
  } else if (set.size === 1) {
    const singleVal = Array.from(set)[0];
    labelEl.textContent = dict[singleVal] || singleVal;
  } else {
    labelEl.textContent = `${set.size} sélect.`;
  }
}

function syncPopoverCheckboxes(groupKey) {
  const popover = document.getElementById(`popover-${groupKey}`);
  if (!popover) return;

  const stateKey = STATE_KEYS[groupKey] || groupKey;
  const set = filterState[stateKey];
  if (!set) return;

  popover.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    const isChecked = set.has('all') ? (cb.value === 'all') : set.has(cb.value);
    cb.checked = isChecked;
    const optionLabel = cb.closest('.multiselect-option');
    if (optionLabel) {
      optionLabel.classList.toggle('is-checked', isChecked);
    }
  });
}

function setupMultiselectControls() {
  const groups = ['category', 'biotope', 'permit', 'regulation', 'month'];

  groups.forEach(groupKey => {
    const trigger = document.getElementById(`trigger-${groupKey}`);
    const popover = document.getElementById(`popover-${groupKey}`);
    const nativeSel = document.getElementById(`${groupKey}-select`);

    if (trigger && popover) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = !popover.hidden;

        // Ferme tous les autres popovers
        document.querySelectorAll('.multiselect-popover').forEach(p => {
          if (p !== popover) p.hidden = true;
        });
        document.querySelectorAll('.multiselect-trigger').forEach(t => {
          if (t !== trigger) t.setAttribute('aria-expanded', 'false');
        });

        popover.hidden = isOpen;
        trigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      });

      popover.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      popover.addEventListener('change', (e) => {
        const cb = e.target;
        if (!cb || cb.type !== 'checkbox') return;

        const val = cb.value;
        const stateKey = STATE_KEYS[groupKey] || groupKey;
        const set = filterState[stateKey];

        if (val === 'all') {
          if (cb.checked) {
            set.clear();
            set.add('all');
          } else if (set.size === 0 || (set.size === 1 && set.has('all'))) {
            cb.checked = true;
            set.clear();
            set.add('all');
          }
        } else {
          set.delete('all');
          if (cb.checked) {
            set.add(val);
          } else {
            set.delete(val);
          }
          if (set.size === 0) {
            set.add('all');
          }
        }

        syncPopoverCheckboxes(groupKey);
        updateMultiselectTriggerLabel(groupKey);

        // Synchro du select natif pour tests automatisés CDP
        if (nativeSel) {
          nativeSel.value = set.has('all') ? 'all' : Array.from(set)[0];
        }

        renderApp();
      });
    }

    // Compatibilité événements change sur selects natifs (ex: scripts de test CDP)
    if (nativeSel) {
      nativeSel.addEventListener('change', (e) => {
        const val = e.target.value;
        const stateKey = STATE_KEYS[groupKey] || groupKey;
        filterState[stateKey] = new Set([val]);
        syncPopoverCheckboxes(groupKey);
        updateMultiselectTriggerLabel(groupKey);
        renderApp();
      });
    }
  });

  // Fermeture des popovers au clic à l'extérieur ou à la touche Échap (Escape)
  document.addEventListener('click', () => {
    document.querySelectorAll('.multiselect-popover').forEach(p => p.hidden = true);
    document.querySelectorAll('.multiselect-trigger').forEach(t => t.setAttribute('aria-expanded', 'false'));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openPopovers = document.querySelectorAll('.multiselect-popover:not([hidden])');
      if (openPopovers.length > 0) {
        openPopovers.forEach(p => p.hidden = true);
        document.querySelectorAll('.multiselect-trigger').forEach(t => t.setAttribute('aria-expanded', 'false'));
      }
    }
  });

  // Écouteurs pour la bascule de combinaison logique ET / OU
  const logicBtns = document.querySelectorAll('.logic-mode-btn');
  logicBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      logicBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      filterState.combinationMode = btn.dataset.logic === 'or' ? 'OR' : 'AND';
      renderApp();
    });
  });

  // Délégation globale d'événements de clic pour l'effacement et la suppression de filtres
  document.addEventListener('click', (e) => {
    const resetBtn = e.target.closest('#btn-reset-filters, .btn-reset-filters');
    if (resetBtn) {
      e.preventDefault();
      resetAllFilters();
      return;
    }

    const removeTagBtn = e.target.closest('.active-filter-remove');
    if (removeTagBtn) {
      e.preventDefault();
      removeSingleFilter(removeTagBtn.dataset.key);
      return;
    }
  });
}

function resetAllFilters() {
  filterState.categories = new Set(['all']);
  filterState.biotopes = new Set(['all']);
  filterState.permits = new Set(['all']);
  filterState.regulations = new Set(['all']);
  filterState.months = new Set(['all']);
  filterState.searchTerm = '';
  filterState.isRegexMode = false;
  filterState.combinationMode = 'AND';

  // Réinitialisation des popovers, étiquettes et cases à cocher
  ['category', 'biotope', 'permit', 'regulation', 'month'].forEach(groupKey => {
    syncPopoverCheckboxes(groupKey);
    updateMultiselectTriggerLabel(groupKey);
    const sel = document.getElementById(`${groupKey}-select`);
    if (sel) sel.value = 'all';
  });

  document.querySelectorAll('.multiselect-popover').forEach(p => p.hidden = true);
  document.querySelectorAll('.multiselect-trigger').forEach(t => t.setAttribute('aria-expanded', 'false'));

  // Réinitialisation de la recherche
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';

  const clearBtn = document.getElementById('search-clear-btn');
  if (clearBtn) clearBtn.hidden = true;

  const regexBtn = document.getElementById('btn-regex-toggle');
  if (regexBtn) {
    regexBtn.setAttribute('aria-pressed', 'false');
    regexBtn.classList.remove('active');
  }

  // Réinitialisation du mode logique
  const logicBtns = document.querySelectorAll('.logic-mode-btn');
  logicBtns.forEach(btn => {
    const isAnd = btn.dataset.logic === 'and';
    btn.classList.toggle('active', isAnd);
    btn.setAttribute('aria-checked', isAnd ? 'true' : 'false');
  });

  // Réinitialisation explicite de l'affichage du bouton de réinitialisation
  const resetBtn = document.getElementById('btn-reset-filters');
  const resetLabel = document.getElementById('reset-filters-label');
  if (resetLabel) resetLabel.textContent = 'Effacer les filtres';
  if (resetBtn) resetBtn.hidden = true;

  renderApp();
}

function removeSingleFilter(key) {
  if (key === 'category' || key === 'biotope' || key === 'permit' || key === 'regulation' || key === 'month') {
    const stateKey = STATE_KEYS[key] || key;
    filterState[stateKey] = new Set(['all']);
    syncPopoverCheckboxes(key);
    updateMultiselectTriggerLabel(key);
    const sel = document.getElementById(`${key}-select`);
    if (sel) sel.value = 'all';
  } else if (key === 'search') {
    filterState.searchTerm = '';
    const input = document.getElementById('search-input');
    if (input) input.value = '';
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) clearBtn.hidden = true;
  }
  renderApp();
}

function setupToggles() {
  const printMapsBtn = document.getElementById('btn-toggle-print-maps');
  if (printMapsBtn) {
    printMapsBtn.addEventListener('click', () => {
      showPrintMaps = !showPrintMaps;
      printMapsBtn.setAttribute('aria-pressed', showPrintMaps ? 'true' : 'false');
      printMapsBtn.classList.toggle('active', showPrintMaps);
      const label = document.getElementById('print-maps-label');
      if (label) label.textContent = `Cartes impression : ${showPrintMaps ? 'OUI' : 'NON'}`;
      document.body.classList.toggle('no-print-maps', !showPrintMaps);
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

  // Interception standard de l'impression système (Ctrl+P / Menu navigateur)
  window.addEventListener('beforeprint', () => {
    if (currentViewMode !== 'print') {
      window.__prevViewMode = currentViewMode;
      currentViewMode = 'print';
      document.body.classList.add('print-mode');
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === 'print'));
      renderApp();
    }
  });

  window.addEventListener('afterprint', () => {
    if (window.__prevViewMode) {
      currentViewMode = window.__prevViewMode;
      window.__prevViewMode = null;
      document.body.classList.toggle('print-mode', currentViewMode === 'print');
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.toggle('active', b.dataset.mode === currentViewMode));
      renderApp();
    }
  });
}

// --------------------------------------------------------------------------
// FILTRAGE DES DONNÉES
// --------------------------------------------------------------------------

function getFilteredSpecies() {
  const data = window.SPECIES_DATA || [];

  // Validation regex en mode Regex
  let regexObj = null;
  let regexError = false;
  if (filterState.isRegexMode && filterState.searchTerm) {
    if (filterState.searchTerm.length > 50) {
      regexError = true;
    } else {
      try {
        regexObj = new RegExp(filterState.searchTerm, 'i');
      } catch (err) {
        regexError = true;
      }
    }
  }

  const searchWrap = document.querySelector('.search-input-wrap');
  const errorBadge = document.getElementById('regex-error-badge');
  if (searchWrap && errorBadge) {
    if (regexError) {
      searchWrap.classList.add('has-regex-error');
      errorBadge.hidden = false;
    } else {
      searchWrap.classList.remove('has-regex-error');
      errorBadge.hidden = true;
    }
  }

  return data.filter(fish => {
    const matches = {};

    // 1. Categories (OR entre catégories sélectionnées)
    if (!filterState.categories.has('all') && filterState.categories.size > 0) {
      matches.category = filterState.categories.has(fish.identity.category);
    }

    // 2. Biotopes (OR entre biotopes sélectionnés)
    if (!filterState.biotopes.has('all') && filterState.biotopes.size > 0) {
      const isCanal = fish.canal.present;
      const isBateau = fish.bateau.present;
      let matchBio = false;

      for (const val of filterState.biotopes) {
        if (val === 'canal' && isCanal) matchBio = true;
        else if (val === 'bateau' && isBateau) matchBio = true;
        else if (val === 'canal_only' && (isCanal && !isBateau)) matchBio = true;
        else if (val === 'bateau_only' && (isBateau && !isCanal)) matchBio = true;
        else if (val === 'both' && (isCanal && isBateau)) matchBio = true;
      }
      matches.biotope = matchBio;
    }

    // 3. Permits (OR entre régimes sélectionnés)
    if (!filterState.permits.has('all') && filterState.permits.size > 0) {
      const pInfo = getPermitInfo(fish);
      let matchPermit = false;

      for (const val of filterState.permits) {
        if (val === 'free_dpm' && pInfo.dpmFree) matchPermit = true;
        else if (val === 'bassin_st_pierre' && pInfo.requiresAAPPMAInBassin) matchPermit = true;
        else if (val === 'cpma_fluvial' && pInfo.requiresCPMA) matchPermit = true;
        else if (val === 'required' && requiresPermit(fish)) matchPermit = true;
        else if (val === 'free' && !requiresPermit(fish)) matchPermit = true;
      }
      matches.permit = matchPermit;
    }

    // 4. Regulations (OR entre contraintes réglementaires sélectionnées)
    if (!filterState.regulations.has('all') && filterState.regulations.size > 0) {
      let matchReg = false;

      for (const val of filterState.regulations) {
        if (val === 'legal_size' && fish.regulations.legalSizeCm !== null) matchReg = true;
        else if (val === 'bag_limit') {
          const bl = (fish.regulations.bagLimit || '').toLowerCase();
          if (bl && !bl.includes('aucun') && !bl.includes('illimité') && !bl.includes('non soumis') && !bl.includes('raisonné') && !bl.includes('modéré')) matchReg = true;
        } else if (val === 'closed_season') {
          const cs = (fish.regulations.closedSeason || '').toLowerCase();
          if (cs && !cs.includes('aucune') && !cs.includes('toute l\'année')) matchReg = true;
        } else if (val === 'no_kill') {
          const str = JSON.stringify(fish).toLowerCase();
          if (str.includes('no-kill') || str.includes('relâcher') || str.includes('graciation')) matchReg = true;
        }
      }
      matches.regulation = matchReg;
    }

    // 5. Months (OR entre mois sélectionnés)
    if (!filterState.months.has('all') && filterState.months.size > 0) {
      let matchMonth = false;

      for (const val of filterState.months) {
        const mIdx = parseInt(val, 10) - 1;
        const canalScore = fish.calendar?.canal?.[mIdx] || 0;
        const boatScore = fish.calendar?.bateau?.[mIdx] || 0;
        if (canalScore >= 1 || boatScore >= 1) matchMonth = true;
      }
      matches.month = matchMonth;
    }

    // 6. Recherche texte / Regex
    if (filterState.searchTerm) {
      if (regexError) {
        matches.search = false;
      } else {
        const searchPool = [
          fish.identity.name,
          fish.identity.scientificName,
          ...(fish.identity.localNames || []),
          fish.identity.family,
          fish.identity.category,
          fish.canal?.terminalTackle?.rigidLure,
          fish.canal?.terminalTackle?.softLure,
          fish.canal?.terminalTackle?.naturalLure,
          fish.bateau?.terminalTackle?.rigidLure,
          fish.bateau?.terminalTackle?.softLure,
          fish.bateau?.terminalTackle?.naturalLure
        ].filter(Boolean).join(' ');

        if (filterState.isRegexMode) {
          matches.search = regexObj.test(searchPool);
        } else {
          matches.search = searchPool.toLowerCase().includes(filterState.searchTerm.toLowerCase());
        }
      }
    }

    const activeKeys = Object.keys(matches);
    if (activeKeys.length === 0) return true;

    if (filterState.combinationMode === 'OR') {
      return activeKeys.some(key => matches[key] === true);
    }
    return activeKeys.every(key => matches[key] === true);
  });
}

// --------------------------------------------------------------------------
// MOTEUR DE RENDU & BARRE DE FILTRES ACTIFS
// --------------------------------------------------------------------------

function renderActiveFiltersBar() {
  const bar = document.getElementById('active-filters-bar');
  const resetBtn = document.getElementById('btn-reset-filters');
  const resetLabel = document.getElementById('reset-filters-label');
  if (!bar) return;

  const activeFilters = [];

  if (!filterState.categories.has('all') && filterState.categories.size > 0) {
    const catList = Array.from(filterState.categories).join(', ');
    activeFilters.push({ key: 'category', label: `Catégorie : ${catList}` });
  }

  if (!filterState.biotopes.has('all') && filterState.biotopes.size > 0) {
    const bioList = Array.from(filterState.biotopes).map(v => MULTISELECT_LABELS.biotope[v] || v).join(', ');
    activeFilters.push({ key: 'biotope', label: `Biotope : ${bioList}` });
  }

  if (!filterState.permits.has('all') && filterState.permits.size > 0) {
    const permitList = Array.from(filterState.permits).map(v => MULTISELECT_LABELS.permit[v] || v).join(', ');
    activeFilters.push({ key: 'permit', label: `Régime : ${permitList}` });
  }

  if (!filterState.regulations.has('all') && filterState.regulations.size > 0) {
    const regList = Array.from(filterState.regulations).map(v => MULTISELECT_LABELS.regulation[v] || v).join(', ');
    activeFilters.push({ key: 'regulation', label: `Règlement : ${regList}` });
  }

  if (!filterState.months.has('all') && filterState.months.size > 0) {
    const monthList = Array.from(filterState.months).map(v => MULTISELECT_LABELS.month[v] || v).join(', ');
    activeFilters.push({ key: 'month', label: `Actif en : ${monthList}` });
  }

  if (filterState.searchTerm) {
    const modeLabel = filterState.isRegexMode ? 'Regex' : 'Recherche';
    activeFilters.push({ key: 'search', label: `${modeLabel} : "${filterState.searchTerm}"` });
  }

  if (activeFilters.length > 0) {
    if (filterState.combinationMode === 'OR') {
      activeFilters.unshift({ key: 'mode', label: 'Combinaison : OU (Au moins 1 critère)' });
    }

    bar.hidden = false;
    bar.innerHTML = activeFilters.map(f => `
      <span class="active-filter-tag ${f.key === 'mode' ? 'tag-mode' : ''}">
        <span>${f.label}</span>
        ${f.key !== 'mode' ? `<button type="button" class="active-filter-remove" data-key="${f.key}" title="Supprimer ce filtre" aria-label="Supprimer le filtre ${f.label}">×</button>` : ''}
      </span>
    `).join('');

    if (resetBtn) {
      resetBtn.hidden = false;
      const count = activeFilters.length - (filterState.combinationMode === 'OR' ? 1 : 0);
      if (resetLabel) resetLabel.textContent = `Effacer les filtres (${count})`;
    }
  } else {
    bar.hidden = true;
    bar.innerHTML = '';
    if (resetBtn) resetBtn.hidden = true;
    if (resetLabel) resetLabel.textContent = 'Effacer les filtres';
  }
}

function renderApp() {
  const currentFilterBiotopeForView = filterState.biotopes.has('all') ? 'all' : Array.from(filterState.biotopes)[0];
  const speciesList = getFilteredSpecies();
  renderActiveFiltersBar();

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
    renderDuoView(speciesList, currentFilterBiotopeForView);
    setupScrollObserver();
  } else if (currentViewMode === 'flip') {
    renderFlipView(speciesList, currentFilterBiotopeForView);
    setupScrollObserver();
  } else {
    renderPrintView(speciesList, currentFilterBiotopeForView);
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

export function switchCardTab(fishId, tab, e) {
  if (e) e.stopPropagation();
  const card = document.getElementById(`card-${fishId}`);
  if (!card) return;

  const isMono = tab === 'tactique' || tab === 'carte';
  const switcher = card.querySelector(isMono ? '.mono-card-switcher' : '.biotope-card-switcher:not(.mono-card-switcher)');
  if (switcher) {
    switcher.querySelectorAll('.biotope-switch-btn').forEach(btn => {
      const isActive = btn.dataset.tab === tab;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  if (isMono) {
    card.querySelector('.biotope-section')?.classList.toggle('tab-hidden', tab !== 'tactique');
    card.querySelector('.mono-map-wrap')?.classList.toggle('tab-hidden', tab !== 'carte');
  } else {
    card.querySelector('.section-canal')?.classList.toggle('tab-hidden', tab !== 'canal');
    card.querySelector('.section-bateau')?.classList.toggle('tab-hidden', tab !== 'bateau');
  }
}

window.switchCardTab = switchCardTab;
window.switchCardBiotope = (e, fishId, tab) => switchCardTab(fishId, tab, e);
window.switchMonoCardTab = (e, fishId, tab) => switchCardTab(fishId, tab, e);

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
      }, 2000);
      return;
    }

    // 2. Clic sur une carte de waypoint pour centrer
    const spotCard = e.target.closest('.waypoint-card');
    if (spotCard && !e.target.closest('.btn-copy-coords')) {
      const spotId = spotCard.dataset.spotId;
      const parentCard = spotCard.closest('.duo-card-shell, .interactive-card');
      if (parentCard && spotId) {
        highlightMapMarker(parentCard, spotId);
      }
    }
  });
}

function fallbackCopyText(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.warn('Erreur lors de la copie de secours', err);
  }
  document.body.removeChild(textArea);
}

function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'app-toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  if (window._toastTimeout) clearTimeout(window._toastTimeout);
  window._toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

function highlightMapMarker(cardEl, spotId) {
  const pins = cardEl.querySelectorAll(`.map-pin[data-spot-id="${spotId}"]`);
  pins.forEach(pin => {
    pin.classList.add('ping-active');
    setTimeout(() => pin.classList.remove('ping-active'), 1800);
  });
}

// Initialisation au chargement du DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}