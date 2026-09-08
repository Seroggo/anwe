# ANWE Project

Репозиторий текущего этапа разработки ANWE: библиотека `SiteBlueprint`.

`SiteBlueprint` — формализованная переиспользуемая схема того, как должен быть устроен сайт определённого типа бизнеса.

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

Проверка файлов:

```bash
npm run check
```
