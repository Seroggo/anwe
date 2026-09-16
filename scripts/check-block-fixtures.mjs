import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const fixturesRoot = path.join(root, 'tests', 'fixtures');
const matrixPath = path.join(fixturesRoot, 'demo-matrix.json');
const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
const pagesByLayout = new Map();
for (const layout of matrix.layouts ?? []) {
  const fixturePath = path.join(fixturesRoot, 'pages', `${layout.fixture}.json`);
  if (!fs.existsSync(fixturePath)) {
    failed = true;
    console.error(`BLOCK FIXTURE ERROR: missing page fixture ${layout.fixture}`);
    continue;
  }
  pagesByLayout.set(layout.id, JSON.parse(fs.readFileSync(fixturePath, 'utf8')));
}
const allowedTypes = new Set([
  'header',
  'hero',
  'text',
  'split',
  'cards',
  'steps',
  'stats',
  'gallery',
  'faq',
  'cta',
  'footer'
]);
const allowedThemes = new Set(['editorial-pastel', 'cinematic-dark', 'color-block']);
const allowedSurfaces = new Set(['default', 'muted', 'accent', 'inverse']);
const allowedActionStyles = new Set(['primary', 'secondary', 'text']);
const requiredOrders = {
  a: ['header', 'hero', 'cards', 'split', 'steps', 'gallery', 'faq', 'cta', 'footer'],
  b: ['header', 'hero', 'stats', 'text', 'gallery', 'cards', 'split', 'cta', 'footer'],
  c: ['header', 'hero', 'stats', 'split', 'cards', 'steps', 'gallery', 'faq', 'cta', 'footer']
};
let failed = false;

function fail(message) {
  failed = true;
  console.error(`BLOCK FIXTURE ERROR: ${message}`);
}

if (!Array.isArray(matrix.layouts) || matrix.layouts.length !== 3) {
  fail('demo-matrix.json must define exactly three layouts');
}
if (!Array.isArray(matrix.themes) || matrix.themes.length !== 3) {
  fail('demo-matrix.json must define exactly three themes');
}

const layoutIds = new Set();
for (const matrixLayout of matrix.layouts ?? []) {
  const layout = pagesByLayout.get(matrixLayout.id);
  if (!layout) continue;
  if (layoutIds.has(layout.id)) fail(`duplicate layout id: ${layout.id}`);
  layoutIds.add(layout.id);
  if (!requiredOrders[layout.id]) fail(`unknown layout id: ${layout.id}`);
  if (!Array.isArray(layout.blocks)) {
    fail(`layout ${layout.id} has no blocks array`);
    continue;
  }
  const types = layout.blocks.map((block) => block.type);
  const expected = requiredOrders[layout.id];
  if (JSON.stringify(types) !== JSON.stringify(expected)) {
    fail(`layout ${layout.id} order must be ${expected.join(', ')}`);
  }
  const ids = new Set();
  for (const block of layout.blocks) {
    if (!block.id || ids.has(block.id)) fail(`layout ${layout.id} has duplicate or empty block id`);
    ids.add(block.id);
    if (!allowedTypes.has(block.type)) fail(`layout ${layout.id} uses unknown block type ${block.type}`);
    if (!block.variant) fail(`block ${block.id} is missing a structural variant`);
    if (!allowedSurfaces.has(block.surface)) fail(`block ${block.id} uses unknown surface ${block.surface}`);
  }
  // Validate actions after all block IDs are collected
  for (const block of layout.blocks) {
    validateActions(block.content, block.id, ids);
  }
}

for (const theme of matrix.themes ?? []) {
  if (!allowedThemes.has(theme)) fail(`unknown theme ${theme}`);
}

const combinations = matrix.layouts.flatMap((layout) => matrix.themes.map((theme) => `${layout.id}/${theme}`));
if (combinations.length !== 9) fail(`expected 9 layout/theme combinations, found ${combinations.length}`);

function validateActions(value, owner, blockIds) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value.actions)) {
    for (const action of value.actions) {
      if (!action.label || !action.href || !allowedActionStyles.has(action.style)) {
        fail(`invalid action in ${owner}`);
      }
      // Validate internal anchors reference existing blocks or #top
      if (typeof action.href === 'string' && action.href.startsWith('#')) {
        const target = action.href.slice(1);
        if (target !== 'top' && !blockIds.has(target)) {
          fail(`${owner} links to missing anchor ${action.href}`);
        }
      }
    }
  }
  for (const nested of Object.values(value)) {
    if (Array.isArray(nested)) {
      for (const item of nested) validateActions(item, owner, blockIds);
    } else if (nested && typeof nested === 'object') {
      validateActions(nested, owner, blockIds);
    }
  }
}

if (failed) process.exit(1);
console.log(`Block fixtures OK: ${matrix.layouts.length} layouts × ${matrix.themes.length} themes = ${combinations.length} pages`);
