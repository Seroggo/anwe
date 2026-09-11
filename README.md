# ANWE Block Library Alpha

ANWE Block Library Alpha is a small Astro static showcase for a fixed vocabulary of reusable website blocks. Pages are JSON descriptions assembled by one generic renderer and can be rendered with any of the three manual themes.

## Run the demo

```bash
npm install
npm run dev
```

The generated matrix contains nine pages:

- `/demo/a/editorial-pastel/`
- `/demo/a/cinematic-dark/`
- `/demo/a/color-block/`
- `/demo/b/editorial-pastel/`
- `/demo/b/cinematic-dark/`
- `/demo/b/color-block/`
- `/demo/c/editorial-pastel/`
- `/demo/c/cinematic-dark/`
- `/demo/c/color-block/`

## Checks

```bash
npm run check
npm run build
```

The fixture data is deliberately synthetic and uses only the approved generic block vocabulary. Theme CSS is separate from block CSS, so swapping a theme changes the visual language without changing page structure or Astro components.
