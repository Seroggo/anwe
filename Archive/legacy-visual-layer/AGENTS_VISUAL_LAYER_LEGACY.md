# AGENTS_VISUAL_LAYER_LEGACY.md — Archived Visual Layer Design

> ## LEGACY / NON-CANONICAL / NOT EXECUTABLE
>
> This document preserves **abandoned pre-MVP automation design** for the ANWE
> Automatic Visual Layer. It is intentionally **NOT canonical** and **NOT executable**.
>
> - Agents **MUST NOT** execute anything described in this document.
> - The current canonical pipeline is defined **only** by the **root `AGENTS.md`**.
> - **No file under `archive/` participates in the current pipeline** in any way.
>
> This material is kept for historical / future reference only. Treat every design
> decision below as abandoned, even where it looks plausible or well-reasoned.

---

The former automatic Visual Layer ideology is **not** part of the ANWE MVP.

MVP automatically builds only a working structured "fish":

```text
SiteContext
→ SiteModel
→ Machine Layer
→ Human Layer
→ Theme
→ Review Build
→ STOP
```

All final visual refinement is performed manually by a human operator through
Harness / CLI after inspecting the Review Build. Former automatic Visual Layer
automation (icon selection, visual slot classification, media scan / prompt /
generation / binding, media manifests, resolvers, autonomous composition, automatic
alt text, autonomous visual polish) is **not** reconstructed in the active pipeline.

This document archives the old architecture verbatim for reference. It is preserved,
not executed.

---

# Archived content from root AGENTS.md (pre-MVP)

Everything below is reproduced from the pre-MVP AGENTS.md Visual Layer material and is
**archived / non-executable**.

---

## A. Old AI-first canonical order (with Visual Layer / QA)

The old canonical layer order was:

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

This ordering included an automatic Visual Layer and a QA/Final Assembly stage between
Human Layer and Human Review. **Neither is part of the MVP pipeline.**

---

## B. Old canonical production pipeline diagram (Stage 4 + Stage 5)

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

In the current MVP this diagram is reduced to:

```text
Sites/<site-id>/SITE_CONTEXT.json
 ↓ STAGE 1 — SITE MODEL BUILD
Sites/<site-id>/SITE_MODEL.json
 ↓ STAGE 2 — MACHINE LAYER
Sites/<site-id>/MACHINE_SPEC.json
 ↓ STAGE 3 — HUMAN LAYER
Generic Astro runtime
 ↓ STAGE 4 — THEME
Sites/<site-id>/THEME_SPEC.json
 ↓ REVIEW BUILD
STOP — HUMAN OPERATOR REFINEMENT
```

No Stage 4B, no Stage 4C, no automatic Visual Layer.

---

## C. Old general execution rule for Visual Layer

Old rule 10 from the general execution rules:

> 10. Visual Layer не добавляет business claims.

And old rule 11:

> 11. Generated visual не считается proof.

These were framed around an automatic Visual Layer producing generated media and are
obsolete as executable rules. **Visual Layer does not exist as an automatic stage in MVP.**

---

## D. STAGE 4 — VISUAL LAYER (umbrella) — ARCHIVED

```text
Visual Layer состоит из трёх частей:

A. Theme / Design System
B. Visual Slot Classification
C. Image Media Resolution / Generation
```

ANWE used the Lucide library through:

```text
@lucide/astro
src/components/Icon.astro
```

Icons were described as part of the Visual Layer that must not be forgotten during
final assembly. **In MVP, icon selection is an explicit human operator choice; the
automatic Visual Layer no longer runs.**

---

## E. STAGE 4A — THEME / DESIGN SYSTEM (retained reframed)

The ThemeSpec stage is retained in the MVP pipeline as **STAGE 4 — THEME** (see root
`AGENTS.md`). Historical description of the old combined stage:

```text
## Purpose
Преобразовать business/brand context и reference в ThemeSpec.

## Прочитать
contracts/theme-spec.schema.json
docs/THEME_SPEC_V0_1.md
methodology/designer.theme.interpret.md
prompts/designer.theme.interpret.json
checklist-registries/designer.theme.interpret-registry.md

## Input
SiteContext
SiteModel
brand/reference data

## Output
sites/<site-id>/THEME_SPEC.json

ThemeSpec должен быть применён production runtime через deterministic Theme Compiler.
Если ThemeSpec создаётся, но production mechanism его применения отсутствует — STOP и зафиксировать blocker.
```

Theme is **kept** but now defined as **only** theme/design system — it does **not**
include images, icons, media, visual slot planning, asset generation, or visual content
selection.

---

## F. STAGE 4B — VISUAL SLOT CLASSIFICATION — ARCHIVED

### Purpose (old)

Пройти все blocks/items SiteModel и определить роль визуала.

Для каждого поддерживаемого visual slot выбрать ровно одно:

```text
IMAGE
ICON
NONE
```

### IMAGE (old)

IMAGE использовался, когда изображение реально помогает:

- показать продукт;
- показать производство;
- показать объект/результат;
- поддержать visual narrative;
- дать контекст, который нельзя передать одной иконкой.

IMAGE дальше обрабатывался Image Media Resolution / Generation stage.

### ICON (old)

ICON использовался, когда нужен компактный semantic visual marker:

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

### NONE (old)

NONE использовался, когда:

- визуал не добавляет смысла;
- блок уже достаточно выразителен текстом/типографикой;
- иконки создают визуальный шум;
- изображение будет декоративным filler без функции.

### Icon placement rules (old)

Иконки не являются business proof.

Они должны:

- поддерживать смысл, а не украшать каждый элемент;
- быть визуально консистентными на странице;
- использовать одну icon family — Lucide;
- не заменять понятный текст;
- не содержать brand/logo imitation;
- иметь decorative `aria-hidden`, если текст уже передаёт значение.

Текущие generic components поддерживали icons как минимум в:

```text
Cards.items[].icon
Steps.items[].icon
```

Для `contacts` block рекомендовалось использовать Lucide для типов контактов:

```text
Phone
Mail
MapPin
MessageCircle / Send — только по реальному типу канала
```

Для CTA submit/action icon допускался semantic Lucide icon, если это улучшает affordance,
но текст кнопки остаётся обязательным.

### SiteModel / Visual boundary (old)

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

### Acceptance (old 4B)

- каждый релевантный visual slot классифицирован как IMAGE / ICON / NONE;
- ICON slots разрешены валидными Lucide names;
- нет самодельных SVG при наличии подходящей Lucide icon;
- иконки используются последовательно и не перегружают страницу;
- IMAGE slots переданы в следующий media stage;
- NONE остаётся без декоративного filler.

---

## G. STAGE 4C — IMAGE MEDIA RESOLUTION / GENERATION — ARCHIVED

### Purpose (old)

Для каждого media slot сначала попытаться использовать существующие реальные media, и только если подходящих нет — сгенерировать недостающие.

Канонический принцип:

```text
existing real media first
generation only for missing slots
```

### Input (old)

```text
SiteContext
SiteModel
MachineSpec
ThemeSpec
sites/<site-id>/media/
```

### 4B.1. Media scan (old — automatic media scan)

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

### 4B.2. Canonical filename (old — canonical media filename logic)

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

### 4B.3. Existing arbitrary filenames (old)

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

### 4B.4. Generation rules (old — automatic prompt generation + image generation)

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

### 4B.5. Media priority (old — REAL > GENERATED > PLACEHOLDER)

Финальная сборка использует:

```text
REAL > GENERATED > PLACEHOLDER
```

То есть:

1. если существует подходящий canonical `__real` — использовать его;
2. иначе использовать canonical `__generated`;
3. иначе оставить visual placeholder и зафиксировать issue.

Так реальная фотография позже автоматически заменяет generated media без перестройки SiteModel.

### 4B.6. Acceptance (old 4C)

- все media slots рассмотрены;
- для каждого выбран `REAL`, `GENERATED` или unresolved placeholder;
- real media использованы при наличии;
- недостающие media сгенерированы;
- canonical filenames соблюдены;
- assets лежат в `sites/<site-id>/media/`;
- mapping slot → file однозначен.

После acceptance перейти к QA / Final Assembly.

---

## H. Old media slot identification (from STAGE 1.5 Media slots) — ARCHIVED

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

**This media-slot identification was designed to feed the automatic Visual Layer. It is
not an MVP requirement** — media placeholders may remain unresolved placeholders after the
Review Build.

---

## I. STAGE 5 — QA / FINAL ASSEMBLY (visual + media portions) — ARCHIVED

### Purpose (old)

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

### 5.1. Media binding (old)

QA/final assembly:

- связывает canonical media filenames с их slots;
- применяет выбранные Lucide icons к icon slots;
- проверяет, что icon names валидны для `Icon.astro`;
- соблюдает приоритет `real > generated > placeholder`;
- проверяет crop/aspect;
- проверяет alt;
- проверяет broken files;
- не перестраивает SiteModel без необходимости.

### 5.2. UX hygiene (old)

На этом этапе добавлялся минимальный современный UX baseline:

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

### 5.3. Form wiring (old)

Form shell уже должен существовать из SiteModel/Human Layer.

QA stage подключает transport.

Если отдельный transport не задан, default strategy:

```text
send form to confirmed email destination
```

Если реального destination email нет:

- не отправлять на placeholder;
- форма остаётся видимой в Review Build;
- transport остаётся `unwired`;
- deploy получает explicit blocker/warning до получения реального destination.

Нельзя показывать fake success, если фактическая отправка не произошла.

### 5.4. Placeholder handling (old)

Review Build может содержать явно маркированные placeholders.

Перед deploy агент обязан перечислить:

- placeholder contacts;
- placeholder legal data;
- unresolved media;
- unwired form transport.

### 5.5. QA verification (old — visual-specific QA obligations)

Обязательно проверить:

#### Desktop
- layout;
- sticky header;
- anchors;
- media;
- icons;
- forms;
- no overflow.

#### Mobile
- navigation;
- tap targets;
- form fields;
- media crop;
- no horizontal overflow;
- back-to-top placement.

#### Keyboard/accessibility
- skip link;
- navigation;
- CTA;
- form;
- contact links;
- back-to-top;
- focus states.

#### Runtime
- build;
- no broken links;
- no broken media;
- no critical console errors;
- no unexpected network calls.

### 5.6. Canonical QA package (old)

Должны существовать canonical QA/assembly instructions и scripts/tools.

Если package отсутствует — STOP.

Для browser-level checks предпочтительно использовать готовые OSS tools, например Playwright,
вместо собственного browser automation engine.

**In MVP there is no canonical QA package requirement, no forced STOP for missing QA, and no
Playwright / automated QA introduction.**

---

## J. STAGE 6 — HUMAN REVIEW GATE (old Review Packet fields) — ARCHIVED

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

**The field distinguishing `real` / `generated` media presupposed the automatic Visual
Layer. In MVP media stays unresolved and no real/generated distinction is produced by the
automatic pipeline.**

---

## K. STAGE 10 — old Definition of Done — ARCHIVED

Old ANWE pipeline считался завершённым для сайта, когда:

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

Главный критерий (old):

> воспроизводимо превращать готовый SiteContext в production-ready AI-first сайт
> с минимальным ручным вмешательством.

**This old DoD required resolved/generated media, automatic icon completion, QA assembly
package, form wiring, and production-ready output with minimal human intervention. None of
those are MVP requirements. The current MVP DoD is defined only by root `AGENTS.md`.**

---

# END OF ARCHIVED MATERIAL

Everything above is **legacy / non-canonical / non-executable**. The only canonical,
executable pipeline for ANWE is defined by the **root `AGENTS.md`**. No file under
`archive/` participates in the current pipeline.
