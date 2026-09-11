# ANWE Project

ANWE is a permanent project and repository. Its canonical root is `C:\Project_all\anwe`.

The current development stage is the `SiteBlueprint` library: reusable knowledge describing how a site for a business type should be structured.

## Структура

```text
blueprints/
  core/         универсальная основа
  archetypes/   типы бизнеса
  patterns/     повторяемые задачи сайта
  verticals/    отраслевые расширения

contracts/
  site-blueprint.schema.json

templates/
  site-blueprint.template.json

sites/
  anma/
    SITE_CONTEXT_ANMA_V1_APPROVED.md

docs/
  BLUEPRINT_GUIDE.md

tasks/
  00-site-blueprints.md
```

## Стартовые vertical blueprint

- `vertical.smd-contract-manufacturing`
- `vertical.interior-stair-manufacturing`
- `vertical.ad-banner-resizer`
- `vertical.agent-native-websites`

Перед работой прочитать `AGENTS.md`.

Текущий SiteContext ANMA находится в `sites/anma/SITE_CONTEXT_ANMA_V1_APPROVED.md`.

Проверка файлов:

```bash
npm run check
```
