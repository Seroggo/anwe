# AGENTS.md — ANWE Project

## Текущий фокус разработки

Текущий focus разработки — ANWE MVP assembly engine:

```text
Block Library + themes + JSON renderer
```

Правила SiteBlueprint ниже сохраняются для blueprint-файлов.

## SiteBlueprint

`SiteBlueprint` — формализованная переиспользуемая схема того, как должен быть устроен сайт определённого типа бизнеса.

SiteBlueprint описывает:

- для каких типов бизнеса он применим;
- какие сущности должны быть представлены на сайте;
- какие типы страниц обычно нужны;
- какие блоки обычно нужны;
- какие действия пользователя должны поддерживаться;
- какие доказательства и материалы важны;
- какие условия меняют структуру сайта.

SiteBlueprint не содержит фактов конкретной компании: её цен, телефонов, оборудования, географии, сертификатов, кейсов и других индивидуальных данных.

## Архитектура библиотеки

```text
blueprints/
  core/
  archetypes/
  patterns/
  verticals/
```

- `core` — универсальная основа бизнес-сайта.
- `archetypes` — повторяемые типы бизнеса.
- `patterns` — повторяемые задачи и сценарии сайта.
- `verticals` — отраслевая специфика, которую нельзя выразить только через общие archetypes и patterns.

Blueprint может расширять другие blueprint через `extends`.

## Стартовые направления

### 1. SMD / PCB Contract Manufacturing

Класс бизнеса: B2B контрактное производство электроники для компаний, у которых есть собственный электронный продукт и требуется производство печатных плат/электронных сборок.

Характер сайта: технический, доказательный, ориентированный на квалифицированный запрос расчёта. Важны производственные возможности, сложность монтажа, оборудование, контроль качества, требования к проекту, кейсы и подтверждение компетенций.

Базовая композиция:

```text
archetype.manufacturing
+ pattern.quote-request
+ pattern.file-upload
+ pattern.portfolio
+ vertical.smd-contract-manufacturing
```

### 2. Interior Stair Manufacturing

Класс бизнеса: проектное производство интерьерных лестниц на заказ на стыке производства, дизайна и архитектуры.

Характер сайта: визуальный и проектный. Важны портфолио, стили и конструкции, материалы, проектирование, процесс от замера/эскиза до производства и монтажа, доверие к дизайну и качеству исполнения.

Базовая композиция:

```text
archetype.project-manufacturing
+ pattern.quote-request
+ pattern.portfolio
+ pattern.lead-generation
+ vertical.interior-stair-manufacturing
```

### 3. Ad Banner Resizer

Класс бизнеса: digital product / software tool для маркетологов и специалистов по рекламе. Продукт адаптирует рекламные креативы под разные рекламные форматы и размеры.

Характер сайта: продуктовый. Нужно быстро объяснить проблему, ценность, принцип работы, поддерживаемые сценарии/форматы, показать результат, ограничения и привести пользователя к запуску инструмента или другому целевому действию.

Базовая композиция:

```text
archetype.software-product
+ pattern.file-upload
+ pattern.lead-generation
+ vertical.ad-banner-resizer
```

### 4. ANWE Websites for SMB

Класс бизнеса: B2B digital service / productized service по созданию agent-native сайтов для малого и среднего бизнеса.

Характер сайта: объясняющий новый тип продукта. Нужно показать, чем такой сайт отличается от обычного сайта/CMS, как он создаётся и управляется, какие задачи бизнеса решает, для каких компаний подходит, как выглядит процесс запуска и какие есть примеры применения.

Базовая композиция:

```text
archetype.digital-service
+ pattern.lead-generation
+ pattern.quote-request
+ pattern.portfolio
+ vertical.agent-native-websites
```

Подробные ориентиры по каждому направлению находятся в `docs/STARTING_DIRECTIONS.md`.

## Текущая задача

Подготовить и верифицировать reusable SiteBlueprint для четырёх стартовых направлений выше.

При разработке сначала проверяй, можно ли вынести знание в `core`, `archetype` или `pattern`. В `vertical` должна оставаться только специфика вертикали.

## Рабочие правила

1. Перед изменением blueprint прочитать `contracts/site-blueprint.schema.json`, `docs/BLUEPRINT_GUIDE.md` и `docs/STARTING_DIRECTIONS.md`.
2. Не дублировать знание на нескольких уровнях библиотеки без необходимости.
3. Не переносить свойства исходного клиента в reusable blueprint, если они не являются общим свойством класса бизнеса.
4. Не выдавать предположение за факт. Неизвестное оставлять неизвестным.
5. Изменения должны быть минимальными и относиться к текущему blueprint или общему слою, который он действительно требует.
6. Reusable renderer/components must contain no site-specific or fixture-specific business content.
7. После изменений выполнить `npm run check`.
8. Historical materials outside the repository are non-normative and must not be used unless explicitly requested.
