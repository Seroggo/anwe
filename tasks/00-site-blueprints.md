# Task 00 — SiteBlueprint Library

## Цель

Подготовить и верифицировать библиотеку SiteBlueprint для четырёх стартовых направлений ANWE.

Перед началом работы прочитать:

- `AGENTS.md`;
- `contracts/site-blueprint.schema.json`;
- `docs/BLUEPRINT_GUIDE.md`;
- `docs/STARTING_DIRECTIONS.md`.

## Порядок работы

### 1. Общие слои

Проверить и при необходимости скорректировать:

- `core.business-site`
- `archetype.manufacturing`
- `archetype.project-manufacturing`
- `archetype.software-product`
- `archetype.digital-service`
- `pattern.quote-request`
- `pattern.portfolio`
- `pattern.file-upload`
- `pattern.lead-generation`

Общие знания должны находиться на максимально высоком reusable-уровне и не дублироваться в vertical без необходимости.

### 2. Vertical: SMD / PCB Contract Manufacturing

Файл:

`blueprints/verticals/smd-contract-manufacturing.json`

Класс бизнеса: техническое B2B контрактное производство электроники.

Особое внимание:

- production capabilities;
- technologies;
- equipment;
- quality evidence;
- technical requirements;
- quote request;
- project file submission;
- cases.

Исходный проект для проверки применимости: SMD Service.

### 3. Vertical: Interior Stair Manufacturing

Файл:

`blueprints/verticals/interior-stair-manufacturing.json`

Класс бизнеса: проектное производство на стыке инженерии, дизайна и архитектуры.

Особое внимание:

- visual portfolio;
- stair types / solutions;
- materials;
- design process;
- manufacturing and installation process;
- project cases;
- consultation / quote.

### 4. Vertical: Ad Banner Resizer

Файл:

`blueprints/verticals/ad-banner-resizer.json`

Класс бизнеса: специализированный software / digital product для специалистов по рекламе.

Особое внимание:

- product value;
- workflow;
- supported formats / scenarios;
- input/output examples;
- limitations;
- product start / upload action.

### 5. Vertical: ANWE Websites for SMB

Файл:

`blueprints/verticals/agent-native-websites.json`

Класс бизнеса: B2B digital service / productized service по запуску agent-native сайтов для SMB.

Особое внимание:

- explanation of the new product category;
- benefits for SMB;
- capabilities;
- suitable business types;
- launch process;
- examples / cases;
- consultation / project-start action.

## Definition of Done

- все blueprint валидны;
- `extends` разрешаются;
- нет дублирования, которое можно вынести на более общий уровень;
- vertical blueprint не содержит индивидуальных фактов исходного проекта;
- структура каждого vertical соответствует реальному типу бизнеса и его типовой логике сайта;
- четыре vertical используют общие archetypes/patterns там, где это возможно;
- `npm run check` проходит без ошибок.
