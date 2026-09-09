import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseTwelfths,
  parseCoefficients,
  formatWindCondition,
  parseLengths,
  getHarvestGauge,
  requiresPermit,
  getPermitInfo
} from '../../site/js/parsers.js';

test('parseTwelfths - parses H3 à H4 correctly', () => {
  const res = parseTwelfths('Pêche optimale de H3 à H4 pendant le jusant');
  assert.deepEqual(res.hours, [false, false, true, true, false, false]);
  assert.equal(res.hoursStr, 'H3 • H4');
  assert.equal(res.flow, 'Mi-marée (Courant max)');
});

test('parseTwelfths - parses single H1 and H6 correctly', () => {
  const res = parseTwelfths('Actif aux étales H1 et H6');
  assert.deepEqual(res.hours, [true, false, false, false, false, true]);
  assert.equal(res.hoursStr, 'H1 • H6');
  assert.equal(res.flow, 'Étales (Courant faible/nul)');
});

test('parseCoefficients - handles range and all coefficients', () => {
  const c1 = parseCoefficients('Tous coefficients de marée');
  assert.equal(c1.isAll, true);
  assert.equal(c1.min, 20);
  assert.equal(c1.max, 120);

  const c2 = parseCoefficients('Coefficients de 45 à 85');
  assert.equal(c2.isAll, false);
  assert.equal(c2.min, 45);
  assert.equal(c2.max, 85);
  assert.match(c2.label, /45-85/);
});

test('formatWindCondition - categorizes wind conditions', () => {
  assert.equal(formatWindCondition('Secteur Sud-Ouest par vent de terre').badge, 'Vent de terre (S/SO)');
  assert.equal(formatWindCondition('Brise d\'Est modérée').badge, 'Brise d\'Est');
  assert.equal(formatWindCondition('Vent faible et mer calme').badge, 'Vent faible / Mer calme');
});

test('parseLengths - calculates percentages relative to max record', () => {
  const res = parseLengths('40 à 60 cm', '100 cm');
  assert.equal(res.minAvg, 40);
  assert.equal(res.maxAvg, 60);
  assert.equal(res.maxVal, 100);
  assert.equal(res.minPercent, 40);
  assert.equal(res.maxPercent, 60);
});

test('getHarvestGauge - legal quotas and bag limits', () => {
  assert.equal(getHarvestGauge('2 bars par jour par pêcheur', 'bar-commun').shortLabel, '2 / jour');
  assert.equal(getHarvestGauge('2 lieux par jour par pêcheur', 'lieu-jaune').shortLabel, '2 / jour');
  assert.equal(getHarvestGauge('No-kill obligatoire', 'bar-commun').shortLabel, 'No-Kill');
  assert.equal(getHarvestGauge('Prélèvement non soumis à quota', 'gardon-commun').shortLabel, 'Libre');
});

test('requiresPermit - identifies freshwater and AAPPMA permit requirements', () => {
  const freshwaterFish = {
    identity: { category: 'Carnassier eau douce / saumâtre' },
    regulations: { specialRules: ['Carte AAPPMA obligatoire'] }
  };
  assert.equal(requiresPermit(freshwaterFish), true);

  const cyprinid = {
    identity: { category: 'Cyprinidé / Poisson blanc' },
    regulations: { specialRules: [] }
  };
  assert.equal(requiresPermit(cyprinid), true);

  const marineFish = {
    identity: { category: 'Carnassier marin' },
    regulations: { specialRules: ['Pêche libre en aval du Pont de la Fonderie (DPM maritime sans carte fédérale)'] }
  };
  assert.equal(requiresPermit(marineFish), false);
});

test('getPermitInfo - provides detailed permit status for DPM and Bassin St-Pierre', () => {
  const sandre = {
    identity: { category: 'Carnassier eau douce / saumâtre' },
    regulations: { specialRules: ['Bassin Saint-Pierre (en amont du Pont de la Fonderie) : Carte de pêche AAPPMA obligatoire (eau douce)'] }
  };
  const infoSandre = getPermitInfo(sandre);
  assert.equal(infoSandre.dpmFree, true);
  assert.equal(infoSandre.requiresAAPPMAInBassin, true);
  assert.equal(infoSandre.badgeLabel, 'AAPPMA si Bassin St-Pierre');

  const bar = {
    identity: { category: 'Carnassier marin' },
    regulations: { specialRules: ['Pêche libre en aval du Pont de la Fonderie (DPM maritime sans carte fédérale)'] }
  };
  const infoBar = getPermitInfo(bar);
  assert.equal(infoBar.dpmFree, true);
  assert.equal(infoBar.requiresAAPPMAInBassin, false);
  assert.equal(infoBar.badgeLabel, 'Pêche libre DPM');
});
