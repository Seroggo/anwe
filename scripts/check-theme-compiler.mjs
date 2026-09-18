/**
 * Theme Compiler validator — deterministic assertions on the Stage 4A
 * ThemeSpec v0.1 -> ANWE CSS custom-property compiler.
 *
 * Verifies:
 *   1. Non-blocking proof: a ThemeSpec produced from a SiteContext whose
 *      `brand.desired_character` is empty but whose grounded business context is
 *      sufficient is valid and carries INTERPRETER_DECISION / FALLBACK decisions.
 *   2. Cross-artifact identity: input.site_model.source_context_id ===
 *      input.site_context.context_id (semantic invariant of the interpreter input).
 *   3. Determinism: same ThemeSpec -> byte-identical CSS; reordered JSON keys ->
 *      same CSS.
 *   4. Selector: always `html[data-theme-id="<theme_id>"]`, derived only from
 *      theme_id; no arbitrary selector option; no .block / :nth-of-type / site
 *      selectors; accent palette emits variables only, never assignment selectors.
 *   5. Token coverage: every ANWE runtime token consumed by base.css is emitted.
 *   6. Mapping correctness: colors verbatim, ResponsiveLength -> clamp(),
 *      structured effects -> CSS, card_border null -> "none".
 *   7. Font-stack safety: unsafe fonts containing ;, {, }, <, > are rejected;
 *      valid quoted/system stacks pass.
 *   8. Negative: malformed spec rejected.
 *   9. base.css source regression: runtime consumers wired to theme tokens;
 *      mobile media rules do NOT replace theme tokens with hardcoded values.
 *
 * Exit code 0 = pass, 1 = fail.
 */

import fs from 'node:fs';
import path from 'node:path';
import { compileTheme } from '../src/theme/compile.ts';

const root = path.resolve(process.cwd());
const fixturePath = path.join(root, 'tests/fixtures/theme-spec/fixture-a-output.json');
const inputPath = path.join(root, 'tests/fixtures/machine-spec/fixture-a-input.json');
const baseCssPath = path.join(root, 'src/styles/base.css');
const promptPath = path.join(root, 'prompts/designer.theme.interpret.json');

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
const baseCss = fs.readFileSync(baseCssPath, 'utf8');
const promptObj = JSON.parse(fs.readFileSync(promptPath, 'utf8'));
const promptText = promptObj.systemPrompt;

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
// 2. Cross-artifact identity (item 12)
// ===========================================================================
assert(
  input.site_model.source_context_id === input.site_context.context_id,
  `identity: site_model.source_context_id (${input.site_model.source_context_id}) must equal site_context.context_id (${input.site_context.context_id})`
);

// ===========================================================================
// 3. Determinism
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
// 4. Selector (item 13 A, B, H, I, J)
// ===========================================================================
assert(
  first.selector === `html[data-theme-id="${spec.theme_id}"]`,
  `selector: expected html[data-theme-id="${spec.theme_id}"] but got "${first.selector}"`
);
assert(first.themeId === spec.theme_id, 'themeId: must equal spec.theme_id');

// No arbitrary selector option: compileTheme must accept exactly one argument.
assert(
  compileTheme.length === 1,
  `API: compileTheme must accept exactly 1 argument (got arity ${compileTheme.length})`
);

// Output must never contain site-specific / block / nth selectors.
assert(!first.css.includes(':nth-of-type'), 'selector: output must not contain ":nth-of-type"');
assert(!first.css.includes('.block'), 'selector: output must not contain ".block"');
assert(!first.css.includes('[data-site'), 'selector: output must not contain "[data-site=...]"]');
// id selectors would appear as `#id` followed by a non-hex char; compiled CSS only
// contains `#rrggbb` colors and the `data-theme-id` attribute selector, so check for
// a `#` that is NOT part of a 6-digit hex color.
const nonHexHash = first.css.replace(/#[0-9a-fA-F]{6}/g, '');
assert(!/#{[a-zA-Z]/.test(nonHexHash) && !/#[^0-9a-fA-F]/.test(nonHexHash), 'selector: output must not contain id selectors');

// Accent palette emits CSS variables only, never assignment selectors.
const paletteDecl = first.declarations.filter((d) => /^--color-accent-palette-\d+$/.test(d.name));
assert(
  paletteDecl.length === spec.colors.accent_palette.length,
  'accent palette: must emit one variable per palette entry, no selectors'
);
assert(
  paletteDecl.every((d) => /^#[0-9a-f]{6}$/.test(d.value)),
  'accent palette: every palette variable value must be a lowercase hex color'
);

// ===========================================================================
// 5. Token coverage (item 13 N)
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
assert(
  valueOf(first, '--color-accent-palette-1') === spec.colors.accent_palette[0],
  'coverage: --color-accent-palette-1 must equal accent_palette[0]'
);
assert(
  valueOf(first, '--color-accent-palette-2') === spec.colors.accent_palette[1],
  'coverage: --color-accent-palette-2 must equal accent_palette[1]'
);
assert(!names.has('--density'), 'coverage: density descriptor must not be emitted as a CSS token');

// ===========================================================================
// 6. Mapping correctness
// ===========================================================================
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
assert(valueOf(first, '--space-block-gap') === '0.75rem', 'mapping: block_gap simple length preserved');
assert(valueOf(first, '--eyebrow-size') === '0.72rem', 'mapping: eyebrow.size simple length preserved');

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
assert(
  valueOf(first, '--shadow-card') === '0 10px 28px -12px rgba(12, 18, 24, 0.18)',
  `mapping: card_shadow assembled (got "${valueOf(first, '--shadow-card')}")`
);

// ===========================================================================
// 7. card_border null -> "none" (item 6, 13 G)
// ===========================================================================
const nullSpec = JSON.parse(JSON.stringify(spec));
nullSpec.effects.card_border = null;
nullSpec.effects.card_shadow = null;
nullSpec.theme_id = 'null-effects';
const nullCompiled = compileTheme(nullSpec);
assert(valueOf(nullCompiled, '--border-card') === 'none', 'mapping: card_border null -> "none" (not "0")');
assert(valueOf(nullCompiled, '--shadow-card') === 'none', 'mapping: card_shadow null -> "none"');
assert(
  nullCompiled.selector === 'html[data-theme-id="null-effects"]',
  'selector: null-effects spec derived from theme_id'
);

// ===========================================================================
// 8. Font-stack safety (item 5, 13 C D E F)
// ===========================================================================
function expectFontReject(value, label) {
  const s = JSON.parse(JSON.stringify(spec));
  s.typography.font_body = value;
  s.theme_id = 'font-test';
  let threw = false;
  try {
    compileTheme(s);
  } catch {
    threw = true;
  }
  assert(threw, `font safety: must reject ${label}`);
}

function expectFontAccept(value, label) {
  const s = JSON.parse(JSON.stringify(spec));
  s.typography.font_body = value;
  s.theme_id = 'font-test-ok';
  let threw = false;
  let compiled = null;
  try {
    compiled = compileTheme(s);
  } catch (e) {
    threw = true;
  }
  assert(!threw, `font safety: must accept ${label}`);
  if (compiled) {
    assert(valueOf(compiled, '--font-body') === value, `font safety: accepted value preserved verbatim (${label})`);
  }
}

expectFontReject('Arial; color:red', 'font with ";"');
expectFontReject('</style>', 'font with "<" / "</style>"');
expectFontReject('Foo{bar}', 'font with "{"');
expectFontReject('Foo}bar', 'font with "}"');
expectFontReject('a>b', 'font with ">"');
expectFontAccept('"Segoe UI", Arial, sans-serif', 'valid quoted stack');
expectFontAccept('system-ui, sans-serif', 'valid system-ui stack');
expectFontAccept('"Cascadia Mono", Consolas, monospace', 'valid mono stack');

// ===========================================================================
// 9. Negative: malformed spec rejected (item 13)
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
// 10. base.css source regression (item 14)
// ===========================================================================
function assertSourceContains(haystack, needle, label) {
  if (!haystack.includes(needle)) {
    failed = true;
    failures.push(`base.css: ${label} — missing "${needle}"`);
  }
}

function assertSourceNotContains(haystack, needle, label) {
  if (haystack.includes(needle)) {
    failed = true;
    failures.push(`base.css: ${label} — unexpected "${needle}"`);
  }
}

// Surface accent foreground -> on_accent.
assertSourceContains(baseCss, '.surface--accent', 'accent surface rule exists');
assertSourceContains(
  baseCss,
  '.surface--accent { --block-background: var(--color-accent); --block-foreground: var(--color-on-accent)',
  'accent surface foreground uses --color-on-accent'
);

// Brand-mark accent foreground -> on_accent.
assertSourceContains(baseCss, '.brand-mark', 'brand-mark rule exists');
assertSourceContains(
  baseCss,
  '.brand-mark { display: grid; place-items: center; width: 2rem; height: 2rem; color: var(--color-on-accent); background: var(--color-accent)',
  'brand-mark accent foreground uses --color-on-accent'
);

// Primary actions -> on_primary.
assertSourceContains(
  baseCss,
  '.action-link--primary { color: var(--color-on-primary',
  'action-link--primary uses --color-on-primary'
);
assertSourceContains(
  baseCss,
  '.human-form__submit',
  'human-form__submit rule exists'
);
assertSourceContains(
  baseCss,
  'color: var(--color-on-primary',
  'human-form__submit uses --color-on-primary'
);

// block gap.
assertSourceContains(
  baseCss,
  '.block + .block { margin-top: var(--space-block-gap',
  'block gap uses --space-block-gap'
);

// Body role tokens.
assertSourceContains(baseCss, 'font-weight: var(--body-weight', 'body weight token');
assertSourceContains(baseCss, 'line-height: var(--body-line-height', 'body line-height token');
assertSourceContains(baseCss, 'letter-spacing: var(--body-tracking', 'body tracking token');

// Display role tokens.
assertSourceContains(baseCss, 'font-size: var(--display-size)', 'display size token');
assertSourceContains(baseCss, 'font-weight: var(--display-weight', 'display weight token');
assertSourceContains(baseCss, 'line-height: var(--display-line-height', 'display line-height token');
assertSourceContains(baseCss, 'letter-spacing: var(--display-tracking', 'display tracking token');

// Heading role tokens.
assertSourceContains(baseCss, 'font-size: var(--heading-size)', 'heading size token');
assertSourceContains(baseCss, 'font-weight: var(--heading-weight', 'heading weight token');
assertSourceContains(baseCss, 'line-height: var(--heading-line-height', 'heading line-height token');
assertSourceContains(baseCss, 'letter-spacing: var(--heading-tracking', 'heading tracking token');

// Eyebrow role tokens.
assertSourceContains(baseCss, 'font-size: var(--eyebrow-size', 'eyebrow size token');
assertSourceContains(baseCss, 'font-weight: var(--eyebrow-weight', 'eyebrow weight token');
assertSourceContains(baseCss, 'line-height: var(--eyebrow-line-height', 'eyebrow line-height token');
assertSourceContains(baseCss, 'letter-spacing: var(--eyebrow-tracking', 'eyebrow tracking token');

// :root defaults for compiler-consumed variables.
const rootBlock = baseCss.match(/:root\s*\{[^}]*\}/s)?.[0] ?? '';
for (const token of [
  '--color-primary',
  '--color-primary-hover',
  '--color-on-primary',
  '--display-weight',
  '--display-line-height',
  '--display-tracking',
  '--heading-weight',
  '--heading-line-height',
  '--heading-tracking',
  '--body-weight',
  '--body-line-height',
  '--body-tracking',
  '--eyebrow-size',
  '--eyebrow-weight',
  '--eyebrow-line-height',
  '--eyebrow-tracking',
  '--space-block-gap'
]) {
  assert(rootBlock.includes(token), `:root default: missing "${token}"`);
}

// Mobile media rules must NOT replace theme tokens with hardcoded values.
const mobileMatch = baseCss.match(/@media\s*\(max-width:\s*700px\)\s*\{([\s\S]*?)\n\}/);
const mobile = mobileMatch?.[1] ?? '';
assert(mobile.length > 0, 'base.css: mobile @media(max-width:700px) block found');

assertSourceNotContains(mobile, 'padding: 4rem 1.25rem', 'mobile .block padding must use tokens, not 4rem 1.25rem');
assertSourceNotContains(mobile, 'margin-top: 0.4rem', 'mobile .block + .block must use --space-block-gap, not 0.4rem');
assertSourceNotContains(mobile, 'border-radius: 1.5rem', 'mobile must not override theme radius with hardcoded 1.5rem');
assertSourceNotContains(
  mobile,
  'h1 { font-size: clamp(3.1rem',
  'mobile h1 must use --display-size, not hardcoded clamp'
);
assertSourceNotContains(
  mobile,
  'h2 { font-size: clamp(2.2rem',
  'mobile h2 must use --heading-size, not hardcoded clamp'
);

// Mobile must still USE theme tokens (semicolon-tolerant).
const mobileCompact = mobile.replace(/\s+/g, '');
assert(mobileCompact.includes('.block{width:min(100%-0.75rem,1440px);padding:var(--space-section)var(--space-content)'), 'mobile .block uses section/content tokens');
assert(mobileCompact.includes('.block+.block{margin-top:var(--space-block-gap)'), 'mobile .block + .block uses block-gap token');
assert(mobileCompact.includes('h1{font-size:var(--display-size)'), 'mobile h1 uses --display-size');
assert(mobileCompact.includes('h2{font-size:var(--heading-size)'), 'mobile h2 uses --heading-size');

// ===========================================================================
// 11. Interpreter prompt output-contract regression (item 4)
// ===========================================================================
// Lightweight source check against prompts/designer.theme.interpret.json to
// guard the canonical ThemeSpec v0.1 output contract. No parser dependency.
const obsoleteDirectives = [
  'Coverage обязательно сформируй',
  'покажи счётчики',
  'Верни THEME_CAPABILITY_GAP'
];
for (const term of obsoleteDirectives) {
  assert(
    !promptText.includes(term),
    `prompt contract: obsolete directive "${term}" must be removed from designer.theme.interpret.json`
  );
}

const canonicalRules = [
  'ТОЛЬКО валидный ThemeSpec v0.1 JSON',
  'capability_gaps',
  'Coverage top-level'
];
assert(promptText.includes(canonicalRules[0]), 'prompt contract: must state canonical output rule (ThemeSpec v0.1 JSON only)');
assert(
  promptText.includes('capability_gaps') && /capability_gaps top-level/.test(promptText),
  'prompt contract: must prohibit capability_gaps top-level in ThemeSpec'
);
assert(
  promptText.includes('Coverage top-level') || promptText.includes('Context/Character/Coverage/Capability_gaps top-level'),
  'prompt contract: must prohibit Coverage top-level in ThemeSpec output'
);

// ===========================================================================
// Report
// ===========================================================================
if (failed) {
  console.error('Theme compiler validation FAILED:');
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log('Theme compiler validation OK: determinism, coverage, mapping, font safety, base.css regression, non-blocking proof verified');