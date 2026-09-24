# ANWE_STUDIO_DESIGN_REFERENCE

## Primary reference

Use:

`VoltAgent/awesome-design-md/design-md/intercom/DESIGN.md`

GitHub:
https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/intercom/DESIGN.md

## Why this reference fits ANWE Studio landing

The landing needs to feel:

- calm, credible, B2B;
- warm rather than sterile;
- editorial rather than “tech demo”;
- conversion-focused;
- strong on product/result preview;
- lightweight and HTML-first;
- suitable for a simple URL + email form;
- visually coherent without raster imagery.

The Intercom reference matches this well:

- warm cream canvas instead of pure white;
- charcoal typography and CTAs;
- white lifted cards on cream;
- restrained 12–16 px radii;
- almost no shadows;
- product/mockup cards as the main visual proof;
- strong typography hierarchy;
- native form and FAQ patterns;
- good mobile collapse rules.

## What to reuse

### Overall atmosphere

Warm editorial B2B.

Use a soft warm canvas with white content cards and dark typography.

### Hero

Large but not theatrical headline.

Keep the hero text-led.

Primary CTA should be dark and visually dominant.

Do not add decorative AI graphics.

### Product preview

Use the `product-mockup-card` idea for the audit example.

This should become the main visual object near the top of the page:

```text
Проблема
Почему это важно
Приоритет
Что изменить
```

The “product” is the quality of the diagnosis, so show it as a report/result card.

### Diagnostic criteria

Use simple white cards on the warm canvas.

No illustration is required.

### Before / After

Use two restrained surfaces or one split card.

Avoid decorative diagrams.

### Process

Use a simple three-step row / stack.

Use semantic icons only if they improve scanning.

### FAQ

Use the reference's simple FAQ rows with hairline separators.

### Form

White card on cream background.

Two primary fields:

```text
URL
Email
```

One dark primary CTA.

### Footer

Keep simple and compact.

## What NOT to inherit

Do not copy Intercom branding.

Do not use:

- Intercom wordmark;
- Fin branding;
- Fin Orange as a generic CTA;
- AI-product styling;
- report palette as site-level brand colors;
- customer-logo marquees unless real proof exists;
- product screenshots that do not exist.

The reference is for visual grammar, not brand identity.

## Font adaptation

Do not depend on proprietary Saans.

Use:

`Inter`

or

`Geist Sans`

Recommended:

- headings: weight 500;
- body: weight 400;
- tighter tracking on large headlines;
- normal tracking on body.

## Color adaptation

Keep the Intercom-like surface logic:

```text
warm cream canvas
white cards
charcoal text
charcoal CTA
soft warm borders
```

Do not introduce an accent color until ANWE Studio's brand palette is intentionally defined.

A monochrome/warm-neutral first version is acceptable.

## Radius / depth

Use:

- buttons / inputs: 8 px;
- cards: 12 px;
- main result-preview card: 16 px.

Avoid:

- extreme pills;
- glassmorphism;
- gradients;
- heavy drop shadows.

Depth should come from:

```text
cream canvas
→ white card
→ hairline border
```

## Mobile

The landing must remain single-column and conversion-first.

On mobile:

- hero headline scales down substantially;
- result-preview card appears immediately after hero / recognition;
- criteria cards stack;
- process steps stack;
- form fields are full width;
- CTA target height >= 44 px.

## Reference priority

If any design rule conflicts with the landing's content hierarchy:

`landing meaning and conversion > reference aesthetics`

The reference must adapt to the page, not the page to the reference.
