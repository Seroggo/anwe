# AGENTS.md — ANWE MVP Production Pipeline

## 1. Назначение

`AGENTS.md` — канонический исполняемый сценарий сборки сайта в ANWE MVP.

ANWE получает готовый `SiteContext` и автоматически собирает работающий тематизированный Review Build.

Канонический порядок:

```text
SiteContext
    ↓
SiteModel
    ↓
Machine Layer
    ↓
Human Layer
    ↓
Theme
    ↓
Review Build
    ↓
STOP — Human Operator Refinement
```

После `Review Build` автоматический production pipeline завершён. Дальнейшие изменения выполняются по явным командам человека-оператора.

---

# 2. Основные принципы MVP

## 2.1. AI-first

После SiteModel сначала строится Machine Layer.

Принцип:

```text
machine interpretation first
human presentation second
```

Machine Layer определяет:

- primary entity;
- offers/services;
- relationships;
- page roles;
- metadata;
- structured data;
- canonical structure;
- internal semantic relationships.

Human Layer реализует ту же структуру в человекочитаемом интерфейсе.

Machine-readable представление должно соответствовать реально видимому содержимому сайта.

---

## 2.2. HTML-first

Автоматически собранный сайт должен быть визуально полноценным без обязательных внешних media assets.

Основной визуальный язык ANWE MVP:

- типографика;
- spacing;
- surfaces;
- cards;
- steps;
- stats;
- lists;
- grids;
- badges/chips, если поддерживаются runtime;
- semantic icons;
- простые process/data compositions;
- lightweight HTML/CSS/inline-SVG primitives, поддерживаемые generic runtime.

Визуальная подача должна помогать:

- быстро сканировать страницу;
- видеть иерархию сообщений;
- понимать процесс;
- выделять доказательства;
- различать предложения и ситуации спроса;
- находить CTA.

SiteModel и Human Layer должны стремиться к законченной HTML-native композиции.

---

## 2.3. Meaning-first

Структура страницы определяется смыслом, а не декоративным наполнением.

Каждый block должен выполнять отдельную задачу:

- объяснять предложение;
- раскрывать ситуацию спроса;
- показывать процесс;
- подтверждать claim;
- снимать возражение;
- вести к conversion;
- давать контактную информацию.

Визуальная форма подбирается под эту смысловую функцию.

---

## 2.4. Operator-led finish

После Review Build человек принимает финальные редакторские и визуальные решения.

Оператор может:

- заменить текст;
- изменить block variant/surface;
- поменять порядок или состав blocks;
- добавить или заменить semantic icon;
- вставить operator media block;
- заменить HTML-native block на operator media block;
- добавить реальный media asset;
- оставить media placeholder для последующего заполнения;
- выполнить pre-deploy доработку.

Каждая такая команда является локальной правкой текущего сайта.

---

## 2.5. Context discipline

Для обычного production stage рабочим контекстом являются только файлы, явно перечисленные в разделе `Прочитать` этого stage.

Дополнительный файл открывается только когда:

- текущий canonical file прямо на него ссылается;
- runtime import/reference ведёт к нему;
- validator/build error указывает на него;
- текущая задача явно требует его изменить.

При локальной операторской правке агент работает с указанным site/block/item и минимальным набором файлов, необходимых для этого изменения.

---

## 2.6. Scope discipline

Выполняй текущую задачу до её acceptance criteria.

Если задача — полный rebuild, проходи canonical stages последовательно до Review Build.

Если задача — локальная операторская правка, выполняй только эту правку и применимые проверки.

Если текущий contract/runtime не позволяет выполнить конкретную правку, укажи точный технический blocker и файл/поле, которое его создаёт.

---

## 2.7. Positive specification

Исполняемые инструкции описывают только актуальное целевое состояние и действия, необходимые для его получения.

Формат задачи агенту:

```text
контекст
→ вход
→ конкретное действие
→ ожидаемый output
→ acceptance checks
→ STOP
```

Исторические решения, альтернативные архитектуры и не относящиеся к текущей задаче механизмы в исполняемый prompt не включаются.

Если действие не требуется для получения указанного output, оно не описывается в задаче.

Git history сохраняет предыдущие состояния архитектуры; текущие canonical instructions содержат только действующую модель.

---

# 3. Граница production pipeline

Production pipeline ANWE начинается с:

```text
sites/<site-id>/SITE_CONTEXT.json
```

`SiteContext` уже содержит утверждённый business/marketing context.

Upstream-работы — исследование рынка, сегментация, позиционирование, U&A, JTBD, CustDev, конкурентный анализ и другие маркетинговые процессы — завершаются до входа в этот pipeline.

Если business truth требует изменения, изменение сначала вносится в canonical upstream context.

---

# 4. Canonical MVP pipeline

```text
sites/<site-id>/SITE_CONTEXT.json
        ↓
STAGE 0 — PRE-FLIGHT
        ↓
STAGE 1 — SITE MODEL BUILD
        ↓
sites/<site-id>/SITE_MODEL.json
        ↓
STAGE 2 — MACHINE LAYER
        ↓
sites/<site-id>/MACHINE_SPEC.json
        ↓
STAGE 3 — HUMAN LAYER
        ↓
Generic Astro runtime
        ↓
STAGE 4 — THEME
        ↓
sites/<site-id>/THEME_SPEC.json
        ↓
REVIEW BUILD
        ↓
STOP — HUMAN OPERATOR REFINEMENT
```

---

# 5. Site-specific artifacts

Для каждого сайта используется:

```text
sites/<site-id>/
```

Canonical artifacts автоматического pipeline:

```text
sites/<site-id>/
├── SITE_CONTEXT.json
├── SITE_MODEL.json
├── MACHINE_SPEC.json
└── THEME_SPEC.json
```

Site-specific facts и copy хранятся в site artifacts, а не в generic renderer/components.

---

# 6. Общие правила исполнения

1. Проходи stages в canonical order.
2. Перед stage прочитай его canonical files.
3. Используй SiteContext как источник business facts.
4. Используй SiteModel как источник page/block/copy/conversion structure.
5. Используй MachineSpec как источник machine-readable semantics.
6. Human Layer faithfully реализует SiteModel + MachineSpec.
7. Theme отвечает за design tokens и presentation system.
8. HTML-native visual presentation является нормальным конечным состоянием Review Build.
9. Новые business claims появляются только из canonical business context.
10. После изменений выполняй применимые validators/build checks.
11. Новый generic capability вводится только после подтверждённой потребности реального сайта.
12. История решений хранится в Git; root canonical files описывают только текущую архитектуру.

---

# STAGE 0 — PRE-FLIGHT

## Input

```text
sites/<site-id>/SITE_CONTEXT.json
```

## Прочитать

```text
contracts/site-context.schema.json
docs/SITE_CONTEXT_V0_1.md
methodology/site.context.build.md
```

## Проверить

- input существует;
- JSON валиден;
- соответствует SiteContext contract;
- `context_id` стабилен;
- данных достаточно для meaningful site.

## Acceptance

SiteContext принят как canonical input текущего build.

---

# STAGE 1 — SITE MODEL BUILD

## Purpose

Преобразовать SiteContext в render-ready модель сайта.

```text
SiteContext
    ↓
site.model.build
    ↓
SiteModel
```

## Прочитать

```text
contracts/site-model.schema.json
docs/SITE_MODEL_V0_1.md
methodology/site.model.build.md
prompts/site.model.build.json
checklist-registries/site.model.build-registry.md
schemas/input/site.model.build.json
schemas/output/site.model.build.json
```

## Input

```text
sites/<site-id>/SITE_CONTEXT.json
```

## Output

```text
sites/<site-id>/SITE_MODEL.json
```

## Ответственность SiteModel

SiteModel определяет:

- pages;
- block structure;
- block order;
- factual copy;
- navigation;
- conversion UI;
- contacts UI;
- semantic visual presentation;
- structural placeholders для обязательных production-shell данных.

## HTML-first rule

SiteModel по умолчанию проектирует страницу так, чтобы она выглядела завершённой средствами HTML-native block library.

При выборе block structure приоритет имеют конструкции, которые сами несут визуальный ритм и смысл:

```text
hero
text
cards
steps
stats
faq
cta
contacts
header
footer
и другие generic HTML-native blocks, поддерживаемые текущим contract/runtime
```

Для visual presentation SiteModel может использовать поддерживаемые semantic icons и HTML-native visual primitives, определённые текущим contract.

Внешний media asset не является обязательным условием полноценного блока.

## Production shell

Для commercial site сохраняются структурно необходимые элементы:

- contacts;
- conversion CTA;
- form shell, когда primary conversion требует lead/request/contact;
- confirmed values, если они известны;
- contract-defined placeholders для обязательных данных, если они пока неизвестны.

Form без подключённого transport остаётся структурной частью Review Build в состоянии, разрешённом contract.

## Block economy

Каждый block выполняет отдельную смысловую функцию.

Предпочитай:

- меньше blocks;
- выше information density;
- ясную hierarchy;
- естественный visual rhythm;
- прямой путь к conversion.

## Acceptance

- SiteModel проходит schema validation;
- проходит semantic validation;
- internal anchors/paths валидны;
- block ids стабильны;
- conversion scaffold присутствует, когда нужен;
- contacts scaffold присутствует для commercial site;
- HTML-native presentation образует полноценную страницу;
- status соответствует issues;
- output сохранён в canonical path.

После acceptance перейти к Machine Layer.

---

# STAGE 2 — MACHINE LAYER / AI-FIRST SEO-GEO

## Purpose

Построить machine-readable интерпретацию сайта из SiteContext + SiteModel.

```text
SiteContext
+
SiteModel
    ↓
site.machine.build
    ↓
MachineSpec
```

## Прочитать

```text
contracts/machine-spec.schema.json
docs/MACHINE_SPEC_V0_1.md
methodology/site.machine.build.md
prompts/site.machine.build.json
checklist-registries/site.machine.build-registry.md
schemas/input/site.machine.build.json
schemas/output/site.machine.build.json
```

## Input

```text
sites/<site-id>/SITE_CONTEXT.json
sites/<site-id>/SITE_MODEL.json
```

## Output

```text
sites/<site-id>/MACHINE_SPEC.json
```

## Responsibilities

Минимум:

- primary entity;
- entity type;
- grounded services/offers;
- entity/service relationships;
- page semantic role;
- title;
- meta description;
- canonical path strategy;
- robots directives;
- sitemap membership;
- OpenGraph/basic sharing metadata where supported;
- Organization structured data;
- relevant Service structured data;
- breadcrumbs for multi-page sites;
- internal semantic relationships;
- SEO/GEO/AEO machine-readable representation.

Machine semantics должны соответствовать реально представленному в SiteModel visible content.

## Acceptance

- MachineSpec соответствует contract;
- metadata корректны;
- canonical strategy согласована;
- Organization/Service data grounded;
- service/page relationships соответствуют visible SiteModel;
- sitemap/robots plan валиден;
- structured data не содержит unsupported claims;
- entity naming consistent.

После acceptance перейти к Human Layer.

---

# STAGE 3 — HUMAN LAYER

## Purpose

Детерминированно превратить SiteModel + MachineSpec в semantic HTML/UI.

```text
SiteModel
+
MachineSpec
    ↓
generic renderer
    ↓
Astro site
```

## Прочитать

```text
sites/<site-id>/SITE_MODEL.json
sites/<site-id>/MACHINE_SPEC.json
src/renderer/
src/components/
src/components/blocks/
src/layouts/
src/styles/
```

## Required behavior

Human Layer:

- сохраняет page/block order;
- переносит block ids в HTML ids;
- реализует MachineSpec metadata/structured semantics;
- рендерит factual copy из SiteModel;
- рендерит conversion/contact scaffolds;
- реализует HTML-native visual presentation из SiteModel;
- использует generic reusable components;
- поддерживает semantic HTML;
- сохраняет site-specific business content вне generic components.

## HTML-native visual presentation

Human Layer является renderer для лёгкого визуального языка ANWE.

Используются поддерживаемые generic primitives:

- typography hierarchy;
- surfaces;
- grids;
- cards;
- steps/process structures;
- stats;
- lists/checklists;
- semantic icons;
- badges/chips;
- lightweight connectors/separators;
- простые diagrammatic compositions.

Каждый primitive остаётся обычным DOM/HTML/CSS/inline-SVG представлением и адаптируется responsive layout средствами runtime.

## Acceptance

- route HTTP 200;
- blocks rendered in order;
- MachineSpec реализован в HTML/layout;
- HTML-native visual presentation отображается корректно;
- contacts присутствуют;
- form shell присутствует, когда задан SiteModel;
- desktop/mobile structural integrity;
- anchors работают;
- build проходит.

После acceptance перейти к Theme.

---

# STAGE 4 — THEME

## Purpose

Преобразовать business/brand context в ThemeSpec и применить его к generic runtime.

```text
SiteContext
+
SiteModel
    ↓
designer.theme.interpret
    ↓
ThemeSpec
    ↓
Theme Compiler
```

## Прочитать

```text
contracts/theme-spec.schema.json
docs/THEME_SPEC_V0_1.md
methodology/designer.theme.interpret.md
prompts/designer.theme.interpret.json
checklist-registries/designer.theme.interpret-registry.md
```

## Input

```text
sites/<site-id>/SITE_CONTEXT.json
sites/<site-id>/SITE_MODEL.json
```

## Output

```text
sites/<site-id>/THEME_SPEC.json
```

## Responsibilities

Theme определяет presentation system:

- colors;
- typography;
- spacing;
- shape;
- effects;
- surface treatment;
- supported visual tokens.

Theme применяется deterministic Theme Compiler.

## Acceptance

- ThemeSpec соответствует contract;
- Theme Compiler применяет его к runtime;
- HTML-native visual primitives используют theme tokens;
- output сохранён в canonical path;
- themed site builds successfully.

После acceptance перейти к Review Build.

---

# REVIEW BUILD

Review Build — конечный результат автоматического ANWE MVP pipeline.

Он должен:

- рендерить SiteModel;
- применять MachineSpec;
- применять ThemeSpec;
- выглядеть цельно без обязательных внешних media assets;
- иметь рабочую page hierarchy;
- иметь conversion/contact scaffolds;
- использовать HTML-native visual language;
- проходить существующие canonical validators/build checks.

Review Build является рабочей «рыбой», готовой к операторской доводке.

После успешного Review Build:

```text
STOP
```

---

# HUMAN OPERATOR REFINEMENT — OUTSIDE AUTOMATIC PIPELINE

После Review Build человек просматривает сайт и даёт конкретные команды. Это постоянный operator-managed lifecycle для сайта, в том числе после первой production публикации. Последующие локальные изменения выполняются как локальные правки текущего сайта; они не запускают automatic pipeline повторно.

Примеры:

```text
smd → situations/item-02 → icon CircuitBoard

smd → hero → replace title with "..."

smd → production/item-03 → delete

smd → after engineering → add operator media block
```

Агент выполняет указанную локальную правку и сохраняет остальную структуру без изменений.

---

## Operator Media Block

Media добавляется человеком как отдельное структурное решение после Review Build.

Operator Media Block может быть:

```text
media only
```

или:

```text
media + HTML text
```

или:

```text
placeholder + HTML text
```

Оператор может:

- вставить Media Block между существующими blocks;
- заменить существующий block на Media Block;
- указать конкретный media asset;
- создать Media Block с placeholder и заполнить его позже.

Смысловой текст остаётся HTML content блока.

Примеры операторских команд:

```text
smd → replace engineering with media block
media: main_smd.png
title: "..."
body: "..."

smd → after proof → add media block placeholder
title: "Производство"
body: "..."
```

Для точной команды агент использует указанные оператором значения и вносит минимальное структурное изменение.

---

# PRE-DEPLOY

Pre-deploy выполняется по отдельной команде после операторской доводки и может повторяться после любых последующих локальных изменений — как до первой публикации, так и после неё.

Минимальный цикл:

```text
operator refinement
    ↓
existing checks/build
    ↓
desktop/mobile human review
    ↓
contacts/forms/content review
    ↓
explicit deploy approval
```

Конкретные production integrations подключаются отдельными задачами.

### Analytics Layer v0.1

По явной команде «Добавь слой аналитики. Яндекс Метрика: <ID>. GA4: <ID>» подключи generic providers к текущему сайту после Review Build и до deploy. Прочитай [`docs/ANALYTICS.md`](docs/ANALYTICS.md), `contracts/analytics-events.json` и `contracts/analytics-spec.schema.json`; изучи SiteModel/Human Layer, создай `sites/<site-id>/ANALYTICS_SPEC.json` со стабильными bindings, выполни `npm run check:analytics` и `npm run build`, затем верни Analytics Deployment Report с mappings и оставшимися настройками целей/key events в аккаунтах. Эта интеграция не меняет автоматический pipeline и не запускает deploy.

---

# DEPLOY

Deploy — отдельное явное действие оператора для текущего approved локального состояния сайта. Целевая команда:

```text
Deploy <site-id>
```

Команда может выполняться для первой публикации и повторно для production updates. Deploy не запускает полный SiteContext → SiteModel → Machine Layer → Human Layer → Theme pipeline. Editable source of truth остаётся в локальном ANWE repository; production hosting содержит опубликованный runtime state.

Детальный deployment contract: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

После Review Build automatic pipeline останавливается. До отдельной явной команды `Deploy <site-id>` публикация не выполняется; deployment и последующие production updates остаются operator-managed действиями вне automatic pipeline.

---

# 7. Open-source first policy

Перед созданием новой generic capability:

1. проверь существующий ANWE runtime;
2. проверь доступные mature OSS components/libraries;
3. оцени architecture fit, dependency cost и complexity;
4. reuse/adapt, когда это проще текущей реализации;
5. создавай новый generic subsystem после подтверждённого gap.

---

# 8. SiteBlueprint position

`blueprints/` — reusable knowledge library.

Canonical runtime input текущего production pipeline:

```text
SiteContext
```

SiteBlueprint влияет на runtime только через явно определённый contract.

---

# 9. Repository responsibilities

```text
blueprints/              reusable website knowledge
contracts/               machine-readable contracts
schemas/                 stage I/O wrappers
methodology/             AI decision logic
prompts/                 executable AI-stage prompts
checklist-registries/    stage coverage registries
docs/                    human-readable current contracts/guides
scripts/                 deterministic tooling
src/                     Astro runtime / renderer / components
sites/<site-id>/         site-specific artifacts and operator assets
tests/                   fixtures/tests
```

Canonical files текущей архитектуры должны описывать текущий pipeline и его действующие contracts.

---

# 10. Definition of Done — Automatic MVP Build

Automatic ANWE build завершён, когда:

```text
approved SiteContext
        ↓
valid SiteModel
        ↓
valid MachineSpec
        ↓
working Human Layer
        ↓
valid ThemeSpec
        ↓
working themed HTML-first Review Build
        ↓
STOP
```

Главный критерий:

> ANWE воспроизводимо превращает утверждённый SiteContext в работающий AI-first / HTML-first коммерческий сайт-«рыбу», который визуально полноценен сам по себе и быстро доводится человеком до production качества.
