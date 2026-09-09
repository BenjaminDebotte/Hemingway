import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

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

test('species-index.json contains 32 entries', () => {
  assert.equal(index.species.length, 32);
});

test('all 32 species JSON files exist and conform to schema Draft-07', () => {
  for (const entry of index.species) {
    const filePath = path.resolve(entry.file);
    assert.equal(fs.existsSync(filePath), true, `File missing: ${entry.file}`);

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.doesNotThrow(() => validateObject(schema, data), `Schema error for ${entry.id}`);
    assert.equal(data.canal.present, entry.canal, `Canal flag mismatch for ${entry.id}`);
    assert.equal(data.bateau.present, entry.bateau, `Bateau flag mismatch for ${entry.id}`);
    assert.equal(data.calendar.canal.length, 12, `Canal calendar array length invalid for ${entry.id}`);
    assert.equal(data.calendar.bateau.length, 12, `Bateau calendar array length invalid for ${entry.id}`);
  }
});
