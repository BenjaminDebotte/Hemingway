// ==========================================================================
// REGISTRE CENTRALISÉ DES SPOTS & COORDONNÉES GPS HALIEUTIQUES (NORMANDIE)
// ==========================================================================
// Standards géodésiques WGS84 :
// - Format Marin / Sondeur traceur : DD° MM.MMM' (Garmin, Humminbird, Navionics, Lowrance)
// - Format Mobile / Décimal : DD.DDDDD, DD.DDDDD (Google Maps, OsmAnd, Geoportail)

export function formatNautical(lat, lon) {
  const latDeg = Math.floor(Math.abs(lat));
  const latMin = ((Math.abs(lat) - latDeg) * 60).toFixed(3);
  const latDir = lat >= 0 ? 'N' : 'S';
  const latStr = `${latDeg}° ${latMin.padStart(6, '0')}' ${latDir}`;

  const lonDeg = Math.floor(Math.abs(lon));
  const lonMin = ((Math.abs(lon) - lonDeg) * 60).toFixed(3);
  const lonDir = lon >= 0 ? 'E' : 'W';
  const lonStr = `${String(lonDeg).padStart(3, '0')}° ${lonMin.padStart(6, '0')}' ${lonDir}`;

  return `${latStr} · ${lonStr}`;
}

export function formatDecimal(lat, lon) {
  return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
}

export function getGoogleMapsUrl(lat, lon) {
  return `https://www.google.com/maps/search/?api=1&query=${lat.toFixed(5)},${lon.toFixed(5)}`;
}

export const SPOTS_REGISTRY = [
  // --- SECTEUR CANAL DE CAEN À LA MER (14 km) ---
  {
    id: 'bassin-st-pierre',
    name: 'Bassin Saint-Pierre (Caen)',
    shortName: 'Bassin St-Pierre',
    zone: 'canal',
    icon: 'permit',
    pos: [49.1838, -0.3561],
    depth: 'Prof. 4–5 m • km 0',
    typeLabel: 'Eaux douces AAPPMA',
    tip: 'Bassin urbain à flot, amont Pont Fonderie (carte fédérale obligatoire). Postes de bordures, pontons et seuils pour perche, sandre et mulet.',
    speciesIds: ['perche-commune', 'sandre', 'brochet', 'carpe-commune', 'gardon-commun', 'breme-commune', 'mulet-lippu', 'anguille-europe', 'ablette-commune', 'tanche'],
    canalPos: { left: 8.9, top: 94.7 },
    regPos: { left: 43.3, top: 93.8 }
  },
  {
    id: 'pont-fonderie',
    name: 'Pont de la Fonderie (Caen)',
    shortName: 'Pont Fonderie',
    zone: 'canal',
    icon: 'dpm',
    pos: [49.1834, -0.3518],
    depth: 'Frontière DPM • km 0.4',
    typeLabel: 'Limite Maritime DPM',
    tip: 'Frontière juridique entre le domaine fluvial et maritime DPM. Piles maçonnées, seuils sous-marins et zone de tenue du silure et des bancs de blancs.',
    speciesIds: ['silure-glane', 'sandre', 'perche-commune', 'anguille-europe', 'carpe-commune', 'breme-commune', 'flet-commun'],
    canalPos: { left: 12.2, top: 95.1 },
    regPos: null
  },
  {
    id: 'viaduc-calix',
    name: 'Viaduc de Calix (Hérouville)',
    shortName: 'Viaduc de Calix',
    zone: 'canal',
    icon: 'bridge',
    pos: [49.1866, -0.3293],
    depth: 'Prof. 6–8 m • km 2.5',
    typeLabel: 'Enrochements & Piles',
    tip: 'Enrochements immergés massifs et piles monumentales. Rupture de pente majeure, ombrage diurne et cônes lumineux nocturnes (bars, sandres record).',
    speciesIds: ['bar-commun', 'bar-mouchete', 'sandre', 'perche-commune', 'silure-glane', 'anguille-europe', 'truite-de-mer', 'flet-commun'],
    canalPos: { left: 29.1, top: 92.2 },
    regPos: { left: 54.5, top: 92.3 }
  },
  {
    id: 'quais-colombelles',
    name: 'Quais de Colombelles',
    shortName: 'Quais Colombelles',
    zone: 'canal',
    icon: 'quay',
    pos: [49.2085, -0.3090],
    depth: 'Prof. 7–8 m • km 4.5',
    typeLabel: 'Palplanches darses',
    tip: 'Lignes droites bordées de palplanches métalliques profondes. Dérives verticales au leurre souple et postes d\'affût pour percidés et poissons plats.',
    speciesIds: ['sandre', 'perche-commune', 'flet-commun', 'bar-commun', 'anguille-europe', 'alose-feinte'],
    canalPos: { left: 44.4, top: 72.3 },
    regPos: null
  },
  {
    id: 'cale-blainville',
    name: 'Darse & Cale de Blainville',
    shortName: 'Cale Blainville',
    zone: 'canal',
    icon: 'slipway',
    pos: [49.2215, -0.3020],
    depth: 'Prof. 7–9 m • km 7.5',
    typeLabel: 'Fosse portuaire',
    tip: 'Bassin commercial, darses draguées sabliers/ferraille. Cale de slipway et rupture de courant créant une zone de repli hivernal pour carnassiers.',
    speciesIds: ['sandre', 'brochet', 'bar-commun', 'perche-commune', 'silure-glane', 'carpe-commune', 'anguille-europe'],
    canalPos: { left: 49.6, top: 60.5 },
    regPos: null
  },
  {
    id: 'pont-pegasus',
    name: 'Pont Pegasus (Bénouville)',
    shortName: 'Pegasus Bridge',
    zone: 'canal',
    icon: 'bridge',
    pos: [49.2420, -0.2745],
    depth: 'Prof. 6–7 m • km 10.5',
    typeLabel: 'Étranglement de courant',
    tip: 'Goulot d\'étranglement hydraulique majeur. Courant puissant décuplé aux éclusées. Chasses violentes de bars francs sous les lampadaires nocturnes.',
    speciesIds: ['bar-commun', 'bar-mouchete', 'truite-de-mer', 'alose-feinte', 'sandre', 'mulet-lippu', 'anguille-europe'],
    canalPos: { left: 70.3, top: 41.8 },
    regPos: { left: 77.3, top: 63.2 }
  },
  {
    id: 'ecluses-ouistreham',
    name: 'Écluses d\'Ouistreham (Sas & Mer)',
    shortName: 'Écluses Ouistreham',
    zone: 'canal',
    icon: 'locks',
    pos: [49.2803, -0.2491],
    depth: 'Prof. 7–9 m • km 14',
    typeLabel: 'Sas maritime DPM',
    tip: 'Porte d\'entrée maritime du canal. Remplissage des sas générant un puissant appel d\'eau salée oxygénée. Zone de concentration maximale de daurades et bars.',
    speciesIds: ['bar-commun', 'daurade-royale', 'mulet-lippu', 'mulet-dore', 'mulet-porc', 'flet-commun', 'seiche-commune', 'calamar-commun', 'truite-de-mer', 'alose-feinte'],
    canalPos: { left: 89.4, top: 7.0 },
    regPos: { left: 87.9, top: 43.0 }
  },

  // --- SECTEUR CÔTE DE NACRE EN BATEAU ---
  {
    id: 'cale-courseulles',
    name: 'Cale de Courseulles-sur-Mer',
    shortName: 'Cale Courseulles',
    zone: 'bateau',
    icon: 'slipway',
    pos: [49.3360, -0.4570],
    depth: 'Avant-port & Cale',
    typeLabel: 'Cale slipway abritée',
    tip: 'Cale de mise à l\'eau Juno Beach protégée de la houle, musoir de jetée ouest et chenal rocheux. Accès immédiat aux Roches occidentales.',
    speciesIds: ['bar-commun', 'daurade-royale', 'daurade-grise', 'seiche-commune', 'calamar-commun', 'maquereau-commun', 'orphie'],
    merPos: { left: 5.2, top: 30.5 },
    regPos: { left: 1.3, top: 13.7 }
  },
  {
    id: 'ridens-bernieres',
    name: 'Ridens & Bancs de Bernières',
    shortName: 'Ridens Bernières',
    zone: 'bateau',
    icon: 'sandbank',
    pos: [49.3500, -0.4150],
    depth: 'Prof. 8–14 m • Ridens sable',
    typeLabel: 'Ondulations de fond sableux',
    tip: 'Bancs de sable coquillier et ridens sous-marins. Dérives idéales en mort manié ou train de plumes pour poissons plats, soles, turbots et daurades.',
    speciesIds: ['sole-commune', 'turbot', 'plie-commune', 'daurade-royale', 'daurade-grise', 'flet-commun', 'bar-commun', 'maquereau-commun'],
    merPos: { left: 22.0, top: 15.8 },
    regPos: null
  },
  {
    id: 'roches-calvados',
    name: 'Plateau des Roches du Calvados',
    shortName: 'Roches Calvados',
    zone: 'bateau',
    icon: 'reef',
    pos: [49.3580, -0.3600],
    depth: 'Prof. 6–15 m • Platiers & failles',
    typeLabel: 'Récif calcaire tabulaire',
    tip: 'Plateau rocheux calcaire mythique de 15 milles. Tombants, champs de laminaires et failles. Le spot roi au leurre de surface pour bars francs et gros lieus.',
    speciesIds: ['bar-commun', 'bar-mouchete', 'lieu-jaune', 'vieille-commune', 'congre-europe', 'maquereau-commun', 'orphie', 'daurade-grise'],
    merPos: { left: 44.0, top: 7.4 },
    regPos: { left: 41.7, top: 2.1 }
  },
  {
    id: 'jetee-luc',
    name: 'Jetée & Platiers de Luc-sur-Mer',
    shortName: 'Jetée de Luc',
    zone: 'bateau',
    icon: 'pier',
    pos: [49.3183, -0.3473],
    depth: 'Prof. 3–8 m • Estran rocheux',
    typeLabel: 'Estran mixte roche & sable',
    tip: 'Prolongement sous-marin de la jetée de Luc. Platiers découvrants, couloirs de dérive pour la seiche à la turlutte et chasses côtières d\'orphies et bars.',
    speciesIds: ['seiche-commune', 'calamar-commun', 'bar-commun', 'orphie', 'daurade-grise', 'vieille-commune', 'mulet-dore'],
    merPos: { left: 49.1, top: 49.2 },
    regPos: { left: 47.0, top: 23.0 }
  },
  {
    id: 'lion-sur-mer',
    name: 'Bancs & Récifs de Lion-sur-Mer',
    shortName: 'Récifs de Lion',
    zone: 'bateau',
    icon: 'reef',
    pos: [49.3030, -0.3160],
    depth: 'Prof. 5–10 m • Fonds mixtes',
    typeLabel: 'Récifs côtiers & sables',
    tip: 'Alternance de sables coquilliers et têtes de roches isolées. Excellente zone de mi-marée pour daurades grises, bars mouchetés et orphies en traîne.',
    speciesIds: ['daurade-grise', 'bar-mouchete', 'bar-commun', 'orphie', 'maquereau-commun', 'seiche-commune', 'plie-commune'],
    merPos: { left: 61.6, top: 65.3 },
    regPos: { left: 60.0, top: 31.1 }
  },
  {
    id: 'hermanville',
    name: 'Bancs de sable d\'Hermanville',
    shortName: 'Bancs Hermanville',
    zone: 'bateau',
    icon: 'sandbank',
    pos: [49.2940, -0.2980],
    depth: 'Prof. 6–12 m • Sables fins',
    typeLabel: 'Bancs meubles & ridens',
    tip: 'Fonds de sable pur et couloirs de vers arénicoles. Postes de prédilection pour la sole à la calée nocturne et le turbot en dérive lente au lançon frais.',
    speciesIds: ['sole-commune', 'turbot', 'plie-commune', 'flet-commun', 'maquereau-commun', 'merlan'],
    merPos: { left: 68.8, top: 74.7 },
    regPos: { left: 67.5, top: 35.8 }
  },
  {
    id: 'epave-courbet',
    name: 'Épave Cuirassé Courbet (1944)',
    shortName: 'Épave Courbet',
    zone: 'bateau',
    icon: 'wreck',
    pos: [49.3250, -0.2800],
    depth: 'Prof. 12–18 m • Épave D-Day Sword',
    typeLabel: 'Cuirassé 23 000 t coulé 1944',
    tip: 'Brise-lames Gooseberry 5 au large de Sword Beach. Écosystème sous-marin colossal : tanière à très gros congres, bancs de lieus jaunes, tacauds et bars.',
    speciesIds: ['lieu-jaune', 'congre-europe', 'tacaud', 'merlan', 'bar-commun', 'vieille-commune'],
    merPos: { left: 76.0, top: 42.1 },
    regPos: null
  },
  {
    id: 'ouistreham-riva-bella',
    name: 'Avant-Port & Cale d\'Ouistreham',
    shortName: 'Cale Ouistreham',
    zone: 'bateau',
    icon: 'slipway',
    pos: [49.2880, -0.2520],
    depth: 'Prof. 4–8 m • Estuaire & Jetée',
    typeLabel: 'Cale slipway maritime DPM',
    tip: 'Cale de mise à l\'eau principale de Riva-Bella, musoir de jetée ouest. Confluence du canal et de la baie de Seine, poste de rentrée des dorades et bars.',
    speciesIds: ['bar-commun', 'daurade-royale', 'mulet-lippu', 'mulet-dore', 'seiche-commune', 'calamar-commun', 'flet-commun'],
    merPos: { left: 87.2, top: 81.1 },
    regPos: null
  },
  {
    id: 'epave-susan-anthony',
    name: 'Épave USS Susan B. Anthony',
    shortName: 'Épave Susan Anthony',
    zone: 'bateau',
    icon: 'wreck',
    pos: [49.4905, -0.7145],
    depth: 'Prof. 28–34 m • Épave hauturier',
    typeLabel: 'Transport de troupes 150m (Large)',
    tip: 'Grande épave du large en Baie de Seine. Spot de référence pour les gros lieus jaunes au jig lourd (respect strict fermeture biologique 01/01-30/04).',
    speciesIds: ['lieu-jaune', 'congre-europe', 'tacaud'],
    merPos: null,
    regPos: null
  }
];

// Enrichissement avec chaînes formatées et URLs Maps
SPOTS_REGISTRY.forEach(s => {
  s.nautical = formatNautical(s.pos[0], s.pos[1]);
  s.decimal = formatDecimal(s.pos[0], s.pos[1]);
  s.mapsUrl = getGoogleMapsUrl(s.pos[0], s.pos[1]);
});

/**
 * Récupère les 2 ou 3 spots les plus pertinents pour une espèce donnée
 */
export function getSpotsForFish(fish, max = 3, zone = null) {
  const fishId = fish.id;
  const isCanalOnly = fish.canal.present && !fish.bateau.present;
  const isBateauOnly = fish.bateau.present && !fish.canal.present;

  // 1. Filtrer selon la zone demandée ou le biotope de l'espèce
  let candidateSpots = SPOTS_REGISTRY.filter(spot => {
    if (zone) return spot.zone === zone;
    if (isCanalOnly) return spot.zone === 'canal';
    if (isBateauOnly) return spot.zone === 'bateau';
    return true; // Dual biotope
  });

  // 2. Scorer les spots
  const scored = candidateSpots.map(spot => {
    let score = 0;
    // Correspondance explicite avec l'ID du poisson
    if (spot.speciesIds && spot.speciesIds.includes(fishId)) {
      score += 10;
    }
    // Affinités Canal
    if (fish.canal.present && spot.zone === 'canal') {
      if (spot.id === 'viaduc-calix' && fish.canal.keySpots?.enrochements) score += 4;
      if (spot.id === 'pont-pegasus' && fish.canal.keySpots?.pilesDePont) score += 4;
      if (spot.id === 'quais-colombelles' && fish.canal.keySpots?.palplanches) score += 3;
      if (spot.id === 'ecluses-ouistreham') score += 3;
    }
    // Affinités Mer
    if (fish.bateau.present && spot.zone === 'bateau') {
      if (spot.id === 'epave-courbet' && fish.bateau.habitats?.epavesDDay) score += 5;
      if (spot.id === 'roches-calvados' && fish.bateau.habitats?.rochesDuCalvados) score += 5;
      if (spot.id === 'ridens-bernieres' && fish.bateau.habitats?.bancsDeSableEtRidens) score += 4;
      if (spot.id === 'hermanville' && fish.bateau.habitats?.bancsDeSableEtRidens) score += 3;
    }
    return { spot, score };
  });

  // Trier par score décroissant
  scored.sort((a, b) => b.score - a.score);

  // Pour les espèces duales, assurer un équilibre Canal et Mer si possible
  if (fish.canal.present && fish.bateau.present) {
    const canalSpots = scored.filter(s => s.spot.zone === 'canal').slice(0, 2).map(s => s.spot);
    const merSpots = scored.filter(s => s.spot.zone === 'bateau').slice(0, 2).map(s => s.spot);
    const combined = [];
    if (canalSpots[0]) combined.push(canalSpots[0]);
    if (merSpots[0]) combined.push(merSpots[0]);
    if (canalSpots[1] && combined.length < max) combined.push(canalSpots[1]);
    if (merSpots[1] && combined.length < max) combined.push(merSpots[1]);
    return combined.slice(0, max);
  }

  return scored.slice(0, max).map(s => s.spot);
}

/**
 * Récupère tous les spots positionnables sur une carte donnée
 */
export function getSpotsForMap(mapType) {
  if (mapType === 'canal') {
    return SPOTS_REGISTRY.filter(s => s.canalPos !== null && s.canalPos !== undefined).map(s => ({
      ...s,
      mapPos: s.canalPos
    }));
  }
  if (mapType === 'mer') {
    return SPOTS_REGISTRY.filter(s => s.merPos !== null && s.merPos !== undefined).map(s => ({
      ...s,
      mapPos: s.merPos
    }));
  }
  if (mapType === 'reg') {
    return SPOTS_REGISTRY.filter(s => s.regPos !== null && s.regPos !== undefined).map(s => ({
      ...s,
      mapPos: s.regPos
    }));
  }
  return [];
}
