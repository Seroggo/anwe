# AGENTS.md — ANWE Production Pipeline

## 1. Назначение

`AGENTS.md` — канонический исполняемый сценарий сборки сайта в ANWE.

Агент получает на вход готовый `SiteContext` и обязан пройти pipeline строго по порядку.

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
Visual Layer
    ↓
QA / Final Assembly
    ↓
Human Review
    ↓
Deploy
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

# 4. Канонический production pipeline

```text
sites/<site-id>/SITE_CONTEXT.json
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
raw working Astro site
        ↓
STAGE 4 — VISUAL LAYER
   ├── Theme / design system
   ├── visual slot scan: IMAGE / ICON / NONE
   ├── resolve icons from Lucide library
   ├── reuse existing real media
   ├── prompt missing image media
   └── generate missing image media
        ↓
sites/<site-id>/THEME_SPEC.json
sites/<site-id>/media/
        ↓
STAGE 5 — QA / FINAL ASSEMBLY
   ├── final media binding
   ├── UX hygiene
   ├── form wiring
   ├── responsive QA
   ├── accessibility QA
   └── runtime/build QA
        ↓
REVIEW BUILD
        ↓
STAGE 6 — HUMAN REVIEW GATE
        ↓ approved
STAGE 7 — DEPLOY
        ↓
production site
        ↓
STAGE 8 — POST-DEPLOY
   ├── analytics
   ├── extra integrations
   └── iterative optimization
```

До Human Review Gate сайт не считается готовым к deploy.

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
├── media/
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
10. Visual Layer не добавляет business claims.
11. Generated visual не считается proof.
12. QA может исправлять implementation/UX defects, но не менять business truth.
13. Если downstream получил новые реальные данные, которых раньше не было, замени соответствующий placeholder, не перестраивая сайт без необходимости.
14. Generic capability сначала ищи:
    - в текущем ANWE;
    - затем на GitHub;
    - затем в других OSS-каталогах.
15. Новый subsystem создавай только если готовое решение не подходит.
16. После изменений выполняй применимые validators/build checks.
17. Historical materials вне текущего repository non-normative, если явно не указано обратное.

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

---

## 1.2. Production-shell rule

Для коммерческого сайта нельзя удалять важный UI только потому, что соответствующая downstream-функция ещё не подключена.

Принцип:

```text
SiteModel   = размечено место под розетку
Human Layer = розетка физически установлена
QA/Wiring   = к ней подведены провода
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

Пример:

```json
{
  "id": "contacts",
  "type": "contacts",
  "variant": "default",
  "surface": "default",
  "content": {
    "title": "Контакты",
    "phone": {
      "value": "+7 (000) 000-00-00",
      "href": "tel:+70000000000",
      "status": "placeholder"
    },
    "email": {
      "value": "example@mail.test",
      "href": "mailto:example@mail.test",
      "status": "placeholder"
    },
    "address": null,
    "messengers": [],
    "legal": {
      "name": null,
      "inn": null,
      "ogrn": null
    }
  }
}
```

Статусы:

```text
confirmed
placeholder
```

Если later-stage агент получает реальные данные, он заменяет конкретные поля:

```text
placeholder
→ confirmed
```

без перестройки блока.

ИНН/ОГРН не выдумывать.

Если их нет — `null`.

Если они присутствуют в разрешённом источнике и переданы агенту — подставить.

Placeholder contact values предназначены для review/build scaffold.

Production deploy должен явно сигнализировать о незаменённых placeholders.

---

## 1.4. CTA / Form — обязательный scaffold для lead/quote сценария

Если primary conversion связан с:

- заявкой;
- консультацией;
- запросом расчёта;
- передачей проекта;
- квалифицированным lead;

SiteModel должен содержать form shell.

Пример:

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

Конкретный набор полей определяется SiteContext и типом conversion.

Если transport ещё не подключён:

```text
transport_status = unwired
```

SiteModel всё равно должен содержать форму.

---

## 1.5. Media slots

Все slots, которым Visual Layer должен подобрать или создать media, должны иметь стабильный semantic id.

Минимальная идентификация:

```text
page-id
block-id
slot-id
```

Например:

```text
home / hero / media
home / engineering / media
home / gallery / item-01
```

Visual Layer использует эти ids для filenames и дальнейшей финальной сборки.

---

## 1.6. Acceptance

- SiteModel проходит schema validation;
- проходит semantic validation;
- internal anchors/paths валидны;
- block ids стабильны;
- conversion scaffold присутствует, когда нужен;
- contacts scaffold присутствует для commercial site;
- media slots однозначно идентифицируемы;
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

Допустимы deterministic scripts/tools для:

- sitemap;
- robots;
- schema serialization;
- validation.

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
- media placeholders остаются placeholders до Visual Layer;
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

После acceptance перейти к Visual Layer.

---

# STAGE 4 — VISUAL LAYER

Visual Layer состоит из трёх частей:

```text
A. Theme / Design System
B. Visual Slot Classification
C. Image Media Resolution / Generation
```

ANWE уже использует библиотеку Lucide через:

```text
@lucide/astro
src/components/Icon.astro
```

Иконки являются частью Visual Layer и не должны забываться при финальной сборке.

---

# STAGE 4A — THEME / DESIGN SYSTEM

## Purpose

Преобразовать business/brand context и reference в ThemeSpec.

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

---

# STAGE 4B — VISUAL SLOT CLASSIFICATION

## Purpose

Пройти все blocks/items SiteModel и определить роль визуала.

Для каждого поддерживаемого visual slot выбрать ровно одно:

```text
IMAGE
ICON
NONE
```

### IMAGE

Использовать, когда изображение реально помогает:

- показать продукт;
- показать производство;
- показать объект/результат;
- поддержать visual narrative;
- дать контекст, который нельзя передать одной иконкой.

IMAGE дальше обрабатывается Image Media Resolution / Generation stage.

### ICON

Использовать, когда нужен компактный semantic visual marker:

- capability card;
- demand-situation card;
- process step;
- contact method;
- feature;
- secondary action;
- compact service item.

Иконку выбирать только из установленной библиотеки Lucide:

```text
@lucide/astro
src/components/Icon.astro
```

Не рисовать собственные SVG и не генерировать raster icon, если Lucide уже выражает нужный смысл.

Icon name должен быть валидным Lucide name, который реально принимает `Icon.astro`.

### NONE

Использовать, когда:

- визуал не добавляет смысла;
- блок уже достаточно выразителен текстом/типографикой;
- иконки создают визуальный шум;
- изображение будет декоративным filler без функции.

---

## Icon placement rules

Иконки не являются business proof.

Они должны:

- поддерживать смысл, а не украшать каждый элемент;
- быть визуально консистентными на странице;
- использовать одну icon family — Lucide;
- не заменять понятный текст;
- не содержать brand/logo imitation;
- иметь decorative `aria-hidden`, если текст уже передаёт значение.

Текущие generic components уже поддерживают icons как минимум в:

```text
Cards.items[].icon
Steps.items[].icon
```

Новые generic blocks должны использовать ту же библиотеку там, где это оправдано.

Для будущего `contacts` block рекомендуется использовать Lucide для типов контактов:

```text
Phone
Mail
MapPin
MessageCircle / Send — только по реальному типу канала
```

Для CTA submit/action icon допускается semantic Lucide icon, если это улучшает affordance,
но текст кнопки остаётся обязательным.

---

## SiteModel / Visual boundary

Raw `site.model.build` не выбирает Lucide names.

На выходе raw SiteModel visual slots остаются unresolved:

```text
icon = null
media.src = null
```

Visual Layer разрешает эти slots позже.

Visual Layer может заполнять только зарезервированные visual fields:

```text
icon
media.src
media.alt
```

Он не меняет:

- block type;
- block order;
- factual copy;
- business claims;
- page architecture.

Если contract raw SiteModel запрещает ненулевой `icon`, runtime/contract должен быть
расширен так, чтобы raw builder по-прежнему выдавал `null`, а Visual Layer мог
легально заполнить зарезервированный slot перед final assembly.

---

## Acceptance

- каждый релевантный visual slot классифицирован как IMAGE / ICON / NONE;
- ICON slots разрешены валидными Lucide names;
- нет самодельных SVG при наличии подходящей Lucide icon;
- иконки используются последовательно и не перегружают страницу;
- IMAGE slots переданы в следующий media stage;
- NONE остаётся без декоративного filler.

---

# STAGE 4C — IMAGE MEDIA RESOLUTION / GENERATION

## Purpose

Для каждого media slot сначала попытаться использовать существующие реальные media, и только если подходящих нет — сгенерировать недостающие.

Канонический принцип:

```text
existing real media first
generation only for missing slots
```

---

## Input

```text
SiteContext
SiteModel
MachineSpec
ThemeSpec
sites/<site-id>/media/
```

---

## 4B.1. Media scan

Для каждого media slot:

```text
есть подходящее реальное изображение в media/ ?
        │
        ├── да
        │   ↓
        │ использовать его
        │
        └── нет
            ↓
        создать prompt
            ↓
        отправить в image generation model/tool
            ↓
        сохранить результат в media/
```

Агент должен просмотреть уже существующие файлы `media/`.

Если реальный файл подходит slot по содержанию — использовать его вместо генерации.

---

## 4B.2. Canonical filename

Имя файла должно однозначно указывать, куда media вставляется.

Формат:

```text
<page-id>__<block-id>__<slot-id>__<source>.<ext>
```

где:

```text
source = real | generated
```

Примеры:

```text
home__hero__media__real.jpg
home__engineering__media__real.jpg
home__production__item-01__generated.webp
home__gallery__item-02__generated.webp
```

Block id является обязательной частью filename.

Если у block один media slot, `slot-id` может быть `media`.

Если slots несколько — используются стабильные slot ids:

```text
item-01
item-02
item-03
```

---

## 4B.3. Existing arbitrary filenames

Если пользователь положил:

```text
IMG_3821.jpg
line-final.jpg
photo5.png
```

Visual agent должен:

1. оценить изображение;
2. определить, подходит ли оно конкретному slot;
3. если подходит — сохранить/скопировать его под canonical filename с `__real`;
4. исходный файл можно сохранить.

---

## 4B.4. Generation rules

Если подходящего real media нет:

1. прочитать контекст блока;
2. использовать SiteContext;
3. использовать ThemeSpec;
4. написать prompt;
5. вызвать image generation tool/model;
6. сохранить output:

```text
sites/<site-id>/media/
```

с canonical filename:

```text
...__generated.webp
```

Generated image:

- не считается доказательством;
- не должно изображать выдуманного реального клиента;
- не должно изображать неподтверждённое оборудование как факт;
- не должно создавать ложный factual proof.

---

## 4B.5. Media priority

Финальная сборка использует:

```text
REAL > GENERATED > PLACEHOLDER
```

То есть:

1. если существует подходящий canonical `__real` — использовать его;
2. иначе использовать canonical `__generated`;
3. иначе оставить visual placeholder и зафиксировать issue.

Так реальная фотография позже автоматически заменяет generated media без перестройки SiteModel.

---

## 4B.6. Acceptance

- все media slots рассмотрены;
- для каждого выбран `REAL`, `GENERATED` или unresolved placeholder;
- real media использованы при наличии;
- недостающие media сгенерированы;
- canonical filenames соблюдены;
- assets лежат в `sites/<site-id>/media/`;
- mapping slot → file однозначен.

После acceptance перейти к QA / Final Assembly.

---

# STAGE 5 — QA / FINAL ASSEMBLY

## Purpose

Собрать production-like review build из всех предыдущих слоёв.

```text
SiteModel
+
MachineSpec
+
Human Layer
+
ThemeSpec
+
media/
    ↓
QA / Final Assembly
    ↓
Review Build
```

---

## 5.1. Media binding

QA/final assembly:

- связывает canonical media filenames с их slots;
- применяет выбранные Lucide icons к icon slots;
- проверяет, что icon names валидны для `Icon.astro`;
- соблюдает приоритет `real > generated > placeholder`;
- проверяет crop/aspect;
- проверяет alt;
- проверяет broken files;
- не перестраивает SiteModel без необходимости.

---

## 5.2. UX hygiene

На этом этапе добавляется минимальный современный UX baseline.

Обязательно проверить/добавить:

- sticky top navigation where appropriate;
- рабочее mobile menu;
- anchor offset для sticky header;
- back-to-top на длинных страницах;
- keyboard navigation;
- focus-visible states;
- adequate tap targets;
- skip-to-content;
- `prefers-reduced-motion` для motion;
- отсутствие horizontal overflow;
- semantic landmarks;
- понятные hover/active states;
- минимальный JavaScript.

Не добавлять без отдельной задачи:

- сложные animations;
- chatbot;
- SPA router;
- modal framework;
- тяжёлые JS libraries.

---

## 5.3. Form wiring

Form shell уже должен существовать из SiteModel/Human Layer.

QA stage подключает transport.

Если отдельный transport не задан, default strategy:

```text
send form to confirmed email destination
```

Использовать минимальный поддерживаемый implementation.

Если реального destination email нет:

- не отправлять на placeholder;
- форма остаётся видимой в Review Build;
- transport остаётся `unwired`;
- deploy получает explicit blocker/warning до получения реального destination.

Нельзя показывать fake success, если фактическая отправка не произошла.

Позже transport может быть заменён adapter:

- Google Apps Script → Google Sheets;
- FormBee;
- OpenFlow;
- webhook;
- CRM;
- другой approved destination.

---

## 5.4. Placeholder handling

Review Build может содержать явно маркированные placeholders.

Перед deploy агент обязан перечислить:

- placeholder contacts;
- placeholder legal data;
- unresolved media;
- unwired form transport.

Production deploy не должен молча выпускать demo contacts вроде:

```text
+7 (000) 000-00-00
example@mail.test
```

без явного approval.

---

## 5.5. QA verification

Обязательно проверить:

### Desktop
- layout;
- sticky header;
- anchors;
- media;
- icons;
- forms;
- no overflow.

### Mobile
- navigation;
- tap targets;
- form fields;
- media crop;
- no horizontal overflow;
- back-to-top placement.

### Keyboard/accessibility
- skip link;
- navigation;
- CTA;
- form;
- contact links;
- back-to-top;
- focus states.

### Runtime
- build;
- no broken links;
- no broken media;
- no critical console errors;
- no unexpected network calls.

---

## 5.6. Canonical QA package

Должны существовать canonical QA/assembly instructions и scripts/tools.

Если package отсутствует — STOP.

Для browser-level checks предпочтительно использовать готовые OSS tools, например Playwright, вместо собственного browser automation engine.

---

# STAGE 6 — HUMAN REVIEW GATE

До deploy агент обязан подготовить Review Build.

Review packet должен содержать:

- preview URL/path;
- какие stages пройдены;
- какие placeholders остались;
- какие contacts `confirmed`, какие `placeholder`;
- какие media `real`, какие `generated`;
- какой form transport подключён;
- unresolved issues;
- QA/build result.

Без явного approval не переходить к deploy.

---

# STAGE 7 — DEPLOY

## Перед deploy должны быть определены

- hosting target;
- domain/base URL;
- production environment values;
- canonical URL;
- production form destination;
- unresolved placeholder policy.

Deploy должен иметь отдельные canonical instructions.

Если deploy package отсутствует — STOP.

---

## После deploy

Выполнить smoke test:

- HTTP status;
- canonical;
- robots;
- sitemap;
- structured data;
- critical links;
- media;
- form transport;
- mobile viewport.

---

# STAGE 8 — POST-DEPLOY CAPABILITIES

Эти capabilities не обязаны блокировать первый индексируемый релиз, если проект отдельно этого не требует.

---

## Analytics

Предпочтительная архитектура:

```text
ANWE track()
    ↓
dataLayer / adapter
    ↓
GTM
├── Яндекс Метрика
└── GA4

optional:
└── Umami / other OSS analytics
```

Analytics подключается как отдельный capability и не должен менять SiteModel/content architecture.

---

## Conversion integrations

Default email transport позже может быть заменён:

- Google Apps Script → Google Sheets;
- FormBee;
- OpenFlow;
- webhook;
- CRM.

---

# 7. Open-source first policy

Перед разработкой новой generic capability:

1. проверить существующий код ANWE;
2. проверить GitHub;
3. проверить релевантные OSS aggregators;
4. сравнить:
   - license;
   - activity;
   - architecture fit;
   - dependencies;
   - complexity;
5. reuse/adapt/integrate, если это рациональнее;
6. писать своё только при подтверждённом gap.

Уже найденные кандидаты:

- OpenPage — JSON/block rendering;
- AstroBlocks — Astro blocks/media;
- karero/website-builder — end-to-end website pipeline;
- semantic-seo-suite — SILO/topical map/GEO;
- Seite — AI-native static sites / MCP;
- Umami / Plausible — analytics;
- form-to-google-sheets — Apps Script/Sheets;
- FormBee / OpenFlow — richer form backends.

Не добавлять dependency только потому, что проект существует.

Сначала оценить fit.

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
```

Если появляется новая AI decision stage, у неё должны быть явно определены:

- input;
- output;
- methodology;
- prompt;
- registry/validation where useful.

Если stage детерминированный — не создавай AI skill без необходимости.

Используй:

```text
runtime/script + concise canonical guide
```

---

# 10. Definition of Done

ANWE pipeline считается завершённым для сайта, когда:

```text
SiteContext
    ↓
validated SiteModel
    ↓
Machine Layer
    ↓
complete Human Layer
    ↓
Theme + resolved/generated media
    ↓
QA + UX + form wiring
    ↓
approved Review Build
    ↓
Deploy
    ↓
production smoke check
```

Главный критерий ANWE:

> воспроизводимо превращать готовый SiteContext в production-ready AI-first сайт с минимальным ручным вмешательством.
