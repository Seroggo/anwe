import fs from 'node:fs';
import path from 'node:path';

const bpRoot = path.resolve(process.cwd(), 'blueprints');
const registryPath = path.join(bpRoot, '_registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const ids = new Map();
let failed = false;

for (const item of registry.blueprints) {
  if (ids.has(item.id)) {
    console.error(`DUPLICATE ID: ${item.id}`);
    failed = true;
    continue;
  }
  ids.set(item.id, item.path);
  const full = path.join(bpRoot, item.path);
  if (!fs.existsSync(full)) {
    console.error(`MISSING FILE: ${item.id} -> ${item.path}`);
    failed = true;
    continue;
  }
  const bp = JSON.parse(fs.readFileSync(full, 'utf8'));
  if (bp.blueprint_id !== item.id) {
    console.error(`ID MISMATCH: registry=${item.id}, file=${bp.blueprint_id}`);
    failed = true;
  }
}

for (const [id, rel] of ids) {
  const bp = JSON.parse(fs.readFileSync(path.join(bpRoot, rel), 'utf8'));
  for (const parent of bp.extends ?? []) {
    if (!ids.has(parent)) {
      console.error(`UNRESOLVED EXTENDS: ${id} -> ${parent}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log(`Blueprint registry OK: ${ids.size} blueprints`);
