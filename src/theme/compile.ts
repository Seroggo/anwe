/**
 * Deterministic ANWE Theme Compiler (ThemeSpec v0.1 -> ANWE CSS variables).
 *
 * Boundary of responsibility (see docs/THEME_SPEC_V0_1.md):
 * - Consumes an already-normalized ThemeSpec; does NOT choose fallbacks,
 *   reinterpret the brief, or normalize RGB/HSL/named colors.
 * - Maps structured values to ANWE CSS custom properties.
 * - Turns ResponsiveLength objects into CSS clamp(min, preferred, max).
 * - Assembles structured card_border / card_shadow into CSS declarations.
 * - Deterministic: the same ThemeSpec always compiles to byte-identical CSS.
 *
 * Self-contained: no relative imports, so Node 24 type-stripping can load it
 * directly from a .mjs validator (`import { compileTheme } from '../src/theme/compile.ts'`)
 * and Astro/Vite can load it extensionless from a .astro component.
 */

// ---------------------------------------------------------------------------
// Types (erasable; mirror contracts/theme-spec.schema.json)
// ---------------------------------------------------------------------------

export type ResponsiveLength = string | { readonly min: string; readonly preferred: string; readonly max: string };

export interface TypographyRole {
  readonly size: ResponsiveLength;
  readonly weight: number;
  readonly line_height: number;
  readonly tracking: string;
}

export interface ThemeSpecColors {
  readonly canvas: string;
  readonly surface: string;
  readonly surface_muted: string;
  readonly text: string;
  readonly text_muted: string;
  readonly primary: string;
  readonly primary_hover: string;
  readonly on_primary: string;
  readonly accent: string;
  readonly on_accent: string;
  readonly inverse: string;
  readonly inverse_text: string;
  readonly line: string;
  readonly focus: string;
  readonly accent_palette: readonly string[];
}

export interface ThemeSpecTypography {
  readonly font_display: string;
  readonly font_body: string;
  readonly font_mono: string;
  readonly display: TypographyRole;
  readonly heading: TypographyRole;
  readonly body: TypographyRole;
  readonly eyebrow: TypographyRole;
}

export interface ThemeSpecSpacing {
  readonly density: string;
  readonly section: ResponsiveLength;
  readonly content: ResponsiveLength;
  readonly block_gap: ResponsiveLength;
}

export interface ThemeSpecShape {
  readonly card_radius: string;
  readonly panel_radius: string;
  readonly button_radius: string;
}

export interface CardBorder {
  readonly width: string;
  readonly color_role: string;
}

export interface CardShadow {
  readonly x: string;
  readonly y: string;
  readonly blur: string;
  readonly spread: string;
  readonly color: string;
  readonly opacity: number;
}

export interface ThemeSpecEffects {
  readonly card_border: CardBorder | null;
  readonly card_shadow: CardShadow | null;
}

export interface ThemeSpecMetadata {
  readonly name: string;
  readonly description?: string;
  readonly interpreter_skill: string;
  readonly interpreter_version: string;
}

export interface ThemeSpecDecision {
  readonly id: string;
  readonly source_type: string;
  readonly decision: string;
  readonly evidence: readonly string[];
  readonly reason: string;
}

export interface ThemeSpec {
  readonly schema_version: string;
  readonly theme_id: string;
  readonly metadata: ThemeSpecMetadata;
  readonly colors: ThemeSpecColors;
  readonly typography: ThemeSpecTypography;
  readonly spacing: ThemeSpecSpacing;
  readonly shape: ThemeSpecShape;
  readonly effects: ThemeSpecEffects;
  readonly decisions: readonly ThemeSpecDecision[];
}

export interface CompiledDeclaration {
  readonly name: string;
  readonly value: string;
}

export interface CompiledTheme {
  readonly themeId: string;
  readonly selector: string;
  readonly declarations: readonly CompiledDeclaration[];
  readonly css: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COLOR_ORDER: readonly (Exclude<keyof ThemeSpecColors, 'accent_palette'>)[] = [
  'canvas',
  'surface',
  'surface_muted',
  'text',
  'text_muted',
  'primary',
  'primary_hover',
  'on_primary',
  'accent',
  'on_accent',
  'inverse',
  'inverse_text',
  'line',
  'focus'
];

const COLOR_TOKEN: Record<Exclude<keyof ThemeSpecColors, 'accent_palette'>, string> = {
  canvas: '--color-canvas',
  surface: '--color-surface',
  surface_muted: '--color-surface-muted',
  text: '--color-text',
  text_muted: '--color-text-muted',
  primary: '--color-primary',
  primary_hover: '--color-primary-hover',
  on_primary: '--color-on-primary',
  accent: '--color-accent',
  on_accent: '--color-on-accent',
  inverse: '--color-inverse',
  inverse_text: '--color-inverse-text',
  line: '--color-line',
  focus: '--color-focus'
};

const TYPOGRAPHY_ROLES: readonly string[] = ['display', 'heading', 'body', 'eyebrow'];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertThemeSpecShape(spec: unknown): asserts spec is ThemeSpec {
  if (!isObject(spec)) {
    throw new Error('compileTheme: spec must be an object');
  }
  const required: readonly (keyof ThemeSpec)[] = [
    'schema_version',
    'theme_id',
    'metadata',
    'colors',
    'typography',
    'spacing',
    'shape',
    'effects',
    'decisions'
  ];
  for (const key of required) {
    if (!(key in spec)) {
      throw new Error(`compileTheme: missing required ThemeSpec field "${key}"`);
    }
  }
  if (typeof spec.theme_id !== 'string' || spec.theme_id.length === 0) {
    throw new Error('compileTheme: theme_id must be a non-empty string');
  }
  if (!isObject(spec.colors) || !isObject(spec.typography) || !isObject(spec.spacing) || !isObject(spec.shape) || !isObject(spec.effects)) {
    throw new Error('compileTheme: colors/typography/spacing/shape/effects must be objects');
  }
}

function responsiveLengthToCss(value: ResponsiveLength): string {
  if (typeof value === 'string') {
    return value;
  }
  return `clamp(${value.min}, ${value.preferred}, ${value.max})`;
}

function hexToRgb(hex: string): { readonly r: number; readonly g: number; readonly b: number } {
  // The contract guarantees lowercase #rrggbb; the compiler preserves, never normalizes.
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function shadowToCss(shadow: CardShadow): string {
  const { r, g, b } = hexToRgb(shadow.color);
  return `${shadow.x} ${shadow.y} ${shadow.blur} ${shadow.spread} rgba(${r}, ${g}, ${b}, ${shadow.opacity})`;
}

function borderToCss(border: CardBorder | null): string {
  if (border === null) {
    return '0';
  }
  // color_role is const "line" in v0.1; reference the resolved line token at runtime.
  return `${border.width} solid var(--color-line)`;
}

// ---------------------------------------------------------------------------
// Compiler
// ---------------------------------------------------------------------------

export function compileTheme(spec: ThemeSpec, options?: { readonly selector?: string }): CompiledTheme {
  assertThemeSpecShape(spec);

  const selector =
    options && options.selector !== undefined && options.selector.length > 0
      ? options.selector
      : `html[data-theme="${spec.theme_id}"]`;

  const declarations: CompiledDeclaration[] = [];
  const push = (name: string, value: string): void => {
    declarations.push({ name, value });
  };

  // --- Colors (fixed declaration order, contract-preserved values) ---
  for (const key of COLOR_ORDER) {
    push(COLOR_TOKEN[key], spec.colors[key] as string);
  }
  const palette: readonly string[] = spec.colors.accent_palette;
  for (let i = 0; i < palette.length; i++) {
    push(`--color-accent-palette-${i + 1}`, palette[i]);
  }

  // --- Typography: font stacks ---
  push('--font-display', spec.typography.font_display);
  push('--font-body', spec.typography.font_body);
  push('--font-mono', spec.typography.font_mono);

  // --- Typography: roles (size / weight / line-height / tracking) ---
  const roles: ReadonlyArray<readonly [string, TypographyRole]> = TYPOGRAPHY_ROLES.map((name) => {
    const role = spec.typography[name as 'display' | 'heading' | 'body' | 'eyebrow'] as TypographyRole;
    return [name, role] as const;
  });
  for (const [roleName, role] of roles) {
    push(`--${roleName}-size`, responsiveLengthToCss(role.size));
    push(`--${roleName}-weight`, String(role.weight));
    push(`--${roleName}-line-height`, String(role.line_height));
    push(`--${roleName}-tracking`, role.tracking);
  }

  // --- Spacing (density is a descriptor only; no CSS consumer in v0.1) ---
  push('--space-section', responsiveLengthToCss(spec.spacing.section));
  push('--space-content', responsiveLengthToCss(spec.spacing.content));
  push('--space-block-gap', responsiveLengthToCss(spec.spacing.block_gap));

  // --- Shape ---
  push('--radius-card', spec.shape.card_radius);
  push('--radius-panel', spec.shape.panel_radius);
  push('--radius-button', spec.shape.button_radius);

  // --- Effects (structured -> CSS) ---
  push('--border-card', borderToCss(spec.effects.card_border));
  push('--shadow-card', spec.effects.card_shadow === null ? 'none' : shadowToCss(spec.effects.card_shadow));

  const body = declarations.map((d) => `  ${d.name}: ${d.value};`).join('\n');
  const css = `${selector} {\n${body}\n}\n`;

  return { themeId: spec.theme_id, selector, declarations, css };
}