// ==========================================================================
// CONTRÔLEUR DE THÈMES DYNAMIQUES & MODE JOUR/NUIT
// ==========================================================================

export const STORAGE_KEY_THEME = 'peche-theme-universe';
export const STORAGE_KEY_MODE = 'peche-theme-mode';

export const THEME_DEFINITIONS = {
  archief: {
    label: 'Archief',
    name: 'Archief',
    color: '#000000'
  },
  deschool: {
    label: 'De School',
    name: 'De School Brutalist',
    color: '#e05344'
  },
  estran: {
    label: 'Varech',
    name: 'Estran & Varech',
    color: '#047857'
  },
  epaves: {
    label: 'Rouille',
    name: 'Épaves & Rouille',
    color: '#c2410c'
  },
  dune: {
    label: 'Ocre',
    name: 'Dune & Calcaire',
    color: '#b45309'
  },
  carbon: {
    label: 'Sondeur',
    name: 'Carbone Sondeur',
    color: '#65a30d'
  },
  shom: {
    label: 'SHOM',
    name: 'Carte SHOM',
    color: '#1d4ed8'
  },
  beton: {
    label: 'Béton',
    name: 'Béton Brut',
    color: '#525252'
  },
  krant: {
    label: 'Journal',
    name: 'Journal & Fanzine',
    color: '#171717'
  },
  kraft: {
    label: 'Kraft',
    name: 'Carton Kraft',
    color: '#78350f'
  },
  asfalt: {
    label: 'Bitume',
    name: 'Bitume & Craie',
    color: '#0a0a0a'
  },
  staal: {
    label: 'Acier',
    name: 'Acier & Poutres',
    color: '#334155'
  }
};

export const THEME_OPTIONS = [
  { val: 'archief', name: 'Archief', desc: 'Brutalisme Minimaliste • Papier & Zwart', swatches: ['#000000', '#ffffff', '#f9f6ef'] },
  { val: 'deschool', name: 'De School Brutalist', desc: 'Grille Blueprint • Industrial & Ticket Red', swatches: ['#e05344', '#000000', '#f4f1ea'] },
  { val: 'estran', name: 'Estran & Varech', desc: 'Vert Risographe • Laminaires & Estran', swatches: ['#047857', '#10b981', '#f5f8f5'] },
  { val: 'epaves', name: 'Épaves & Rouille', desc: 'Terracotta 1944 • Acier Brut & Brique', swatches: ['#c2410c', '#fb923c', '#fbf7f4'] },
  { val: 'dune', name: 'Dune & Calcaire', desc: 'Ocre Sable • Plages de Nacre', swatches: ['#b45309', '#d97706', '#fbf9f2'] },
  { val: 'carbon', name: 'Carbone Sondeur', desc: 'Monochrome Tactique • Écran Sondeur', swatches: ['#65a30d', '#a3e635', '#f7f7f5'] },
  { val: 'shom', name: 'Carte SHOM', desc: 'Bleu Hydrographique • Bathymétrie & Sondes', swatches: ['#1d4ed8', '#3b82f6', '#f4f6fa'] },
  { val: 'beton', name: 'Béton Brut', desc: 'Gris Ouvrages Portuaires • Écluses & Quais', swatches: ['#525252', '#737373', '#edece8'] },
  { val: 'krant', name: 'Journal & Fanzine', desc: 'Périodique & Gazette • Typographie Presse', swatches: ['#171717', '#404040', '#f2efe9'] },
  { val: 'kraft', name: 'Carton Kraft', desc: 'Emballage Technique • Fibre & Pâte Brute', swatches: ['#78350f', '#b45309', '#ece2ce'] },
  { val: 'asfalt', name: 'Bitume & Craie', desc: 'Enrochement Noir • Encre & Asphalte', swatches: ['#0a0a0a', '#262626', '#e5e5e5'] },
  { val: 'staal', name: 'Acier & Poutres', desc: 'Gris Métal Brossé • Ponts & Armatures', swatches: ['#334155', '#475569', '#e8ecf0'] }
];

export function renderThemeOptions() {
  const grid = document.getElementById('theme-universes-grid');
  if (!grid) return;
  grid.innerHTML = THEME_OPTIONS.map(t => `
    <button type="button" class="theme-opt-btn" data-theme-val="${t.val}" role="radio" aria-checked="false">
      <span class="theme-opt-swatches">
        ${t.swatches.map(c => `<span class="theme-swatch" style="background: ${c};${c === '#ffffff' || c.startsWith('#f') || c.startsWith('#e') ? ' border: 1px solid #737373;' : ''}"></span>`).join('')}
      </span>
      <span class="theme-opt-info">
        <span class="theme-opt-name">${t.name}</span>
        <span class="theme-opt-desc">${t.desc}</span>
      </span>
    </button>
  `).join('');
}

export const MODE_ICONS = {
  light: `<svg class="ui-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  dark: `<svg class="ui-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
};

export let currentThemeUniverse = 'staal';
export let currentThemeMode = 'light';

export function initThemeController() {
  let savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
  const savedMode = localStorage.getItem(STORAGE_KEY_MODE);

  // Initialisation par défaut sur Staal
  const SEEN_STAAL_KEY = 'peche-seen-staal-default-v1';
  if (!localStorage.getItem(SEEN_STAAL_KEY)) {
    try {
      localStorage.setItem(SEEN_STAAL_KEY, '1');
      localStorage.setItem(STORAGE_KEY_THEME, 'staal');
    } catch (e) {}
    savedTheme = 'staal';
  }

  // Migration de l'ancien thème 'tactical'
  if (savedTheme === 'tactical') {
    savedTheme = 'carbon';
  }

  if (savedTheme && THEME_DEFINITIONS[savedTheme]) {
    currentThemeUniverse = savedTheme;
  } else {
    currentThemeUniverse = 'staal';
  }

  if (savedMode === 'light' || savedMode === 'dark') {
    currentThemeMode = savedMode;
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    currentThemeMode = 'dark';
  } else {
    currentThemeMode = 'light';
  }

  renderThemeOptions();

  applyTheme(currentThemeUniverse, currentThemeMode, false);

  const triggerBtn = document.getElementById('btn-theme-trigger');
  const popover = document.getElementById('theme-popover');
  if (!triggerBtn || !popover) return;

  // Ouvrir / Fermer le popover
  triggerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = triggerBtn.getAttribute('aria-expanded') === 'true';
    setThemePopoverOpen(!isExpanded);
  });

  // Sélection d'univers
  popover.querySelectorAll('.theme-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const themeVal = btn.dataset.themeVal;
      if (themeVal && THEME_DEFINITIONS[themeVal]) {
        currentThemeUniverse = themeVal;
        applyTheme(currentThemeUniverse, currentThemeMode, true);
      }
    });
  });

  // Sélection du mode Jour/Nuit
  popover.querySelectorAll('.mode-switch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modeVal = btn.dataset.modeVal;
      if (modeVal === 'light' || modeVal === 'dark') {
        currentThemeMode = modeVal;
        applyTheme(currentThemeUniverse, currentThemeMode, true);
      }
    });
  });

  // Fermeture clic extérieur
  document.addEventListener('click', (e) => {
    if (!popover.hidden && !popover.contains(e.target) && !triggerBtn.contains(e.target)) {
      setThemePopoverOpen(false);
    }
  });

  // Fermeture touche Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !popover.hidden) {
      setThemePopoverOpen(false);
      triggerBtn.focus();
    }
  });
}

export function setThemePopoverOpen(isOpen) {
  const triggerBtn = document.getElementById('btn-theme-trigger');
  const popover = document.getElementById('theme-popover');
  if (!triggerBtn || !popover) return;

  if (isOpen) {
    popover.removeAttribute('hidden');
    triggerBtn.setAttribute('aria-expanded', 'true');
  } else {
    popover.setAttribute('hidden', '');
    triggerBtn.setAttribute('aria-expanded', 'false');
  }
}

export function applyTheme(theme, mode, persist = true) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-mode', mode);

  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
      localStorage.setItem(STORAGE_KEY_MODE, mode);
    } catch (err) {
      console.warn('Impossible de persister le thème dans localStorage', err);
    }
  }

  // Mettre à jour les éléments de déclencheur
  const labelEl = document.getElementById('theme-trigger-label');
  const dotEl = document.getElementById('theme-trigger-dot');
  const modeIconEl = document.getElementById('theme-trigger-mode-icon');

  const themeMeta = THEME_DEFINITIONS[theme] || THEME_DEFINITIONS.staal;

  if (labelEl) {
    labelEl.textContent = themeMeta.label;
  }
  if (dotEl) {
    dotEl.style.backgroundColor = themeMeta.color;
    dotEl.style.boxShadow = 'none';
  }
  if (modeIconEl) {
    modeIconEl.innerHTML = MODE_ICONS[mode] || MODE_ICONS.light;
  }

  // Mettre à jour les boutons dans le popover
  const popover = document.getElementById('theme-popover');
  if (popover) {
    popover.querySelectorAll('.theme-opt-btn').forEach(btn => {
      const isActive = btn.dataset.themeVal === theme;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });

    popover.querySelectorAll('.mode-switch-btn').forEach(btn => {
      const isActive = btn.dataset.modeVal === mode;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });
  }
}
