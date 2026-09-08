// ==========================================================================
// CALCULS HALIEUTIQUES, GAUGES VISUELLES & FORMATTEURS DE DONNÉES
// ==========================================================================

import { uiIcon } from './icons.js';

export function parseTwelfths(text) {
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

export function renderTwelfthsGauge(ruleOfTwelfthsText) {
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

export function parseCoefficients(text) {
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

export function formatWindCondition(text) {
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

export function renderTideAndWeather(coefText, windText) {
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

export function renderCanalTriggers(ecluseText, lightText) {
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

export function parseLengths(avgStr = '', maxStr = '') {
  const maxVal = parseInt((maxStr.match(/\d+/) || [100])[0], 10);
  const range = avgStr.match(/(\d+)\s*(?:-|à)\s*(\d+)/);
  const single = avgStr.match(/\d+/);

  const minAvg = range ? +range[1] : (single ? +single[0] : 0);
  const maxAvg = range ? +range[2] : minAvg;

  const toPct = (val) => Math.max(0, Math.min(100, Math.round((val / maxVal) * 100)));
  return { minAvg, maxAvg, maxVal, minPercent: toPct(minAvg), maxPercent: toPct(maxAvg) };
}

export function renderMorphologyGauge(biology) {
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

export function renderExhaustiveTackleBlock(terminal, combo, biotopeLabel, biotopeKey) {
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
          <span class="terminal-pill pill-leader">BDL</span>
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

export const HARVEST_RULES = [
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

export const DEFAULT_HARVEST_GAUGE = { pct: 80, color: 'green', shortLabel: 'Raisonné', desc: 'Prélèvement raisonné' };

export function getHarvestGauge(bagLimit, speciesId) {
  const text = (bagLimit || '').toLowerCase();
  const rule = HARVEST_RULES.find(r => r.match(text, speciesId));
  return rule ? { pct: rule.pct, color: rule.color, shortLabel: rule.shortLabel, desc: rule.desc } : DEFAULT_HARVEST_GAUGE;
}

export function renderHarvestPill(bagLimit, speciesId) {
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
