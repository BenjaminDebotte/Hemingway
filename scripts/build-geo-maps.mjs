import fs from 'fs';
import path from 'path';

const OVERPASS_URLS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter'
];

async function fetchOverpass(query) {
  for (const baseUrl of OVERPASS_URLS) {
    try {
      const url = `${baseUrl}?data=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'PecheNormandieAgent/1.0' }
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      console.warn(`Fetch failed on ${baseUrl}:`, e.message);
    }
  }
  throw new Error('All Overpass mirrors failed.');
}

async function getGeometries() {
  console.log('1. Récupération des tracés du Canal de Caen à la mer...');
  const qCanal = `[out:json][timeout:25];(way["name"~"Canal de Caen à la Mer"];way["name"~"Canal de Caen"];);out geom;`;
  const canalData = await fetchOverpass(qCanal);

  console.log('2. Récupération du trait de côte Côte de Nacre (Courseulles -> Baie de Sallenelles)...');
  const qCoast = `[out:json][timeout:25];way["natural"="coastline"](49.25,-0.50,49.34,-0.22);out geom;`;
  const coastData = await fetchOverpass(qCoast);

  console.log('3. Récupération du tracé de l\'Orne aval (embouchure & estuaire)...');
  const qOrne = `[out:json][timeout:25];(way["waterway"="river"]["name"~"Orne"](49.18,-0.38,49.30,-0.22););out geom;`;
  const orneData = await fetchOverpass(qOrne);

  return {
    canal: canalData.elements,
    coast: coastData.elements,
    orne: orneData.elements
  };
}

console.log('Lancement de la collecte géographique OpenStreetMap...');
const raw = await getGeometries();

fs.writeFileSync('data/osm-raw.json', JSON.stringify(raw, null, 2));
console.log('Données brutes sauvegardées dans data/osm-raw.json');
