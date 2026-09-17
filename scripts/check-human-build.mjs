/**
 * Human Build validator — deterministic string/regex assertions on the
 * built synthetic Human runtime HTML.
 *
 * Runs AFTER `npm run build`. No HTML parser dependency (no cheerio/jsdom/
 * parse5/Playwright). Verifies the two fixture routes:
 *   dist/test/human-runtime/index.html            (home)
 *   dist/test/human-runtime/services/consulting/index.html  (service)
 *
 * Exit code 0 = pass, 1 = fail.
 */

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const dist = path.join(root, 'dist');

const HOME = path.join(dist, 'test', 'human-runtime', 'index.html');
const SERVICE = path.join(dist, 'test', 'human-runtime', 'services', 'consulting', 'index.html');

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

function indexOf(haystack, needle) {
  return haystack ? haystack.indexOf(needle) : -1;
}

function assertBefore(haystack, a, b, label, context) {
  if (!haystack) return;
  const ia = indexOf(haystack, a);
  const ib = indexOf(haystack, b);
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

// ===== HOME page =====
const home = assertExists(HOME, 'home');
if (home) {
  assertIncludes(home, '<header', 'home', 'header exists', 'home HTML');
  assertIncludes(home, '<main id="top"', 'home', 'main exists', 'home HTML');
  assertIncludes(home, '<footer', 'home', 'footer exists', 'home HTML');
  assertBefore(home, '<header', '<main id="top"', 'home', 'header before main');
  assertBefore(home, '<main id="top"', '<footer', 'home', 'main before footer');

  // MachineSpec metadata
  assertIncludes(home, '<title>Human Layer Fixture — Home</title>', 'home', 'title from MachineSpec');
  assertIncludes(home, 'name="description"', 'home', 'meta description from MachineSpec');
  assertIncludes(home, 'name="robots" content="index,follow"', 'home', 'robots meta exists');
  assertIncludes(home, 'property="og:type" content="website"', 'home', 'og:type exists');
  assertIncludes(home, 'property="og:title"', 'home', 'og:title exists');
  assertIncludes(home, 'property="og:description"', 'home', 'og:description exists');
  assertIncludes(home, 'rel="canonical" href="/"', 'home', 'canonical href="/"');

  // JSON-LD Organization-like entity
  assertIncludes(home, 'type="application/ld+json"', 'home', 'JSON-LD script exists');
  assertIncludes(home, '"@type":"ProfessionalService"', 'home', 'Organization-like JSON-LD exists');
  assertIncludes(home, '"@id":"#primary-entity"', 'home', 'primary entity id');

  // confirmed contacts on home
  assertIncludes(home, 'href="tel:+74950000000"', 'home', 'phone tel: link exists');
  assertIncludes(home, 'href="mailto:hello@human-layer-fixture.test"', 'home', 'email mailto: link exists');
  assertIncludes(home, 'data-contact-status="confirmed"', 'home', 'confirmed contact status exists');

  // No placeholder contacts on home fixture
  assertNotIncludes(home, 'data-contact-status="placeholder"', 'home', 'no placeholder contacts');
  assertNotIncludes(home, '+7 (000) 000-00-00', 'home', 'no placeholder phone');
  assertNotIncludes(home, 'example@mail.test', 'home', 'no placeholder email');

  // No fake domain
  assertNotIncludes(home, 'https://example.com', 'home', 'no fake domain https://example.com');
  assertNotIncludes(home, 'https://placeholder.test', 'home', 'no fake domain https://placeholder.test');

  // Form unwired
  assertIncludes(home, 'data-transport-status="unwired"', 'home', 'form unwired');
  assertIncludes(home, '<textarea', 'home', 'textarea rendered');
  assertIncludes(home, 'type="email"', 'home', 'email field rendered');
  assertIncludes(home, 'type="tel"', 'home', 'tel field rendered');
  assertIncludes(home, '<button', 'home', 'submit control exists');
  assertIncludes(home, 'disabled', 'home', 'submit control disabled');

  // Link rebasing: internal nav rebased to mount
  assertIncludes(home, 'href="/test/human-runtime/services/consulting/"', 'home', 'internal service link rebased to mount');
  // Canonical NOT rebased
  assertIncludes(home, 'rel="canonical" href="/"', 'home', 'canonical not rebased (stays /)');
}

// ===== SERVICE page =====
const service = assertExists(SERVICE, 'service');
if (service) {
  assertIncludes(service, '<header', 'service', 'header exists');
  assertIncludes(service, '<main id="top"', 'service', 'main exists');
  assertIncludes(service, '<footer', 'service', 'footer exists');
  assertBefore(service, '<header', '<main id="top"', 'service', 'header before main');
  assertBefore(service, '<main id="top"', '<footer', 'service', 'main before footer');

  assertIncludes(service, 'rel="canonical" href="/services/consulting/"', 'service', 'canonical href="/services/consulting/"');

  // Visible internal home/service links use mount base
  assertIncludes(service, 'href="/test/human-runtime/"', 'service', 'visible home link uses mount base');
  assertIncludes(service, 'href="/test/human-runtime/services/consulting/"', 'service', 'visible service link uses mount base');
  // Canonical NOT rebased
  assertNotIncludes(service, 'rel="canonical" href="/test/human-runtime', 'service', 'canonical not rebased to mount');

  // CTA form
  assertIncludes(service, 'data-transport-status="unwired"', 'service', 'CTA form exists, unwired');
  assertIncludes(service, 'required', 'service', 'required fields rendered');
  assertIncludes(service, '<textarea', 'service', 'textarea rendered');
  assertIncludes(service, '<button', 'service', 'submit control exists');
  assertIncludes(service, 'disabled', 'service', 'submit control disabled');
  // No fake submission plumbing
  assertNotIncludes(service, 'action="', 'service', 'no form action attribute');
  assertNotIncludes(service, 'fetch(', 'service', 'no fetch() call');

  // Contacts
  assertIncludes(service, 'href="tel:+74950000000"', 'service', 'phone tel: link exists');
  assertIncludes(service, 'href="mailto:hello@human-layer-fixture.test"', 'service', 'email mailto: link exists');
  assertIncludes(service, 'data-contact-status="confirmed"', 'service', 'confirmed contact status exists');
  assertNotIncludes(service, 'data-contact-status="placeholder"', 'service', 'no placeholder contacts');

  // JSON-LD: primary entity + relevant Service + provider reference
  assertIncludes(service, 'type="application/ld+json"', 'service', 'JSON-LD script exists');
  assertIncludes(service, '"@type":"ProfessionalService"', 'service', 'primary entity in JSON-LD');
  assertIncludes(service, '"@type":"Service"', 'service', 'relevant Service in JSON-LD');
  assertIncludes(service, '"@id":"#service-consulting"', 'service', 'Service fragment id');
  assertIncludes(service, '"provider":{"@id":"#primary-entity"}', 'service', 'Service provider references primary entity');

  // No fake domain
  assertNotIncludes(service, 'https://example.com', 'service', 'no fake domain https://example.com');
  assertNotIncludes(service, 'https://placeholder.test', 'service', 'no fake domain https://placeholder.test');
}

// ===== Report =====
if (failed) {
  console.error('Human build validation FAILED:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('Human build validation OK: home + service pages verified');