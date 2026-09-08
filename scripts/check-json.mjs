import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const skip = new Set(['node_modules', '.git']);
let failed = false;
let count = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith('.json')) {
      count += 1;
      try {
        JSON.parse(fs.readFileSync(full, 'utf8'));
      } catch (err) {
        failed = true;
        console.error(`INVALID JSON: ${path.relative(root, full)}\n${err.message}`);
      }
    }
  }
}

walk(root);
if (failed) process.exit(1);
console.log(`JSON syntax OK: ${count} files`);
