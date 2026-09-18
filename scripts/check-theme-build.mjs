/**
 * Theme Build validator — deterministic string/regex assertions on the built
 * synthetic Theme runtime HTML (Stage 4A proof).
 *
 * Runs AFTER `npm run build`. No HTML parser dependency (no cheerio/jsdom/
 * parse5/Playwright). Verifies the two fixture routes:
 *   dist/test/theme-runtime/index.html                          (home)
 *   dist/test/theme-runtime/services/consulting/index.html      (service)
 *
 * HOME must prove:
 *   - data-theme-id exists (compiled ThemeSpec applied);
 *   - compiled CSS custom properties exist in <head>;
 *   - Machine metadata still exists (regression vs Human Layer);
 *   - canonical="/" (not rebased);
 *   - visible service link rebased to /test/theme-runtime/services/consulting/;
 *   - Organization-like JSON-LD exists.
 *
 * SERVICE page must prove:
 *   - same data-theme-id;
 *   - same compiled theme tokens;
 *   - canonical="/services/consulting/" (NOT rebased);
 *   - visible home/service links ARE rebased;
 *   - Machine metadata exists;
 *   - JSON-LD includes primary entity + relevant Service;
 *   - Service provider ref survives;
 *   - unwired form still exists;
 *   - confirmed contacts still exist.
 *
 * This is specifically regression proof that Theme integration did not break
 * accepted Human Layer behavior.
 *
 * Exit code 0 = pass, 1 = fail.
 */

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const dist = path.join(root, 'dist');

const HOME = path.join(dist, 'test', 'theme-runtime', 'index.html');
const SERVICE = path.join(dist, 'test', 'theme-runtime', 'services', 'consulting', 'index.html');

const THEME_ID = 'techassembly-precision';

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

function assertNotIncludes(haystack, needle, label, context) {
  if (haystack && haystack.includes(needle)) {
    failed = true;
    failures.push(`[${label}] unexpected "${needle}" in ${context}`);
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

// Shared: compiled theme tokens present in a page.
function assertThemeTokens(page, label) {
  // data-theme-id attribute carries the compiled theme id.
  assertIncludes(page, `data-theme-id="${THEME_ID}"`, label, 'html carries compiled theme-id');

  // Compiled CSS custom properties in head.
  assertToken(page, '--color-canvas:#f2f4f6', label, 'compiled canvas token');
  assertToken(page, '--color-surface:#ffffff', label, 'compiled surface token');
  assertToken(page, '--color-primary:#12495c', label, 'compiled primary token');
  assertToken(page, '--color-primary-hover:#0d3847', label, 'compiled primary-hover token');
  assertToken(page, '--color-on-primary:#ffffff', label, 'compiled on-primary token');
  assertToken(page, '--color-accent:#cfe3ea', label, 'compiled accent token');
  assertToken(page, '--color-on-accent:#0f2a33', label, 'compiled on-accent token');
  assertToken(page, '--color-line:#c9d2da', label, 'compiled line token (opaque, no alpha)');

  // ResponsiveLength object -> clamp().
  assertToken(page, '--space-section:clamp(3.5rem,7vw,7rem)', label, 'responsive section -> clamp()');
  assertToken(page, '--space-content:clamp(1.1rem,2.6vw,3rem)', label, 'responsive content -> clamp()');
  assertToken(page, '--display-size:clamp(2.6rem,5.6vw,5.2rem)', label, 'responsive display size -> clamp()');
  assertToken(page, '--heading-size:clamp(1.7rem,3.2vw,2.9rem)', label, 'responsive heading size -> clamp()');

  // SimpleLength preserved.
  assertToken(page, '--space-block-gap:0.75rem', label, 'block gap simple length');
  assertToken(page, '--eyebrow-size:0.72rem', label, 'eyebrow size simple length');
  assertToken(page, '--radius-card:14px', label, 'card radius token');
  assertToken(page, '--radius-panel:20px', label, 'panel radius token');
  assertToken(page, '--radius-button:10px', label, 'button radius token');

  // Typography role scalars.
  assertToken(page, '--display-weight:600', label, 'display weight token');
  assertToken(page, '--display-tracking:-0.03em', label, 'display tracking token');
  assertToken(page, '--eyebrow-tracking:0.09em', label, 'eyebrow tracking token');

  // Structured effects -> CSS.
  assertToken(page, '--border-card:1pxsolidvar(--color-line)', label, 'structured border compiled');
  assertToken(page, '--shadow-card:010px28px-12pxrgba(12,18,24,0.18)', label, 'structured shadow compiled');

  // Compiler must not emit uppercase hex.
  if (/#([0-9]*[A-F][0-9a-fA-F]*){6}/.test(page)) {
    failed = true;
    failures.push(`[${label}] unexpected uppercase hex color in compiled CSS`);
  }

  // The style block lives in <head> (ThemeStyle bridge), before the body.
  assertBefore(page, '<style', '<body', label, 'compiled style in head before body');

  // Legacy data-theme namespace must NOT be used by compiled ThemeSpec runtime.
  assertNotIncludes(page, `data-theme="${THEME_ID}"`, label, 'compiled runtime must not use legacy data-theme');

  // No site-specific / block / nth selectors in compiled CSS.
  assertNotIncludes(page, ':nth-of-type', label, 'no :nth-of-type in compiled CSS');
}

// ===========================================================================
// HOME page
// ===========================================================================
const home = assertExists(HOME, 'theme-home');
if (home) {
  // Theme applied.
  assertThemeTokens(home, 'theme-home');

  // Rendered through generic PageRenderer.
  assertIncludes(home, '<header', 'theme-home', 'header exists');
  assertIncludes(home, '<main id="top"', 'theme-home', 'main exists');
  assertIncludes(home, '<footer', 'theme-home', 'footer exists');
  assertBefore(home, '<header', '<main id="top"', 'theme-home', 'header before main');
  assertBefore(home, '<main id="top"', '<footer', 'theme-home', 'main before footer');

  // Machine metadata still exists (regression vs Human Layer).
  assertIncludes(home, '<title>Human Layer Fixture — Home</title>', 'theme-home', 'title from MachineSpec');
  assertIncludes(home, 'name="description"', 'theme-home', 'meta description from MachineSpec');
  assertIncludes(home, 'name="robots"', 'theme-home', 'robots meta exists');
  assertIncludes(home, 'rel="canonical" href="/"', 'theme-home', 'canonical href="/" (not rebased)');
  assertIncludes(home, 'type="application/ld+json"', 'theme-home', 'JSON-LD script exists');
  assertIncludes(home, '"@type":"ProfessionalService"', 'theme-home', 'Organization-like JSON-LD exists');
  assertIncludes(home, '"@id":"#primary-entity"', 'theme-home', 'primary entity id');

  // Visible service link rebased to mount; canonical NOT rebased.
  assertIncludes(
    home,
    'href="/test/theme-runtime/services/consulting/"',
    'theme-home',
    'visible service link rebased to mount'
  );
  assertNotIncludes(home, 'rel="canonical" href="/test/theme-runtime', 'theme-home', 'canonical not rebased to mount');
}

// ===========================================================================
// SERVICE page
// ===========================================================================
const service = assertExists(SERVICE, 'theme-service');
if (service) {
  // Same theme applied.
  assertThemeTokens(service, 'theme-service');

  // Rendered through generic PageRenderer.
  assertIncludes(service, '<header', 'theme-service', 'header exists');
  assertIncludes(service, '<main id="top"', 'theme-service', 'main exists');
  assertIncludes(service, '<footer', 'theme-service', 'footer exists');
  assertBefore(service, '<header', '<main id="top"', 'theme-service', 'header before main');
  assertBefore(service, '<main id="top"', '<footer', 'theme-service', 'main before footer');

  // Machine metadata exists.
  assertIncludes(service, 'name="description"', 'theme-service', 'meta description from MachineSpec');
  assertIncludes(service, 'name="robots"', 'theme-service', 'robots meta exists');

  // canonical="/services/consulting/" (NOT rebased).
  assertIncludes(
    service,
    'rel="canonical" href="/services/consulting/"',
    'theme-service',
    'canonical href="/services/consulting/" (not rebased)'
  );
  assertNotIncludes(service, 'rel="canonical" href="/test/theme-runtime', 'theme-service', 'canonical not rebased to mount');

  // Visible home/service links ARE rebased.
  assertIncludes(service, 'href="/test/theme-runtime/"', 'theme-service', 'visible home link rebased to mount');
  assertIncludes(
    service,
    'href="/test/theme-runtime/services/consulting/"',
    'theme-service',
    'visible service link rebased to mount'
  );

  // JSON-LD: primary entity + relevant Service + provider reference survives.
  assertIncludes(service, 'type="application/ld+json"', 'theme-service', 'JSON-LD script exists');
  assertIncludes(service, '"@type":"ProfessionalService"', 'theme-service', 'primary entity in JSON-LD');
  assertIncludes(service, '"@type":"Service"', 'theme-service', 'relevant Service in JSON-LD');
  assertIncludes(service, '"@id":"#service-consulting"', 'theme-service', 'Service fragment id');
  assertIncludes(
    service,
    '"provider":{"@id":"#primary-entity"}',
    'theme-service',
    'Service provider references primary entity'
  );

  // Unwired form still exists (regression vs Human Layer).
  assertIncludes(service, 'data-transport-status="unwired"', 'theme-service', 'CTA form exists, unwired');
  assertIncludes(service, '<textarea', 'theme-service', 'textarea rendered');
  assertIncludes(service, '<button', 'theme-service', 'submit control exists');
  assertIncludes(service, 'disabled', 'theme-service', 'submit control disabled');
  assertNotIncludes(service, 'action="', 'theme-service', 'no form action attribute');

  // Confirmed contacts still exist (regression vs Human Layer).
  assertIncludes(service, 'href="tel:+74950000000"', 'theme-service', 'phone tel: link exists');
  assertIncludes(service, 'href="mailto:hello@human-layer-fixture.test"', 'theme-service', 'email mailto: link exists');
  assertIncludes(service, 'data-contact-status="confirmed"', 'theme-service', 'confirmed contact status exists');
  assertNotIncludes(service, 'data-contact-status="placeholder"', 'theme-service', 'no placeholder contacts');
}

// ===========================================================================
// Report
// ===========================================================================
if (failed) {
  console.error('Theme build validation FAILED:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('Theme build validation OK: compiled theme applied to home + service runtime pages, Human Layer behavior preserved');