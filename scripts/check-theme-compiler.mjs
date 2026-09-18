/**
 * Theme Compiler validator — deterministic assertions on the Stage 4A
 * ThemeSpec v0.1 -> ANWE CSS custom-property compiler.
 *
 * Verifies:
 *   1. The non-blocking proof: a ThemeSpec produced from a SiteContext whose
 *      `brand.desired_character` is empty but whose grounded business context is
 *      sufficient is valid and carries an INTERPRETER_DECISION / FALLBACK that
 *      records the self-selected visual direction.
 *   2. Determinism: the same ThemeSpec always compiles to byte-identical CSS,
 *      regardless of JSON key order.
 *   3. Token coverage: every ANWE runtime token consumed by base.css / components
 *      is emitted by the compiler.
 *   4. Mapping correctness: colors preserved verbatim, ResponsiveLength objects
 *      compiled to clamp(), structured effects assembled into CSS declarations.
 *   5. Negative: a malformed ThemeSpec without required groups is rejected.
 *
 * Exit code 0 = pass, 1 = fail.
 */

import fs from 'node:fs';
import path from 'node:path';
import { compileTheme } from '../src/theme/compile.ts';

const root = path.resolve(process.cwd());
const fixturePath = path.join(root, 'tests/fixtures/theme-spec/fixture-a-output.json');
const inputPath = path.join(root, 'tests/fixtures/machine-spec/fixture-a-input.json');

let failed = false;
const failures = [];

function assert(condition, label) {
  if (!condition) {
    failed = true;
    failures.push(label);
  }
}

function valueOf(compiled, name) {
  const decl = compiled.declarations.find((d) => d.name === name);
  return decl ? decl.value : null;
}

const spec = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// ===========================================================================
// 1. Non-blocking proof
// ===========================================================================
const desired = input.site_context.brand.desired_character;
assert(
  Array.isArray(desired) && desired.length === 0,
  `proof: fixture A brand.desired_character must be empty (got ${JSON.stringify(desired)})`
);
assert(!!input.site_context.business, 'proof: fixture A must contain grounded business context');
assert(!!input.site_context.positioning, 'proof: fixture A must contain positioning');
assert(
  Array.isArray(input.site_context.audiences) && input.site_context.audiences.length > 0,
  'proof: fixture A must contain audiences'
);

assert(Array.isArray(spec.decisions) && spec.decisions.length > 0, 'ThemeSpec: decisions[] must be non-empty');
const selfSelected = spec.decisions.filter(
  (d) => d.source_type === 'INTERPRETER_DECISION' || d.source_type === 'FALLBACK'
);
assert(
  selfSelected.length >= 1,
  'ThemeSpec: must record at least one INTERPRETER_DECISION or FALLBACK for the self-selected direction'
);
assert(
  selfSelected.every((d) => Array.isArray(d.evidence) && d.evidence.length > 0 && d.reason && d.reason.length > 0),
  'ThemeSpec: every INTERPRETER_DECISION / FALLBACK must have non-empty evidence[] and reason'
);

// ===========================================================================
// 2. Determinism
// ===========================================================================
const first = compileTheme(spec);
const second = compileTheme(spec);
assert(first.css === second.css, 'determinism: same input must compile to identical CSS');
assert(first.css.length > 0, 'determinism: compiled CSS must be non-empty');

// Re-serialise with a different key order to prove key-order independence.
const reordered = {};
for (const key of Object.keys(spec).reverse()) {
  reordered[key] = spec[key];
}
assert(compileTheme(reordered).css === first.css, 'determinism: output must not depend on JSON key order');

// ===========================================================================
// 3. Selector
// ===========================================================================
assert(
  first.selector === `html[data-theme="${spec.theme_id}"]`,
  `selector: expected html[data-theme="${spec.theme_id}"] but got "${first.selector}"`
);
assert(first.themeId === spec.theme_id, 'themeId: must equal spec.theme_id');

// ===========================================================================
// 4. Token coverage
// ===========================================================================
const names = new Set(first.declarations.map((d) => d.name));
const requiredTokens = [
  '--color-canvas',
  '--color-surface',
  '--color-surface-muted',
  '--color-text',
  '--color-text-muted',
  '--color-primary',
  '--color-primary-hover',
  '--color-on-primary',
  '--color-accent',
  '--color-on-accent',
  '--color-inverse',
  '--color-inverse-text',
  '--color-line',
  '--color-focus',
  '--font-display',
  '--font-body',
  '--font-mono',
  '--display-size',
  '--display-weight',
  '--display-line-height',
  '--display-tracking',
  '--heading-size',
  '--heading-weight',
  '--heading-line-height',
  '--heading-tracking',
  '--body-size',
  '--body-weight',
  '--body-line-height',
  '--body-tracking',
  '--eyebrow-size',
  '--eyebrow-weight',
  '--eyebrow-line-height',
  '--eyebrow-tracking',
  '--space-section',
  '--space-content',
  '--space-block-gap',
  '--radius-card',
  '--radius-panel',
  '--radius-button',
  '--border-card',
  '--shadow-card'
];
for (const token of requiredTokens) {
  assert(names.has(token), `coverage: missing token "${token}"`);
}
// accent_palette tokens
assert(
  valueOf(first, '--color-accent-palette-1') === spec.colors.accent_palette[0],
  'coverage: --color-accent-palette-1 must equal accent_palette[0]'
);
assert(
  valueOf(first, '--color-accent-palette-2') === spec.colors.accent_palette[1],
  'coverage: --color-accent-palette-2 must equal accent_palette[1]'
);

// density is a descriptor only — it must NOT be emitted as a CSS token.
assert(!names.has('--density'), 'coverage: density descriptor must not be emitted as a CSS token');

// ===========================================================================
// 5. Mapping correctness
// ===========================================================================
// Colors preserved verbatim (no normalization).
assert(valueOf(first, '--color-canvas') === spec.colors.canvas, 'mapping: canvas preserved verbatim');
assert(valueOf(first, '--color-primary') === spec.colors.primary, 'mapping: primary preserved verbatim');
assert(valueOf(first, '--color-on-accent') === spec.colors.on_accent, 'mapping: on_accent preserved verbatim');
assert(
  !/[A-F]/.test(first.css.match(/#[0-9a-fA-F]{6}/g)?.join('') ?? ''),
  'mapping: compiler must not emit uppercase hex'
);

// ResponsiveLength object -> clamp(min, preferred, max).
assert(
  valueOf(first, '--space-section') === 'clamp(3.5rem, 7vw, 7rem)',
  `mapping: section -> clamp() (got "${valueOf(first, '--space-section')}")`
);
assert(
  valueOf(first, '--display-size') === 'clamp(2.6rem, 5.6vw, 5.2rem)',
  `mapping: display.size -> clamp() (got "${valueOf(first, '--display-size')}")`
);
// SimpleLength string -> as-is.
assert(valueOf(first, '--space-block-gap') === '0.75rem', 'mapping: block_gap simple length preserved');
assert(valueOf(first, '--eyebrow-size') === '0.72rem', 'mapping: eyebrow.size simple length preserved');

// Typography role scalars.
assert(valueOf(first, '--display-weight') === '600', 'mapping: display.weight as string');
assert(valueOf(first, '--display-line-height') === '1.02', 'mapping: display.line_height as string');
assert(valueOf(first, '--display-tracking') === '-0.03em', 'mapping: display.tracking preserved');
assert(valueOf(first, '--body-weight') === '400', 'mapping: body.weight as string');
assert(valueOf(first, '--eyebrow-tracking') === '0.09em', 'mapping: eyebrow.tracking preserved');

// Structured effects -> CSS.
assert(
  valueOf(first, '--border-card') === '1px solid var(--color-line)',
  `mapping: card_border assembled (got "${valueOf(first, '--border-card')}")`
);
// card_shadow: #0c1218 -> rgba(12, 18, 24, 0.18)
assert(
  valueOf(first, '--shadow-card') === '0 10px 28px -12px rgba(12, 18, 24, 0.18)',
  `mapping: card_shadow assembled (got "${valueOf(first, '--shadow-card')}")`
);

// Null effects contract sanity: the compiler must assemble null -> 0 / none
// (covered here by a synthetic spec, not by fixture A which has both effects).
const nullSpec = JSON.parse(JSON.stringify(spec));
nullSpec.effects.card_border = null;
nullSpec.effects.card_shadow = null;
nullSpec.theme_id = 'null-effects';
const nullCompiled = compileTheme(nullSpec);
assert(valueOf(nullCompiled, '--border-card') === '0', 'mapping: card_border null -> 0');
assert(valueOf(nullCompiled, '--shadow-card') === 'none', 'mapping: card_shadow null -> none');

// ===========================================================================
// 6. Negative: malformed spec rejected
// ===========================================================================
let threw = false;
try {
  compileTheme({});
} catch {
  threw = true;
}
assert(threw, 'negative: compiler must reject a spec without required groups');

threw = false;
try {
  compileTheme({ ...spec, theme_id: '' });
} catch {
  threw = true;
}
assert(threw, 'negative: compiler must reject an empty theme_id');

// ===========================================================================
// Report
// ===========================================================================
if (failed) {
  console.error('Theme compiler validation FAILED:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('Theme compiler validation OK: determinism, coverage, mapping, non-blocking proof verified');