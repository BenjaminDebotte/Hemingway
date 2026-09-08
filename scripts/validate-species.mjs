import fs from 'fs';
import path from 'path';

const schema = JSON.parse(fs.readFileSync('data/species.schema.json', 'utf8'));
const index = JSON.parse(fs.readFileSync('data/species-index.json', 'utf8'));

function validateObject(sch, obj, pathStr = '') {
  if (sch.required) {
    for (const req of sch.required) {
      if (obj[req] === undefined) {
        throw new Error(`Champ requis manquant : ${pathStr}${req}`);
      }
      if (sch.properties && sch.properties[req]) {
        const propSchema = sch.properties[req];
        if (propSchema.type === 'object') {
          validateObject(propSchema, obj[req], `${pathStr}${req}.`);
        }
      }
    }
  }

  if (sch.properties) {
    for (const [key, propSch] of Object.entries(sch.properties)) {
      if (obj[key] !== undefined) {
        if (propSch.enum && !propSch.enum.includes(obj[key])) {
          throw new Error(`Valeur non autorisée pour ${pathStr}${key} : "${obj[key]}". Attendue parmi [${propSch.enum.join(', ')}]`);
        }
        if (propSch.type === 'array') {
          if (!Array.isArray(obj[key])) {
            throw new Error(`Type invalide pour ${pathStr}${key} : attendu Array`);
          }
          if (propSch.minItems !== undefined && obj[key].length < propSch.minItems) {
            throw new Error(`Taille minimale non respectée pour ${pathStr}${key} : ${obj[key].length} < ${propSch.minItems}`);
          }
          if (propSch.maxItems !== undefined && obj[key].length > propSch.maxItems) {
            throw new Error(`Taille maximale dépassée pour ${pathStr}${key} : ${obj[key].length} > ${propSch.maxItems}`);
          }
        }
      }
    }
  }
}

let hasErrors = false;
let validatedCount = 0;
let missingCount = 0;

console.log(`\n=== Validation de la base d'espèces (${index.species.length} prévues) ===\n`);

for (const entry of index.species) {
  const filePath = path.resolve(entry.file);
  if (!fs.existsSync(filePath)) {
    console.log(`[EN ATTENTE] ${entry.id} (${entry.name}) : fichier non encore rédigé`);
    missingCount++;
    continue;
  }

  try {
    const rawContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(rawContent);

    validateObject(schema, data);

    // Vérification de concordance avec l'index
    if (data.canal.present !== entry.canal) {
      throw new Error(`Incohérence présence Canal : index=${entry.canal}, fichier=${data.canal.present}`);
    }
    if (data.bateau.present !== entry.bateau) {
      throw new Error(`Incohérence présence Bateau : index=${entry.bateau}, fichier=${data.bateau.present}`);
    }

    // Calcul de la densité texte pour l'impression A5
    const textChars = JSON.stringify(data).length;
    const densityFlag = textChars > 4200 ? '⚠️ DENSITÉ ÉLEVÉE' : '✓';

    console.log(`[OK] ${entry.id.padEnd(20)} | ${data.identity.name.padEnd(28)} | ${textChars} car. ${densityFlag}`);
    validatedCount++;
  } catch (err) {
    console.error(`[ERREUR] ${entry.id} : ${err.message}`);
    hasErrors = true;
  }
}

console.log(`\nBilan : ${validatedCount} validés, ${missingCount} en attente, ${hasErrors ? 'Des erreurs détectées' : 'Zéro erreur'}`);

if (hasErrors) {
  process.exit(1);
}
