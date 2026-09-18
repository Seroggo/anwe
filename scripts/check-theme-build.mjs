/**
 * Theme Build validator — deterministic string/regex assertions on the built
 * synthetic Theme runtime HTML (Stage 4A proof).
 *
 * Runs AFTER `npm run build`. No HTML parser dependency (no cheerio/jsdom/
 * parse5/Playwright). Verifies:
 *   dist/test/theme-runtime/index.html
 *
 * Asserts that a ThemeSpec compiled by the deterministic Theme Compiler reached
 * the runtime as CSS custom properties and that the page rendered through the
 * generic PageRenderer with a ThemeStyle bridge.
 *
 * Exit code 0 = pass, 1 = fail.
 */

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const dist = path.join(root, 'dist');

const THEME_PAGE = path.join(dist, 'test', 'theme-runtime', 'index.html');

let failed = false;
const failures = [];

function assertExists(file, label) {
  if (!fs.existsSync(file)) {
    failed = true;
    failures.push(`[${label}] missing file: ${path.relative(root, file)}`);
    return null;
  }
  return fs.readFileSync(file, 'utf8');
}

function assertIncludes(haystack, needle, label, context) {
  if (!haystack || !haystack.includes(needle)) {
    failed = true;
    failures.push(`[${label}] expected "${needle}" in ${context}`);
  }
}

function assertBefore(haystack, a, b, label, context) {
  if (!haystack) return;
  const ia = haystack.indexOf(a);
  const ib = haystack.indexOf(b);
  if (ia < 0 || ib < 0) {
    failed = true;
    failures.push(`[${label}] could not locate ordering anchors "${a}"/"${b}" in ${context}`);
    return;
  }
  if (!(ia < ib)) {
    failed = true;
    failures.push(`[${label}] expected "${a}" before "${b}" in ${context} (got ${ia} vs ${ib})`);
  }
}

// Whitespace-tolerant token matcher: collapses all whitespace so assertions
// survive Astro's compressHTML transformation.
function hasToken(haystack, needle) {
  if (!haystack) return false;
  return haystack.replace(/\s+/g, '').includes(needle.replace(/\s+/g, ''));
}

function assertToken(haystack, needle, label, context) {
  if (!hasToken(haystack, needle)) {
    failed = true;
    failures.push(`[${label}] expected token "${needle}" in ${context}`);
  }
}

// ===== Theme runtime page =====
const page = assertExists(THEME_PAGE, 'theme-runtime');
if (page) {
  // The compiled theme is applied: the html element carries the theme id.
  assertIncludes(page, 'data-theme="techassembly-precision"', 'theme-runtime', 'html carries compiled theme id');

  // The deterministic Theme Compiler emitted CSS custom properties into the head.
  assertToken(page, '--color-canvas:#f2f4f6', 'theme-runtime', 'compiled canvas token');
  assertToken(page, '--color-surface:#ffffff', 'theme-runtime', 'compiled surface token');
  assertToken(page, '--color-primary:#12495c', 'theme-runtime', 'compiled primary token');
  assertToken(page, '--color-primary-hover:#0d3847', 'theme-runtime', 'compiled primary-hover token');
  assertToken(page, '--color-on-primary:#ffffff', 'theme-runtime', 'compiled on-primary token');
  assertToken(page, '--color-accent:#cfe3ea', 'theme-runtime', 'compiled accent token');
  assertToken(page, '--color-on-accent:#0f2a33', 'theme-runtime', 'compiled on-accent token');
  assertToken(page, '--color-line:#c9d2da', 'theme-runtime', 'compiled line token (opaque, no alpha)');

  // ResponsiveLength object -> clamp().
  assertToken(page, '--space-section:clamp(3.5rem,7vw,7rem)', 'theme-runtime', 'responsive section -> clamp()');
  assertToken(page, '--space-content:clamp(1.1rem,2.6vw,3rem)', 'theme-runtime', 'responsive content -> clamp()');
  assertToken(page, '--display-size:clamp(2.6rem,5.6vw,5.2rem)', 'theme-runtime', 'responsive display size -> clamp()');
  assertToken(page, '--heading-size:clamp(1.7rem,3.2vw,2.9rem)', 'theme-runtime', 'responsive heading size -> clamp()');

  // SimpleLength preserved.
  assertToken(page, '--space-block-gap:0.75rem', 'theme-runtime', 'block gap simple length');
  assertToken(page, '--eyebrow-size:0.72rem', 'theme-runtime', 'eyebrow size simple length');
  assertToken(page, '--radius-card:14px', 'theme-runtime', 'card radius token');
  assertToken(page, '--radius-panel:20px', 'theme-runtime', 'panel radius token');
  assertToken(page, '--radius-button:10px', 'theme-runtime', 'button radius token');

  // Typography role scalars.
  assertToken(page, '--display-weight:600', 'theme-runtime', 'display weight token');
  assertToken(page, '--display-tracking:-0.03em', 'theme-runtime', 'display tracking token');
  assertToken(page, '--eyebrow-tracking:0.09em', 'theme-runtime', 'eyebrow tracking token');

  // Structured effects -> CSS.
  assertToken(page, '--border-card:1pxsolidvar(--color-line)', 'theme-runtime', 'structured border compiled');
  assertToken(page, '--shadow-card:010px28px-12pxrgba(12,18,24,0.18)', 'theme-runtime', 'structured shadow compiled');

  // The compiler must not emit uppercase hex.
  if (/#([0-9]*[A-F][0-9a-fA-F]*){6}/.test(page)) {
    failed = true;
    failures.push('[theme-runtime] unexpected uppercase hex color in compiled CSS');
  }

  // The style block lives in <head> (ThemeStyle bridge), before the body.
  assertBefore(page, '<style', '<body', 'theme-runtime', 'compiled style in head before body');

  // The page rendered through the generic PageRenderer (Stage 3 + 4A bridge).
  assertIncludes(page, '<header', 'theme-runtime', 'header exists');
  assertIncludes(page, '<main id="top"', 'theme-runtime', 'main exists');
  assertIncludes(page, '<footer', 'theme-runtime', 'footer exists');
  assertBefore(page, '<header', '<main id="top"', 'theme-runtime', 'header before main');
  assertBefore(page, '<main id="top"', '<footer', 'theme-runtime', 'main before footer');

  // MachineSpec metadata applied (PageRenderer uses machine page meta).
  assertIncludes(page, 'name="description"', 'theme-runtime', 'meta description from MachineSpec');
  assertIncludes(page, 'name="robots"', 'theme-runtime', 'robots meta exists');
  assertIncludes(page, 'rel="canonical" href="/"', 'theme-runtime', 'canonical href="/" (not rebased)');
  assertIncludes(page, 'type="application/ld+json"', 'theme-runtime', 'JSON-LD script exists');

  // Fixture content rendered (proves the theme applies to real blocks).
  assertIncludes(page, 'TechAssembly', 'theme-runtime', 'fixture brand rendered');
}

// ===== Report =====
if (failed) {
  console.error('Theme build validation FAILED:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('Theme build validation OK: compiled theme applied to runtime page');