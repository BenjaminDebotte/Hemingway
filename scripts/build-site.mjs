import fs from 'fs';
import path from 'path';

const index = JSON.parse(fs.readFileSync('data/species-index.json', 'utf8'));

console.log('Lecture et assemblage des 32 espèces...');

const allSpecies = [];

for (const entry of index.species) {
  const filePath = path.resolve(entry.file);
  if (!fs.existsSync(filePath)) {
    console.error(`Fichier manquant : ${entry.file}`);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  allSpecies.push(data);
}

fs.mkdirSync('site', { recursive: true });

// Export sous forme de fichier JS autonome (window.SPECIES_DATA)
// pour fonctionner nativement en double-cliquant sur index.html sans problème de CORS
const dataJsContent = `// Données générées automatiquement - 32 espèces de Normandie
window.SPECIES_DATA = ${JSON.stringify(allSpecies, null, 2)};
window.PROJECT_INDEX = ${JSON.stringify(index, null, 2)};
`;

fs.writeFileSync('site/data.js', dataJsContent, 'utf8');

console.log(`✓ Fichier site/data.js généré avec succès (${allSpecies.length} espèces).`);
