# ANWE Project Map

`C:\Project_all\anwe` is the permanent ANWE project root and Git root. Development stages do not create new project roots.

## Canonical Structure

```text
C:\Project_all\anwe\
├── .git\
├── .editorconfig
├── .gitignore
├── AGENTS.md
├── README.md
├── PROJECT_MAP.md
├── CHANGELOG.md
├── package.json
├── package-lock.json
├── astro.config.mjs
├── tsconfig.json
├── blueprints\
├── contracts\
├── templates\
├── sites\
│   └── anma\
│       └── SITE_CONTEXT_ANMA_V1_APPROVED.md
├── docs\
├── scripts\
├── src\
├── tests\
│   └── fixtures\
└── tasks\
```

## Directory Responsibilities

- `blueprints/` — reusable SiteBlueprint knowledge.
- `contracts/` — machine-readable contracts.
- `templates/` — reusable templates.
- `sites/<site-id>/` — data for a specific site.
- `docs/` — current working documentation only.
- `scripts/` — deterministic tooling.
- `src/` — Astro runtime: generic block components, renderer, layouts, data, styles, and themes.
- `tests/fixtures/` — controlled JSON page fixtures and the layout/theme demo matrix.
- `tasks/` — current development tasks.
- `astro.config.mjs` — static Astro build configuration.
- `tsconfig.json` — TypeScript configuration for the Astro runtime.
- `package-lock.json` — locked npm dependency graph.

The current ANMA SiteContext is `sites/anma/SITE_CONTEXT_ANMA_V1_APPROVED.md`.

Historical materials are outside the repository in `C:\Project_all\_archive\anwe` and are non-normative. Future directories are not created until the corresponding development stage begins.
