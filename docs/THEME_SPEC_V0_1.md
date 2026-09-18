# ThemeSpec v0.1

## Purpose

ThemeSpec is the minimal machine contract between the ANWE Theme Interpreter and the
deterministic Theme Compiler:

```text
Theme Interpreter
        ↓
ThemeSpec
        ↓
deterministic Theme Compiler
        ↓
ANWE CSS variables
```

The formal contract is `contracts/theme-spec.schema.json`. Its version is fixed to
`"0.1"`.

ThemeSpec stores normalized, reusable runtime values. It is not a ThemeBrief, a design
audit, a CSS DSL, or a component styling language.

## Boundary of responsibility

The Interpreter makes design decisions, resolves external inspiration against business
context and authoritative brand constraints, selects safe font stacks, and normalizes
semantic colors before producing ThemeSpec.

ThemeSpec stores only the resulting values plus concise decision traceability. It does
not store the full ThemeBrief, raw reference, coverage, capability gaps, or private
chain-of-thought.

The deterministic Theme Compiler (`src/theme/compile.ts`) consumes already normalized ThemeSpec. It maps structured values to
ANWE CSS variables and structured responsive lengths to CSS `clamp()` where needed. It
does not choose fallbacks, reinterpret the brief, or normalize RGB/HSL/named colors.

## Deterministic Theme Compiler

The production mechanism that applies a ThemeSpec is `src/theme/compile.ts` — a
deterministic, dependency-free function `compileTheme(spec)` that maps every ThemeSpec
field to the ANWE CSS custom properties consumed by `src/styles/base.css` and the block
components. The runtime bridge is `src/theme/ThemeStyle.astro`, which emits the compiled
CSS as an inline `<style>` in the page `<head>`; `SiteLayout` and `PageRenderer` accept an
optional `theme` prop so any page can apply a ThemeSpec through the same generic renderer
used in production.

The compiler emits one CSS block scoped to `html[data-theme-id="<theme_id>"]`. The
selector is always derived only from `theme_id`; there is no caller-supplied selector
option, and the compiler never emits `.block`, `:nth-of-type`, `[data-site=...]`, or any
selector derived from business/site structure. Compiled ThemeSpec runtime uses the
`data-theme-id` namespace, intentionally separate from the legacy manual demo themes
(`html[data-theme="editorial-pastel"|"cinematic-dark"|"color-block"]` in `src/themes/`),
which coexist unchanged during migration:

```text
colors.*           -> --color-*
accent_palette[]   -> --color-accent-palette-1..N
typography fonts   -> --font-display / --font-body / --font-mono
typography roles   -> --{role}-size / -weight / -line-height / -tracking
spacing.section    -> --space-section
spacing.content    -> --space-content
spacing.block_gap  -> --space-block-gap
spacing.density    -> (descriptor; not emitted)
shape.*            -> --radius-*
card_border        -> --border-card  (null -> none; object -> "<width> solid var(--color-line)")
card_shadow        -> --shadow-card  (null -> none; object -> "<x> <y> <blur> <spread> rgba(r,g,b,opacity)")
ResponsiveLength   -> clamp(min, preferred, max)
```

Determinism guarantee: the same ThemeSpec always compiles to byte-identical CSS,
regardless of JSON key order. Colors are preserved verbatim; the compiler never
normalizes, invents fallbacks, or reinterprets the brief. A synthetic proof route at
`/test/theme-runtime/` and the validators `scripts/check-theme-compiler.mjs` and
`scripts/check-theme-build.mjs` verify the non-blocking rule, determinism, token coverage
and the built runtime output.

## Why Capability Registry Is Wider

The Capability Registry is the canonical list of visual aspects the Interpreter must
consider. It includes evidence quality, reference adaptation, source authority,
accessibility checks, unsupported behaviour, and decisions that may produce
`THEME_CAPABILITY_GAP`.

ThemeSpec contains only normalized values that ANWE should execute. It intentionally
does not create one runtime field for every T001–T079 capability.

| Capability group | Direct ThemeSpec | Indirect ThemeSpec | Interpreter-only | Capability gap |
|---|---|---|---|---|
| Colors | `colors` | Surface roles use colors through fixed mapping | Source authority, palette rationale, contrast evidence | Impossible immutable constraints after documented resolution |
| Typography | `typography` | Font choice and values express character | Reference font analysis, fallback selection rationale | Essential character cannot be approximated by ANWE |
| Spacing & density | `spacing` | Typography and shape jointly affect perceived density | Density rationale and content analysis | Not a v0.1 gap by itself |
| Shape | `shape` | Surface roles inherit radii through runtime | Form-language rationale | Unsupported clipping or masking when essential |
| Effects | `effects` | Colors provide line and shadow color inputs | Decorative-intensity rationale | Scroll mechanics, 3D, morphing, etc. when essential |
| Surfaces | None | Fixed ANWE surface mapping from `colors`, `shape`, `effects` | Surface hierarchy assessment | Unsupported surface behaviour such as essential blur/clipping |
| Reference adaptation | None | `decisions[]` records accepted decisions | External inspiration vs authoritative source handling | Essential reference mechanic unsupported by ANWE |
| Capability gaps | None | None | Classification, severity, preservation strategy | Remains in Theme Interpreter output, never runtime ThemeSpec |

## Top-Level Structure

ThemeSpec v0.1 has exactly these top-level fields:

```text
schema_version
theme_id
metadata
colors
typography
spacing
shape
effects
decisions
```

All fixed objects use `additionalProperties: false`. `theme_id` is a lowercase slug
matching `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Metadata identifies the Interpreter run but
does not duplicate business input:

```text
name
description (optional)
interpreter_skill = designer.theme.interpret
interpreter_version
```

## Colors and Alpha Policy

Every semantic color in `colors`, including every `accent_palette[]` item, must match:

```text
^#[0-9a-f]{6}$
```

Examples:

```text
#5645d4
#0a1530
#ffffff
```

Invalid forms include short/uppercase HEX, RGB/RGBA, HSL/HSLA, named colors,
`transparent`, and alpha HEX.

ThemeSpec does not normalize color input. The Interpreter supplies canonical lowercase
`#RRGGBB`; the deterministic Theme Compiler preserves it and does not normalize it.

Base semantic colors contain no alpha. Effects are the deliberate exception: a shadow
has a hex `color` plus a separate numeric `opacity`. That opacity belongs to
`effects.card_shadow`, not to the semantic palette.

`accent_palette` is an always-present array of zero to six unique additional accent
colors. It stores colors only, never brand names, selectors, block positions, or
site-specific assignment rules.

## Fixed ANWE Surface Mapping

`surfaces` is intentionally not a ThemeSpec runtime object. ANWE already has a fixed
surface vocabulary in `src/renderer/types.ts`:

```text
default
muted
accent
inverse
```

The renderer/theme contract maps those roles as follows:

```text
default
→ colors.surface
→ colors.text
→ colors.text_muted

muted
→ colors.surface_muted
→ colors.text
→ colors.text_muted

accent
→ colors.accent
→ colors.on_accent

inverse
→ colors.inverse
→ colors.inverse_text
```

The mapping is fixed ANWE behaviour, not data repeated in every ThemeSpec. Shape and
effects provide the remaining visual expression of these surfaces.

`base.css` is aligned with the fixed surface mapping: `.surface--accent` consumes
`--color-on-accent` for foreground, muted text and line. The deterministic Theme
Compiler (`src/theme/compile.ts`) emits `--color-on-accent` from `colors.on_accent`,
and `base.css` supplies a `--color-on-accent` default in `:root` so unthemed pages
remain coherent.

## Typography, Lengths, and Spacing

`font_display`, `font_body`, and `font_mono` are ready-to-use, non-empty safe CSS
font-family stacks selected by the Interpreter. ThemeSpec and the Compiler do not choose
font fallbacks.

Each typography role (`display`, `heading`, `body`, `eyebrow`) contains:

```text
size
weight
line_height
tracking
```

Weights are integers from 100 through 900 and do not require a 100-point step.
`line_height` is a positive unitless number. Tracking is a simple signed length in
`px`, `em`, or `rem`, or literal `0`; it is independently chosen for every role.

`SimpleLength` accepts literal `0` or a simple non-negative length in `px`, `rem`,
`em`, `vw`, or `vh`. `ResponsiveLength` is either a `SimpleLength` or a strict object:

```json
{
  "min": "3.2rem",
  "preferred": "8vw",
  "max": "7.5rem"
}
```

The deterministic Theme Compiler, not ThemeSpec, turns the object into `clamp(min, preferred, max)`.
Raw CSS expressions such as `clamp(...)`, `calc(...)`, `min(...)`, and `var(...)` are
not valid ThemeSpec values.

`spacing.density` is a descriptor only. It never calculates `section`, `content`,
`block_gap`, margins, or line-height. All three spacing values are explicit responsive
lengths so density remains a decision descriptor rather than a hidden style generator.

## Shape and Structured Effects

Shape has the minimal executable radii:

```text
card_radius
panel_radius
button_radius
```

Effects do not store raw CSS declarations. `card_border` is either `null` or a strict
object with a simple `width` and `color_role: "line"`; solid is implicit in v0.1.

`card_shadow` is either `null` or a strict object with `x`, `y`, `blur`, `spread`,
hex `color`, and numeric `opacity`. Offsets and spread may be negative; blur may not.
The deterministic Theme Compiler is responsible for assembling that object into CSS shadow syntax.

There is intentionally no panel border or panel shadow in v0.1. The current runtime only
has `--border-card` and `--shadow-card`; new panel effects require a demonstrated runtime
capability requirement rather than a speculative field.

## Decisions and Capability Gaps

`decisions` is a required non-empty array. Every entry has:

```text
id
source_type
decision
evidence[]
reason
```

`source_type` is one of `SOURCE_DERIVED`, `CONTEXT_DERIVED`,
`INTERPRETER_DECISION`, or `FALLBACK`. Evidence and reason are concise traceability for
the accepted decision, not private chain-of-thought.

`THEME_CAPABILITY_GAP` does not enter ThemeSpec. It remains in the Theme Interpreter
output when a substantial requested characteristic cannot be represented by ANWE, such
as essential 3D/WebGL, parallax, SVG morphing, non-standard clipping, or site-specific
decorative mechanics.

## Explicit v0.1 Exclusions

ThemeSpec v0.1 excludes:

- business type, audience, site context, full ThemeBrief, raw reference, coverage, and capability gaps;
- CSS selectors, arbitrary CSS declarations, custom properties supplied by a user, media queries, or raw CSS functions;
- JavaScript, animation, parallax, WebGL, SVG morphing, clip-path, and backdrop-filter rules;
- component-specific, block-specific, site-specific, or nth-of-type styling;
- parent themes, inheritance, and industry presets.

This keeps industrial B2B and beauty themes within one schema while preventing the
contract from becoming a CSS DSL or a collection of industry templates.

## Runtime Mapping

This table compares v0.1 with `src/styles/base.css`, the three current manual themes,
`src/renderer/types.ts`, and the deterministic Theme Compiler (`src/theme/compile.ts`).
Status describes the current CSS variable / runtime consumer.

| ThemeSpec field | Current CSS variable / runtime consumer | Status |
|---|---|---|
| `colors.canvas` | `--color-canvas` | SUPPORTED |
| `colors.surface` | `--color-surface`; `surface--default` | SUPPORTED |
| `colors.surface_muted` | `--color-surface-muted`; `surface--muted` | SUPPORTED |
| `colors.text`, `colors.text_muted` | `--color-text`, `--color-text-muted` | SUPPORTED |
| `colors.primary`, `colors.primary_hover`, `colors.on_primary` | `--color-primary`, `--color-primary-hover`, `--color-on-primary`; primary actions | SUPPORTED |
| `colors.accent` | `--color-accent`; accent surfaces | SUPPORTED |
| `colors.on_accent` | `--color-on-accent`; `.surface--accent` foreground | SUPPORTED |
| `colors.inverse`, `colors.inverse_text` | `surface--inverse` variables | SUPPORTED |
| `colors.line`, `colors.focus` | `--color-line`, `--color-focus` | SUPPORTED |
| `colors.accent_palette` | `--color-accent-palette-1..N`; no universal component consumer | NOT_YET_CONSUMED |
| `typography.font_display`, `font_body`, `font_mono` | `--font-display`, `--font-body`, `--font-mono` | SUPPORTED |
| `typography.display.size`, `heading.size`, `body.size` | `--display-size`, `--heading-size`, `--body-size` | SUPPORTED |
| `typography.eyebrow.size` | `--eyebrow-size` | SUPPORTED |
| Typography role weights | `--display-weight`, `--heading-weight`, `--body-weight`, `--eyebrow-weight` | SUPPORTED |
| Typography role line heights | `--display-line-height`, `--heading-line-height`, `--body-line-height`, `--eyebrow-line-height` | SUPPORTED |
| Typography role tracking | `--display-tracking`, `--heading-tracking`, `--body-tracking`, `--eyebrow-tracking` | SUPPORTED |
| `spacing.density` | Descriptor only; no runtime consumer | NOT_YET_CONSUMED |
| `spacing.section`, `spacing.content` | `--space-section`, `--space-content` | SUPPORTED |
| `spacing.block_gap` | `--space-block-gap`; `.block + .block` | SUPPORTED |
| `shape.card_radius`, `panel_radius`, `button_radius` | `--radius-card`, `--radius-panel`, `--radius-button` | SUPPORTED |
| `effects.card_border` | `--border-card` assembled from `{width, color_role}` | SUPPORTED |
| `effects.card_shadow` | `--shadow-card` assembled from `{x, y, blur, spread, color, opacity}` | SUPPORTED |
| Fixed surface mapping | `Surface` union: default/muted/accent/inverse | SUPPORTED |
| `decisions[]` | Traceability artifact; no CSS consumer | NOT_YET_CONSUMED |

The existing editorial-pastel and cinematic-dark themes are conceptually expressible
through v0.1 values. Color-block's base tokens are also expressible; its additional
`nth-of-type` color rotation is deliberately excluded because ThemeSpec has no
block-specific or selector-specific rules. Its `accent_palette` may carry the additional
colors, but assignment of a color to a particular block remains outside v0.1. Current raw
CSS alpha colors are legacy runtime behaviour, not values that v0.1 accepts as semantic
ThemeSpec colors.
