# AGENTS.md — ANWE MVP Production Pipeline

## 1. Назначение

`AGENTS.md` — канонический исполняемый сценарий сборки сайта в ANWE **MVP**.

Агент получает на вход готовый `SiteContext` и обязан пройти pipeline строго по порядку:

1. SiteContext
2. SiteModel
3. Machine Layer
4. Human Layer
5. Theme
6. Review Build
7. **STOP** — human operator refinement

Для каждого этапа агент должен:

1. определить входной artifact;
2. открыть и прочитать canonical instructions этапа;
3. выполнить этап;
4. сохранить результат в предписанное место;
5. пройти проверки этапа;
6. только после этого переходить дальше.

`AGENTS.md` отвечает на вопросы:

- какой этап выполняется сейчас;
- какие файлы нужно прочитать;
- какой artifact взять на вход;
- какой artifact получить на выходе;
- куда его сохранить;
- какие проверки обязательны;
- когда нужно остановиться.

Конкретные `methodology`, `prompt`, `registry`, `contract`, `script` и runtime-компоненты определяют, **как именно** выполнять соответствующий этап.

---

# 2. Граница ANWE pipeline

ANWE production pipeline начинается **с готового SiteContext**.

RAW business input, исследование рынка, сегментация, позиционирование, U&A, JTBD, CustDev, конкурентный анализ и другие маркетинговые процессы находятся уровнем выше.

Они должны закончиться созданием:

```text
sites/<site-id>/SITE_CONTEXT.json
```

Именно этот файл является входом production pipeline ANWE.

Pipeline не должен самовольно возвращаться к RAW-источникам, PDF, заметкам или маркетинговым исследованиям, если это отдельно не предусмотрено задачей.

Если SiteContext содержит неполные данные, downstream stages должны:

- использовать подтверждённые значения, если они есть;
- использовать разрешённые structural placeholders/scaffolds там, где SiteModel обязан сохранить конструкцию сайта;
- фиксировать gaps;
- не выдумывать business facts.

---

# 3. AI-first принцип

ANWE — AI-first website system.

Поэтому после SiteModel первым downstream-слоем всегда является **Machine Layer**.

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

Принцип:

```text
machine interpretation first
human presentation second
```

Сначала определяется, что сайт означает для поисковых и AI-систем:

- primary entity;
- offers/services;
- relationships;
- page roles;
- metadata;
- structured data;
- canonical structure;
- internal semantic links.

После этого Human Layer реализует ту же структуру в человекочитаемом интерфейсе.

Human Layer не является источником семантики для Machine Layer.

---

# 4. Canonical MVP pipeline

```text
Sites/<site-id>/SITE_CONTEXT.json
        ↓
STAGE 1 — SITE MODEL BUILD
        ↓
Sites/<site-id>/SITE_MODEL.json
        ↓
STAGE 2 — MACHINE LAYER
        ↓
Sites/<site-id>/MACHINE_SPEC.json
        ↓
STAGE 3 — HUMAN LAYER
        ↓
Generic Astro runtime
        ↓
STAGE 4 — THEME
        ↓
Sites/<site-id>/THEME_SPEC.json
        ↓
REVIEW BUILD
        ↓
STOP — HUMAN OPERATOR REFINEMENT
```

**Нет Stage 4B. Нет Stage 4C. Нет автоматического Visual Layer.**

MVP автоматически создаёт только работающую структурированную «рыбу». Все финальные визуальные доработки выполняются вручную человеком через Harness / CLI после инспекции Review Build.

---

# 5. Site-specific artifacts

Для каждого сайта используется папка:

```text
sites/<site-id>/
```

Минимальный набор artifacts:

```text
sites/<site-id>/
├── SITE_CONTEXT.json
├── SITE_MODEL.json
├── MACHINE_SPEC.json
├── THEME_SPEC.json
└── ...
```

`<site-id>` — стабильный технический id проекта.

Site-specific business facts и copy не должны попадать в generic renderer/components.

---

# 6. Общие правила исполнения

1. Не пропускай stages.
2. Не переходи дальше, пока предыдущий stage не дал валидный artifact.
3. Перед каждым stage прочитай перечисленные canonical files.
4. Не заменяй отсутствующий stage собственной ad-hoc логикой.
5. Если обязательный stage package отсутствует:
   - зафиксируй blocker;
   - перечисли, чего не хватает;
   - остановись перед этим stage.
6. `SiteContext` — источник известных business facts.
7. `SiteModel` — источник site structure, blocks, user-facing copy и production shell.
8. `MachineSpec` — источник machine-readable page/entity semantics.
9. Human Layer faithfully реализует SiteModel + MachineSpec.
10. Если downstream получил новые реальные данные, которых раньше не было, замени соответствующий placeholder, не перестраивая сайт без необходимости.
11. Generic capability сначала ищи:
    - в текущем ANWE;
    - затем на GitHub;
    - затем в других OSS-каталогах.
12. Новый subsystem создавай только если готовое решение не подходит.
13. После изменений выполняй применимые validators/build checks.
14. Historical материалы вне текущего repository non-normative, если явно не указано обратное.
15. **Не интерпретируй прямой визуальный выбор оператора как запрос на запуск Autonomous Visual Layer.**

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

- файл существует;
- JSON валиден;
- соответствует SiteContext contract;
- `context_id` стабилен;
- meaningful site возможно построить.

`site.context.build` в рамках этого pipeline автоматически не запускается:

```text
SiteContext уже является входным artifact.
```

Если требуется изменить business truth — вернуть задачу upstream на marketing/context stage.

---

# STAGE 1 — SITE MODEL BUILD

## Purpose

Преобразовать SiteContext в полный render-ready каркас сайта.

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

---

## 1.1. Ответственность SiteModel

SiteModel определяет:

- pages;
- block structure;
- block order;
- factual copy;
- navigation;
- conversion UI;
- contact UI;
- media placeholders;
- structural placeholders для данных, которые могут быть добавлены позже.

SiteModel описывает **готовую конструкцию сайта**, а не только те блоки, для которых уже существуют все внешние данные и integrations.

Media slots в SiteModel остаются unresolved placeholders на выходе pipeline; они не разрешаются автоматически.

---

## 1.2. Production-shell rule

Для коммерческого сайта нельзя удалять важный UI только потому, что соответствующая downstream-функция ещё не подключена.

Принцип:

```text
SiteModel   = размечено место под розетку
Human Layer = розетка физически установлена
Operator    = позже подводит провода
```

Поэтому отсутствие:

- backend;
- form endpoint;
- реального email;
- реального телефона;
- messenger;
- analytics;

не является автоматическим основанием удалить соответствующий UI scaffold.

---

## 1.3. Contacts — обязательный scaffold

Для обычного коммерческого сайта SiteModel должен предусматривать `contacts`.

Contact block существует даже если часть реальных данных пока неизвестна.

Если реальные данные подтверждены и доступны в canonical input — использовать их.

Если данных нет — использовать структурный placeholder там, где это разрешено contract.

Статусы:

```text
confirmed
placeholder
```

ИНН/ОГРН не выдумывать. Если их нет — `null`.

Placeholder contact values предназначены для review/build scaffold.

---

## 1.4. CTA / Form — обязательный scaffold для lead/quote сценария

Если primary conversion связан с заявкой, консультацией, запросом расчёта, передачей проекта или квалифицированным lead — SiteModel должен содержать form shell.

```text
CTA
├── title
├── body
├── form
│   ├── fields[]
│   ├── submit_label
│   └── transport_status
└── media
```

Типичный form shell:

```text
name
company
phone-or-email
message
submit
```

Если transport ещё не подключён:

```text
transport_status = unwired
```

SiteModel всё равно должен содержать форму.

---

## 1.5. Acceptance

- SiteModel проходит schema validation;
- проходит semantic validation;
- internal anchors/paths валидны;
- block ids стабильны;
- conversion scaffold присутствует, когда нужен;
- contacts scaffold присутствует для commercial site;
- status соответствует issues;
- output сохранён в canonical path.

После acceptance перейти к Machine Layer.

---

# STAGE 2 — MACHINE LAYER / AI-FIRST SEO-GEO

## Purpose

Построить первичную machine-readable интерпретацию сайта из SiteContext + SiteModel.

```text
SiteContext
+
SiteModel
    ↓
site.machine.build
    ↓
MachineSpec
```

Machine Layer создаётся **до Human Layer**.

---

## Input

```text
sites/<site-id>/SITE_CONTEXT.json
sites/<site-id>/SITE_MODEL.json
```

## Output

```text
sites/<site-id>/MACHINE_SPEC.json
```

---

## 2.1. Machine Layer responsibilities

Минимум:

- primary entity;
- entity type;
- services/offers;
- entity/service relationships;
- page semantic role;
- title;
- meta description;
- canonical path/url strategy;
- robots directives;
- sitemap membership;
- OpenGraph/basic sharing metadata where appropriate;
- Organization structured data;
- relevant Service structured data;
- breadcrumbs for multi-page site;
- internal semantic relationships;
- SEO/GEO machine-readable representation.

Machine Layer не должен добавлять факты, которых нет в SiteContext/SiteModel.

Structured data должны соответствовать visible content, который позже реализует Human Layer.

---

## 2.2. Canonical stage package

Перед выполнением должны существовать:

```text
contracts/machine-spec.schema.json
docs/MACHINE_SPEC_V0_1.md
methodology/site.machine.build.md
prompts/site.machine.build.json
checklist-registries/site.machine.build-registry.md
schemas/input/site.machine.build.json
schemas/output/site.machine.build.json
```

Допустимы deterministic scripts/tools для sitemap, robots, schema serialization, validation.

Если stage package отсутствует — STOP и зафиксировать blocker.

---

## 2.3. Acceptance

- MachineSpec соответствует contract;
- metadata корректны;
- canonical strategy согласована;
- Organization/Service data grounded;
- sitemap/robots plan валиден;
- structured data не содержит unsupported claims;
- entity naming consistent.

После acceptance перейти к Human Layer.

---

# STAGE 3 — HUMAN LAYER

## Purpose

Детерминированно превратить SiteModel + MachineSpec в человекочитаемый semantic HTML/UI.

```text
SiteModel
+
MachineSpec
    ↓
BlockRenderer / layouts
    ↓
Astro site
```

Human Layer не является отдельным AI marketing skill.

Он faithfully реализует уже принятые upstream решения.

---

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

---

## 3.1. Required behavior

- каждый SiteModel block имеет renderer support;
- порядок blocks сохраняется;
- block ids переходят в HTML ids;
- semantic HTML реализует MachineSpec;
- title/meta/schema hooks не придумываются заново;
- contacts scaffold рендерится;
- phone/email отображаются кликабельными;
- CTA form shell рендерится;
- submit button физически существует;
- absence of backend не удаляет форму;
- media placeholders остаются placeholders (не разрешаются автоматически);
- generic components не содержат site-specific business copy.

---

## 3.2. Acceptance

- route HTTP 200;
- blocks rendered in order;
- MachineSpec реализован в HTML/layout;
- contacts присутствуют;
- form shell присутствует;
- desktop/mobile structural integrity;
- anchors работают;
- build проходит.

После acceptance перейти к STAGE 4 — THEME.

---

# STAGE 4 — THEME

## Purpose

Преобразовать business/brand context и reference в ThemeSpec.

Theme в MVP — **только** дизайн-система / тема. Он **не** включает:

- изображения;
- иконки;
- media;
- планирование визуальных слотов;
- генерацию ассетов;
- выбор визуального контента.

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
SiteContext
SiteModel
brand/reference data
```

## Output

```text
sites/<site-id>/THEME_SPEC.json
```

ThemeSpec должен быть применён production runtime через deterministic Theme Compiler.

Если ThemeSpec создаётся, но production mechanism его применения отсутствует — STOP и зафиксировать blocker.

## Acceptance

- ThemeSpec соответствует contract;
- application через deterministic Theme Compiler работает;
- theme не содержит media/icon/asset resolution;
- output сохранён в canonical path.

После acceptance перейти к REVIEW BUILD.

---

# REVIEW BUILD

После Theme агент создаёт/проверяет работающий Review Build.

Review Build означает только:

- SiteModel рендерится;
- MachineSpec применяется;
- ThemeSpec применяется;
- route работает;
- существующие placeholders остаются видимыми, где не разрешены;
- существующий form scaffold остаётся видимым;
- текущий generic runtime работает;
- стандартные validators/build checks проходят.

Review Build может по-прежнему содержать:

- media placeholders;
- `icon = null`;
- placeholder contacts;
- unwired form;
- незавершённую операторскую доработку.

Это допустимо.

**Автоматический pipeline НЕ должен продолжать пытаться разрешать эти элементы.**

---

# STOP — HUMAN OPERATOR REFINEMENT

Автоматический run `SiteContext → Review Build` **останавливается** здесь.

До deploy pipeline не продолжается автоматически.

---

# HUMAN OPERATOR REFINEMENT — OUTSIDE AUTOMATIC PIPELINE

После Review Build человек ревьюит «рыбу» и даёт явные команды на правку. Это вне автоматического pipeline.

Примеры команд:

```text
Smd → engineering → use image main_smd.png
Smd → situations/item-02 → icon CircuitBoard
Smd → hero → replace title with "."
Smd → production/item-03 → delete
```

Агент выполняет **только явный edit**.

## Critical rule

Если оператор явно предоставляет визуальный выбор, агент **НЕ должен**:

- запускать visual classification;
- инспектировать все media;
- предлагать визуальную архитектуру;
- создавать media manifest;
- проектировать resolver;
- генерировать альтернативные изображения;
- выбирать другую иконку;
- просить автономные visual-planning решения.

**Не превращай прямой запрос на правку в pipeline stage.**

Если выполнение заблокировано текущим контрактом/runtime ограничением:

- сообщи точный технический blocker узко;
- **НЕ** изобретай subsystem для его решения.

---

# IMAGE / VISION RULE

Image understanding — **не обязательная capability** core ANWE MVP агента.

Если оператор даёт точное имя файла изображения, агенту не нужно понимать само изображение, чтобы выполнить явную правку.

- **НЕ** запускай image analysis автоматически.
- **НЕ** проси оператора описать изображение лишь потому, что core model не имеет vision, если точный запрошенный edit реально можно выполнить без этого.
- **НЕ** проектируй автоматическую alt-generation инфраструктуру в `AGENTS.md`.

Alt/accessibility cleanup относится к позднему ручному pre-deploy review, а не к автоматическому визуальному планированию.

---

# PRE-DEPLOY / QA / DEPLOY

Для MVP это **не** автоматический этап и **не** обязательный QA package.

После операторской доработки (по запросу):

- примени минимальный pre-deploy UX, если запрошено;
- выполни существующие npm checks/build;
- человек ревьюит desktop/mobile/forms/contacts/media;
- явное approval на deploy;
- deploy выполняется отдельно.

**Не** требуй canonical QA package.
**Не** останавливайся только потому, что AI QA package не существует.
**Не** внось Playwright или автоматизированный QA в этот patch.

Pre-deploy UX сейчас не реализуется.

---

# DEPLOY

Deploy остаётся **поздним явным действием оператора**.

Автоматический run `SiteContext → Review Build` должен **STOP** перед deploy.

Deploy не является частью обычной rebuild-задачи, если пользователь явно не просит.

---

# 7. Open-source first policy

Перед разработкой новой generic capability:

1. проверить существующий код ANWE;
2. проверить GitHub;
3. проверить релевантные OSS aggregators;
4. сравнить license, activity, architecture fit, dependencies, complexity;
5. reuse/adapt/integrate, если это рациональнее;
6. писать своё только при подтверждённом gap.

Не добавлять dependency только потому, что проект существует. Сначала оценить fit.

---

# 8. SiteBlueprint position

`blueprints/` остаётся reusable knowledge library.

На текущем production pipeline canonical runtime input:

```text
SiteContext
```

Не считать SiteBlueprint автоматически resolved runtime input для `site.model.build`, пока это явно не введено в input contract.

Blueprint не должен скрытно переопределять SiteContext.

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
sites/<site-id>/         site-specific artifacts/media
tests/                   fixtures/tests
Archive/                 archived non-canonical/legacy material (not executable)
```

Если появляется новая AI decision stage, у неё должны быть явно определены input, output, methodology, prompt, registry/validation где полезно.

Если stage детерминированный — не создавай AI skill без необходимости. Используй `runtime/script + concise canonical guide`.

---

# 10. Definition of Done (MVP)

Для **AUTOMATIC ANWE BUILD** done означает:

```text
SiteContext
    ↓
validated SiteModel
    ↓
MachineSpec
    ↓
Generic Human Layer
    ↓
valid ThemeSpec
    ↓
Working themed Review Build
    ↓
STOP
```

Primary criterion:

> ANWE воспроизводимо превращает одобренный SiteContext в работающий темированный сайт-«рыбу»,
> который человек-оператор может быстро доработать до production качества.

MVP явно принимает существенную ручную доработку после того, как «рыба» построена.

Definition of Done **не** требует:

- generated/resolved media;
- автоматическое завершение иконок;
- автономный Visual Layer;
- QA assembly package;
- form wiring;
- production-ready output с минимальным человеческим вмешательством.
