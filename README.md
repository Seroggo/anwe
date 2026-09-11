# ANWE Project

ANWE is a permanent project for reusable website structure and assembly tooling. Its canonical root is `C:\Project_all\anwe`.

The repository contains the reusable `SiteBlueprint` library for business-site structure. The current runtime MVP validates the lower assembly layer independently: a fixed vocabulary of reusable blocks, a theme, and a JSON page description are assembled by a generic Astro renderer into static HTML.

## Current MVP runtime

- Astro with TypeScript and plain CSS;
- static output with minimal client JavaScript;
- 11 generic blocks in `src/components/blocks/`;
- explicit block registry in `src/renderer/`;
- three manually adapted themes: `editorial-pastel`, `cinematic-dark`, `color-block`;
- synthetic JSON fixtures only; no ANMA, SMD, SiteContext, or SiteBlueprint page composition.

Reusable components contain no site-specific business content. Fixture data lives in `tests/fixtures/`, and theme values are separated from shared block styles.

## Run and verify

```bash
npm install
npm run dev
npm run check
npm run build
```

## Demo matrix

The index route lists the complete matrix: `/`. Each controlled layout is rendered with every theme:

- `/demo/a/editorial-pastel/`, `/demo/a/cinematic-dark/`, `/demo/a/color-block/`
- `/demo/b/editorial-pastel/`, `/demo/b/cinematic-dark/`, `/demo/b/color-block/`
- `/demo/c/editorial-pastel/`, `/demo/c/cinematic-dark/`, `/demo/c/color-block/`

The fixtures deliberately cover different block orders and structural variants while keeping the same generic block vocabulary.

## SiteBlueprint checks

Blueprint contracts, templates, and documentation remain in their existing `blueprints/`, `contracts/`, `templates/`, and `docs/` layers. `npm run check` continues to validate their JSON syntax and registry relationships alongside the Block Library fixtures.
