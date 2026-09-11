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
├── blueprints\
├── contracts\
├── templates\
├── sites\
│   └── anma\
│       └── SITE_CONTEXT_ANMA_V1_APPROVED.md
├── docs\
├── scripts\
└── tasks\
```

## Directory Responsibilities

- `blueprints/` — reusable SiteBlueprint knowledge.
- `contracts/` — machine-readable contracts.
- `templates/` — reusable templates.
- `sites/<site-id>/` — data for a specific site.
- `docs/` — current working documentation only.
- `scripts/` — deterministic tooling.
- `tasks/` — current development tasks.

The current ANMA SiteContext is `sites/anma/SITE_CONTEXT_ANMA_V1_APPROVED.md`.

Historical materials are outside the repository in `C:\Project_all\_archive\anwe` and are non-normative. Future directories are not created until the corresponding development stage begins.
