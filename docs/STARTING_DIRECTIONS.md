# Starting Directions — SiteBlueprint Stage

Этот файл задаёт предметный контекст четырёх стартовых направлений, для которых разрабатывается библиотека `SiteBlueprint`.

Это не описание конкретных компаний. Здесь фиксируются только характеристики класса бизнеса, которые нужны для проектирования reusable blueprint.

---

## 1. SMD / PCB Contract Manufacturing

### Тип бизнеса

B2B контрактное производство электроники. Клиентами являются компании, которые разрабатывают или выпускают собственные электронные изделия и передают часть производственного цикла внешнему подрядчику.

### Что должен объяснять сайт

- какие производственные задачи подрядчик способен выполнять;
- какие технологии и типы монтажа поддерживаются;
- с какой технической сложностью он способен работать;
- как устроен производственный процесс;
- какие входные данные нужны от заказчика;
- как обеспечивается качество;
- чем подтверждаются возможности подрядчика;
- как передать проект и получить расчёт.

### Ключевые сущности

- services;
- production capabilities;
- technologies;
- equipment;
- quality / control methods;
- supported project requirements;
- cases / manufactured projects;
- evidence / certifications;
- production process;
- request-for-quote action;
- project-file submission.

### Типовые страницы / разделы

- Home;
- Services;
- Service Detail;
- Capabilities;
- Equipment / Production Base;
- Quality / Control;
- Cases / Projects;
- Company / Trust;
- Quote / Project Submission;
- Contacts.

### Типовые блоки

- technical hero;
- capability grid;
- technical specs / facts;
- equipment list or grid;
- process / production stages;
- quality evidence;
- cases;
- certifications / proof;
- FAQ;
- quote CTA;
- file-upload CTA.

### Основные паттерны

```text
manufacturing
quote-request
file-upload
portfolio / cases
technical evidence
```

---

## 2. Interior Stair Manufacturing

### Тип бизнеса

Проектное производство интерьерных лестниц на заказ. Продукт одновременно является инженерным изделием и заметным элементом интерьера, поэтому сайт должен работать и как производственный, и как визуально-дизайнерский инструмент продаж.

### Что должен объяснять сайт

- какие лестницы и конструкции можно заказать;
- какие стили и визуальные решения доступны;
- какие материалы используются;
- как выглядит проектирование;
- как проходит путь от идеи/замера до производства и монтажа;
- какие проекты уже реализованы;
- насколько производитель способен работать с индивидуальным интерьером;
- как получить консультацию или предварительный расчёт.

### Ключевые сущности

- stair types / constructions;
- styles;
- materials;
- projects / portfolio;
- galleries;
- design solutions;
- project stages;
- manufacturing / installation capabilities;
- evidence / reviews;
- consultation / quote action.

### Типовые страницы / разделы

- Home;
- Stair Types / Solutions;
- Solution Detail;
- Portfolio / Projects;
- Project Detail;
- Materials;
- Design / Process;
- Company / Production;
- Consultation / Quote;
- Contacts.

### Типовые блоки

- visual hero;
- portfolio gallery;
- solution cards;
- materials grid;
- media + text;
- process / stages;
- before / after or project detail;
- visual proof;
- reviews;
- FAQ;
- consultation / quote CTA.

### Основные паттерны

```text
project-manufacturing
portfolio
quote-request
lead-generation
visual showcase
```

---

## 3. Ad Banner Resizer

### Тип бизнеса

Узкоспециализированный software / digital product для маркетологов, контекстологов и таргетологов. Основная задача продукта — адаптация рекламных креативов под разные рекламные размеры и форматы при сохранении смысла и структуры исходного креатива.

### Что должен объяснять сайт

- какую проблему решает продукт;
- кому он нужен;
- как выглядит рабочий процесс;
- какие входные файлы и сценарии поддерживаются;
- какие форматы можно получить;
- чем продукт отличается от обычного механического resize;
- какой результат получает пользователь;
- какие есть ограничения;
- как начать работу.

### Ключевые сущности

- product;
- features;
- supported formats;
- supported platforms / scenarios;
- workflow steps;
- input / output examples;
- before / after examples;
- limitations;
- pricing / access model;
- primary product action.

### Типовые страницы / разделы

- Home / Product;
- Features;
- Formats / Supported Scenarios;
- How It Works;
- Examples;
- Pricing / Access;
- FAQ;
- Start / Upload.

### Типовые блоки

- product hero;
- problem / solution;
- feature grid;
- workflow steps;
- supported formats;
- before / after;
- product demo / visual example;
- pricing / offer;
- FAQ;
- primary action CTA;
- upload/start block.

### Основные паттерны

```text
software-product
file-upload
lead-generation / product-start
product demonstration
```

---

## 4. ANWE Websites for SMB

### Тип бизнеса

B2B digital service / productized service по запуску agent-native сайтов для малого и среднего бизнеса.

Продукт должен быть понятен владельцу бизнеса, который привык мыслить категориями «нужен сайт», а не архитектурой AI-систем.

### Что должен объяснять сайт

- что такое agent-native сайт простыми словами;
- чем он отличается от обычного сайта и CMS;
- какую пользу получает владелец SMB;
- как сайт создаётся и запускается;
- как владелец взаимодействует с сайтом после запуска;
- для каких типов бизнеса решение подходит;
- какие задачи сайта можно решать;
- какие примеры сайтов уже существуют;
- как заказать запуск.

### Ключевые сущности

- service / productized offer;
- benefits;
- capabilities;
- supported business types;
- operating model;
- launch process;
- examples / cases;
- pricing / engagement model;
- FAQ;
- consultation / launch request.

### Типовые страницы / разделы

- Home;
- How It Works;
- Capabilities;
- Who It Is For / Industries;
- Examples / Cases;
- Launch Process;
- Pricing / Offer;
- FAQ;
- Contact / Start Project.

### Типовые блоки

- explanatory hero;
- problem / old-vs-new comparison;
- benefits;
- capabilities;
- how-it-works steps;
- audience / use-case grid;
- examples / cases;
- process;
- pricing / offer;
- FAQ;
- consultation CTA.

### Основные паттерны

```text
digital-service
lead-generation
quote-request
portfolio / cases
new-category explanation
```

---

## Общий принцип разработки

Для каждого направления сначала определить, какие знания уже должны находиться в общих слоях:

```text
core
archetype
pattern
```

и только после этого добавлять отраслевую специфику в:

```text
vertical
```

Цель — не создать четыре независимых шаблона, а получить библиотеку переиспользуемых SiteBlueprint, в которой общие знания действительно переиспользуются между направлениями.
