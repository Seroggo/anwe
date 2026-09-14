# SiteContext v0.1

## Purpose

`SiteContext` — это normalized source of business truth for ANWE. Он оптимизирован не под полноту корпоративной базы знаний, а под точную автоматическую сборку AI-first сайта: идентичность сущности, предложения, аудитории, ситуации спроса, маркетинговые сообщения, доказательства, ограничения и конверсионное действие.

Human-readable storytelling здесь вторичен.

```text
unstructured business input
        ↓
site.context.build
        ↓
SiteContext JSON
        ↓
SiteModel + Theme Interpreter + Visual Skill
```

Формальный контракт — `contracts/site-context.schema.json`. Версия фиксируется значением `"0.1"` в `schema_version`.

## Boundary of responsibility

Skill `site.context.build` извлекает, нормализует и дедуплицирует бизнес-контекст
из неструктурированного входа. Он **не** запускает новые research-источники
(маркетинговые исследования, CustDev, анализ конкурентов, SEO-аналитику) и **не**
проектирует сайт.

SiteContext хранит нормализованный бизнес-контекст и трассировку inference.
Он не хранит:

- SiteModel, архитектуру страниц, выбор блоков;
- ThemeSpec, дизайн-решения, цвета, шрифты;
- текст страниц, иконки, изображения;
- результаты CustDev, MetaCustDev, конкурентного анализа;
- SEO-ключевые слова и content-маркетинговые планы.

Если эти данные уже присутствуют во входе — skill может нормализовать их как
бизнес-контекст (например, готовые офферы или терминологию), но не запускает новый
research и не принимает дизайн-решений.

## AI-first design

SiteContext особенно хорошо отвечает на вопросы следующего слоя:

```text
Что это за компания / сущность?
Что она продаёт?
Кому?
В каких ситуациях возникает спрос?
Какую задачу решает?
Почему выбирают её?
Какие доказательства существуют?
Какие возражения надо снять?
Какое действие должен совершить посетитель?
Какие утверждения обязательны?
Какие утверждения запрещены или не подтверждены?
Какая терминология описывает бизнес однозначно?
```

Эти вопросы первичны; декоративное brand storytelling — нет.

## Top-level structure

SiteContext v0.1 имеет ровно эти top-level поля:

```text
schema_version
context_id
business
offers
audiences
demand_situations
positioning
proof
objections
conversion
content
brand
constraints
semantic_identity
decisions
data_gaps
```

Каждый фиксированный объект использует `additionalProperties: false`.
`context_id` — это lowercase kebab-case slug, соответствующий
`^[a-z0-9]+(?:-[a-z0-9]+)*$`.

## Principle: fact vs inference vs gap

Skill обязан разделять три класса утверждений:

```text
SOURCE_EXPLICIT   — input прямо сообщает факт.
SOURCE_INFERRED   — значение нормализовано или логически выведено из
                    нескольких явных данных; попадает в decisions[].
DATA_GAP          — критичные данные отсутствуют; попадает в data_gaps[].
CONFLICT          — источники противоречат друг другу; фиксируется явно
                    и приводит к data_gap[] с пометкой источников.
```

Нельзя использовать `LLM_GUESS`, `BEST_PRACTICE`, `INDUSTRY_ASSUMPTION`
как основание факта.

## Critical input fields

Skill обязан попытаться определить хотя бы минимальный набор, чтобы вернуть
непустой SiteContext. Минимум:

```text
business.entity_type
ИЛИ
offers[0].name
```

Во всех остальных случаях skill возвращает максимально полный SiteContext
и фиксирует недостающие поля в `data_gaps[]` со статусом `critical/important/minor`
и коротким вопросом к человеку.

## Scope of normalization

Skill:

- нормализует дублирующиеся факты, оставляя одно canonical значение;
- фиксирует явные противоречия между источниками;
- нормализует терминологию в `semantic_identity` без добавления новых фактов;
- не выбирает дизайн, не пишет копирайтинг, не генерирует изображения;
- не запускает новые research-источники.

## Conflict logic

Если `sources[]` противоречат друг другу:

- нельзя молча выбрать одно значение;
- конфликт фиксируется в `methodology/conflict handling`;
- в `data_gaps[]` добавляется gap с описанием противоречия;
- если более authoritative source можно установить только из явного контекста
  `sources[]` (например, официальный brief против черновых заметок) — он
  используется и попадает в `decisions[]` как `SOURCE_EXPLICIT`;
- нельзя выдумывать source authority.
