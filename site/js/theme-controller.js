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
    label: 'Archief',
    name: 'Archief',
    color: '#000000'
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

  // Migration de l'ancien token 'deschool' vers 'archief'
  if (savedTheme === 'deschool') {
    savedTheme = 'archief';
    try {
      localStorage.setItem(STORAGE_KEY_THEME, 'archief');
    } catch (e) {}
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
