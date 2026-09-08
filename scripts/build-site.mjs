import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export function buildSite(quiet = false) {
  const index = JSON.parse(fs.readFileSync('data/species-index.json', 'utf8'));

  if (!quiet) console.log('Lecture et assemblage des espèces...');

  const allSpecies = [];

  for (const entry of index.species) {
    const filePath = path.resolve(entry.file);
    if (!fs.existsSync(filePath)) {
      console.error(`Fichier manquant : ${entry.file}`);
      return false;
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    allSpecies.push(data);
  }

  fs.mkdirSync('site', { recursive: true });

  const dataJsContent = `// Données générées automatiquement - 32 espèces de Normandie
window.SPECIES_DATA = ${JSON.stringify(allSpecies, null, 2)};
window.PROJECT_INDEX = ${JSON.stringify(index, null, 2)};
`;

  fs.writeFileSync('site/data.js', dataJsContent, 'utf8');

  if (!quiet) {
    console.log(`✓ Fichier site/data.js généré avec succès (${allSpecies.length} espèces).`);
  }
  return true;
}

// Exécution directe via CLI
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  buildSite();
}
