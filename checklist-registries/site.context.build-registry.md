# Capability Registry — site.context.build

Это **канонический список аспектов бизнес-контекста**, которые SiteContext Builder
обязан рассмотреть при работе. Это не audit checklist и не набор pass/fail-проверок.
Это перечень аспектов бизнес-контекста, для каждого из которых зафиксировано,
что именно Builder должен извлечь, на основе чего, какой статус может присвоить
и при каких условиях фиксируется gap.

## Статусы

- `CAPTURED` — аспект успешно извлечён из input.
- `DATA_GAP` — недостаточно входных данных, чтобы извлечь аспект.
- `N_A` — аспект несущественен для данного бизнеса.
- `CONFLICT` — источники противоречат друг другу; требуется разрешение.

## Группы

- C001–C009 Business identity
- C010–C019 Offers
- C020–C029 Audiences
- C030–C039 Demand situations
- C040–C049 Positioning
- C050–C059 Proof
- C060–C069 Objections / Conversion
- C070–C079 Content / Terminology
- C080–C089 Brand / Constraints
- C090–C099 Semantic identity / Traceability

Registry используется SiteContext Builder как канонический список аспектов, которые
обязаны быть рассмотрены. На уровне run-time он не превращается в pass/fail-проверки —
это coverage по группам, где для каждой группы считаются счётчики
`CAPTURED / DATA_GAP / N_A / CONFLICT`.

---

## Business identity (C001–C009)

| ID | Aspect | What to extract | Source | Status | Gap condition |
|----|--------|-----------------|--------|--------|---------------|
| C001 | Business name | Официальное название компании | sources[].content | CAPTURED / DATA_GAP | Название не упомянуто → DATA_GAP minor; использовать business.name=null |
| C002 | Entity type | Что это за сущность в рыночном смысле | sources[].content | CAPTURED / DATA_GAP | Невозможно определить entity_type И offers[0].name → DATA_GAP critical |
| C003 | Category | Рыночная категория/специализация | sources[].content | CAPTURED / DATA_GAP | Category не упомянута → DATA_GAP important |
| C004 | Summary | Нормализованное описание (1–3 предложения, без рекламной воды) | sources[].content | CAPTURED / DATA_GAP | Описание отсутствует → DATA_GAP important |
| C005 | Geography | Страны, города, регионы | sources[].content | CAPTURED / N_A | География не упомянута → N_A; пустой массив [] |
| C006 | Context ID | Kebab-case slug из названия или entity_type+category | business.name / entity_type / category | CAPTURED | Всегда можно сгенерировать из доступных данных |
| C007 | Name conflict | Противоречие между sources по названию | sources[] comparison | CAPTURED / CONFLICT | Разные названия в разных sources → CONFLICT → DATA_GAP |
| C008 | Entity type conflict | Противоречие между sources по entity_type | sources[] comparison | CAPTURED / CONFLICT | Разные entity_type в разных sources → CONFLICT → DATA_GAP |
| C009 | Geography conflict | Противоречие между sources по географии | sources[] comparison | CAPTURED / CONFLICT / N_A | Разная география в разных sources → CONFLICT → DATA_GAP |

---

## Offers (C010–C019)

| ID | Aspect | What to extract | Source | Status | Gap condition |
|----|--------|-----------------|--------|--------|---------------|
| C010 | Offer identification | Что реально продаётся/предлагается | sources[].content | CAPTURED / DATA_GAP | Невозможно определить ни одного offer → DATA_GAP critical |
| C011 | Offer vs capability | Отличить offer от capability/feature/technology | sources[].content | CAPTURED / DATA_GAP | Неясно, что является отдельным offer → DATA_GAP important |
| C012 | Offer name | Короткое название offer | sources[].content | CAPTURED / DATA_GAP | Название не упомянуто → DATA_GAP important |
| C013 | Offer description | Описание (1–2 предложения) | sources[].content | CAPTURED / DATA_GAP | Описание отсутствует → DATA_GAP important |
| C014 | Offer category | Категория offer (если применимо) | sources[].content | CAPTURED / N_A | Категория не применима → N_A; использовать null |
| C015 | Offer priority | primary / secondary / supporting | sources[].content / inference | CAPTURED / DATA_GAP | Приоритет неясен → использовать primary для основного |
| C016 | Offer conflict | Противоречие между sources по составу offers | sources[] comparison | CAPTURED / CONFLICT | Разные списки offers в разных sources → CONFLICT → DATA_GAP |
| C017 | Offer duplication | Дубли offers в разных формулировках | sources[].content | CAPTURED | Нормализовать дубли → одно canonical значение |
| C018 | Offer completeness | Все ли offers извлечены | sources[].content | CAPTURED / DATA_GAP | Упоминания других offers без деталей → DATA_GAP minor |
| C019 | Offer separability | Можно ли offers продавать раздельно | sources[].content / inference | CAPTURED / DATA_GAP | Неясно, раздельные ли offers → DATA_GAP minor |

---

## Audiences (C020–C029)

| ID | Aspect | What to extract | Source | Status | Gap condition |
|----|--------|-----------------|--------|--------|---------------|
| C020 | Audience identification | Кто целевая аудитория | sources[].content | CAPTURED / DATA_GAP / N_A | Аудитория не упомянута → DATA_GAP important |
| C021 | Segment name | Операционное название сегмента | sources[].content | CAPTURED / DATA_GAP | Название не упомянуто → DATA_GAP important |
| C022 | Segment description | Кто они (роль, тип компании) | sources[].content | CAPTURED / DATA_GAP | Описание отсутствует → DATA_GAP important |
| C023 | Audience needs | Что им нужно | sources[].content | CAPTURED / DATA_GAP | Needs не упомянуты → DATA_GAP important; пустой массив [] |
| C024 | Audience problems | Какие проблемы решают | sources[].content | CAPTURED / DATA_GAP | Problems не упомянуты → DATA_GAP important; пустой массив [] |
| C025 | Selection criteria | По каким критериям выбирают | sources[].content | CAPTURED / DATA_GAP | Criteria не упомянуты → DATA_GAP important; пустой массив [] |
| C026 | Persona vs segment | Отличить операционный сегмент от искусственной персоны | sources[].content | CAPTURED | Не создавать искусственные персоны, если их нет во входе |
| C027 | Audience conflict | Противоречие между sources по аудиториям | sources[] comparison | CAPTURED / CONFLICT | Разные аудитории в разных sources → CONFLICT → DATA_GAP |
| C028 | Audience duplication | Дубли audiences в разных формулировках | sources[].content | CAPTURED | Нормализовать дубли → одно canonical значение |
| C029 | Multiple audiences | Несколько сегментов для одного бизнеса | sources[].content | CAPTURED / N_A | Несколько сегментов упомянуты → извлечь все |

---

## Demand situations (C030–C039)

| ID | Aspect | What to extract | Source | Status | Gap condition |
|----|--------|-----------------|--------|--------|---------------|
| C030 | Situation identification | Когда/почему возникает спрос | sources[].content | CAPTURED / DATA_GAP / N_A | Ситуации не упомянуты → DATA_GAP important |
| C031 | Trigger | Что произошло / почему возник спрос сейчас | sources[].content | CAPTURED / DATA_GAP | Trigger не упомянут → DATA_GAP important |
| C032 | Job | Что клиент пытается получить в этой ситуации | sources[].content | CAPTURED / DATA_GAP | Job не упомянут → DATA_GAP important |
| C033 | Audience mapping | Какие аудитории релевантны для ситуации | audiences[], sources[].content | CAPTURED / DATA_GAP | Связь с аудиториями неясна → пустой массив [] |
| C034 | Offer mapping | Какие offers решают ситуацию | offers[], sources[].content | CAPTURED / DATA_GAP | Связь с offers неясна → пустой massив [] |
| C035 | Trigger invention | Не придумывать trigger, если он не поддержан входом | sources[].content | CAPTURED / DATA_GAP | Trigger не упомянут явно → DATA_GAP, не inference |
| C036 | JTBD terminology | Использовать operational terminology, не обязательно термин JTBD | sources[].content | CAPTURED | Описывать job операционно, не требовать термина JTBD |
| C037 | Situation conflict | Противоречие между sources по ситуациям | sources[] comparison | CAPTURED / CONFLICT | Разные ситуации в разных sources → CONFLICT → DATA_GAP |
| C038 | Situation duplication | Дубли situations в разных формулировках | sources[].content | CAPTURED | Нормализовать дубли → одно canonical значение |
| C039 | Multiple situations | Несколько ситуаций для одного бизнеса | sources[].content | CAPTURED / N_A | Несколько ситуаций упомянуты → извлечь все |

---

## Positioning (C040–C049)

| ID | Aspect | What to extract | Source | Status | Gap condition |
|----|--------|-----------------|--------|--------|---------------|
| C040 | Value proposition | Краткое ценностное предложение (1 предложение) | sources[].content | CAPTURED / DATA_GAP | Value proposition не упомянуто → DATA_GAP important; использовать null |
| C041 | Differentiators | Подтверждённые отличия от конкурентов/альтернатив | sources[].content | CAPTURED / DATA_GAP | Differentiators не упомянуты → DATA_GAP important; пустой массив [] |
| C042 | Generic differentiators | Не превращать общие слова в differentiator без основания | sources[].content | CAPTURED | «Качество, индивидуальный подход» без основания → не включать |
| C043 | Alternatives | С чем конкурирует бизнес | sources[].content | CAPTURED / N_A | Alternatives не упомянуты → N_A; пустой массив [] |
| C044 | Do not claim | Утверждения, которые запрещены или не подтверждены | sources[].content / inference | CAPTURED / DATA_GAP | Важные утверждения не подтверждены → включить в do_not_claim[] |
| C045 | Do not claim completeness | Достаточно ли do_not_claim[] для предотвращения hallucinations | sources[].content / inference | CAPTURED / DATA_GAP | Критичные утверждения (сертификаты, гарантии, география) не подтверждены → DATA_GAP minor |
| C046 | Positioning conflict | Противоречие между sources по positioning | sources[] comparison | CAPTURED / CONFLICT | Разное positioning в разных sources → CONFLICT → DATA_GAP |
| C047 | Differentiator evidence | Каждый differentiator должен быть подтверждён | sources[].content | CAPTURED / DATA_GAP | Differentiator без evidence → не включать или DATA_GAP |
| C048 | Competitive context | Понятен ли конкурентный контекст | sources[].content | CAPTURED / DATA_GAP / N_A | Конкурентный контекст не упомянут → N_A |
| C049 | Positioning duplication | Дубли positioning в разных формулировках | sources[].content | CAPTURED | Нормализовать дубли → одно canonical значение |

---

## Proof (C050–C059)

| ID | Aspect | What to extract | Source | Status | Gap condition |
|----|--------|-----------------|--------|--------|---------------|
| C050 | Proof identification | Доказательства (метрики, кейсы, клиенты, сертификаты, опыт, активы, процессы) | sources[].content | CAPTURED / DATA_GAP / N_A | Proof не упомянуты → DATA_GAP important |
| C051 | Proof type | metric / case / client / certification / experience / asset / process / other | sources[].content | CAPTURED / DATA_GAP | Тип proof неясен → использовать other |
| C052 | Claim | Утверждение | sources[].content | CAPTURED / DATA_GAP | Claim не сформулировано → DATA_GAP important |
| C053 | Evidence | Конкретное доказательство (цифра, название, описание) | sources[].content | CAPTURED / DATA_GAP | Evidence отсутствует → не включать proof или DATA_GAP |
| C054 | Source ref | Ссылка на source_id, откуда взят proof | sources[].source_id | CAPTURED / N_A | Source ref неизвестен → использовать null |
| C055 | Proof invention | Не генерировать клиентов, цифры, сертификаты, оборудование, кейсы | sources[].content | CAPTURED | Proof не упомянут → не включать |
| C056 | Proof conflict | Противоречие между sources по proof | sources[] comparison | CAPTURED / CONFLICT | Разные значения proof в разных sources → CONFLICT → DATA_GAP |
| C057 | Proof duplication | Дубли proof в разных формулировках | sources[].content | CAPTURED | Нормализовать дубли → одно canonical значение |
| C058 | Proof completeness | Все ли proof извлечены | sources[].content | CAPTURED / DATA_GAP | Упоминания других proof без деталей → DATA_GAP minor |
| C059 | Generic claim without evidence | Отличить generic claim от proof с evidence | sources[].content | CAPTURED / DATA_GAP | «Современное оборудование» без конкретики → не включать как proof |

---

## Objections / Conversion (C060–C069)

| ID | Aspect | What to extract | Source | Status | Gap condition |
|----|--------|-----------------|--------|--------|---------------|
| C060 | Objection identification | Типичные возражения, опасения, барьеры клиентов | sources[].content | CAPTURED / DATA_GAP / N_A | Objections не упомянуты → N_A; пустой массив [] |
| C061 | Supported response | Доказанный ответ на возражение | sources[].content | CAPTURED / DATA_GAP | Ответ не упомянут → использовать null |
| C062 | Response invention | Не придумывать rebuttal, если его нет во входе | sources[].content | CAPTURED | Rebuttal не упомянут → использовать null |
| C063 | Primary goal | Главная цель конверсии | sources[].content | CAPTURED / DATA_GAP | Primary goal не упомянута → DATA_GAP important; использовать null |
| C064 | Primary CTA | Главный call-to-action (label + action) | sources[].content | CAPTURED / DATA_GAP | Primary CTA не упомянут → DATA_GAP important; использовать null |
| C065 | Secondary CTAs | Дополнительные CTA | sources[].content | CAPTURED / N_A | Secondary CTAs не упомянуты → N_A; пустой массив [] |
| C066 | Contact methods | Способы связи (телефон, email, форма, мессенджеры) | sources[].content | CAPTURED / DATA_GAP | Contact methods не упомянуты → DATA_GAP important; пустой массив [] |
| C067 | Contact invention | Не придумывать конкретные номера/адреса | sources[].content | CAPTURED | Номер/адрес не упомянут → использовать общее название метода |
| C068 | CTA normalization | Нормализовать смысл CTA | sources[].content | CAPTURED | «Оставить заявку, запросить расчёт, записаться» — нормализовать |
| C069 | Conversion conflict | Противоречие между sources по conversion | sources[] comparison | CAPTURED / CONFLICT | Разные conversion goals в разных sources → CONFLICT → DATA_GAP |

---

## Content / Terminology (C070–C079)

| ID | Aspect | What to extract | Source | Status | Gap condition |
|----|--------|-----------------|--------|--------|---------------|
| C070 | Required messages | Смысл, который нельзя потерять при построении сайта | sources[].content | CAPTURED / DATA_GAP | Required messages не упомянуты → DATA_GAP important; пустой массив [] |
| C071 | Message vs copywriting | Отличить key message от копирайтинга страницы | sources[].content | CAPTURED | Required messages — это смысл, не копирайтинг |
| C072 | Required terms | Специфичная терминология бизнеса | sources[].content | CAPTURED / DATA_GAP | Required terms не упомянуты → DATA_GAP minor; пустой массив [] |
| C073 | Forbidden messages | Сообщения, которые запрещены или не подтверждены | sources[].content / inference | CAPTURED / DATA_GAP | Forbidden messages не упомянуты → DATA_GAP minor; пустой массив [] |
| C074 | FAQ candidates | Вопросы и ответы из входа или явно вытекающие из контекста | sources[].content | CAPTURED / DATA_GAP / N_A | FAQ не упомянуты → N_A; пустой массив [] |
| C075 | FAQ invention | Не генерировать общие FAQ без основания | sources[].content | CAPTURED | Общие FAQ («Сколько стоит?») без основания → не включать |
| C076 | FAQ answer completeness | У каждого FAQ есть ответ или null | sources[].content | CAPTURED / DATA_GAP | Ответ отсутствует → использовать null |
| C077 | Message duplication | Дубли messages в разных формулировках | sources[].content | CAPTURED | Нормализовать дубли → одно canonical значение |
| C078 | Terminology conflict | Противоречие между sources по терминологии | sources[] comparison | CAPTURED / CONFLICT | Разная терминология в разных sources → CONFLICT → DATA_GAP |
| C079 | Content completeness | Все ли key messages извлечены | sources[].content | CAPTURED / DATA_GAP | Упоминания других messages без деталей → DATA_GAP minor |

---

## Brand / Constraints (C080–C089)

| ID | Aspect | What to extract | Source | Status | Gap condition |
|----|--------|-----------------|--------|--------|---------------|
| C080 | Desired character | Желаемые характеристики визуального характера | sources[].content | CAPTURED / DATA_GAP / N_A | Desired character не упомянуты → N_A; пустой массив [] |
| C081 | Tone | Тон коммуникации | sources[].content | CAPTURED / DATA_GAP / N_A | Tone не упомянут → N_A; пустой массив [] |
| C082 | Avoid | Явно нежелательные характеристики | sources[].content | CAPTURED / N_A | Avoid не упомянуты → N_A; пустой массив [] |
| C083 | Brand constraints | Ограничения бренда | sources[].content | CAPTURED / N_A | Constraints не упомянуты → N_A; пустой массив [] |
| C084 | Existing colors | Существующие фирменные цвета | sources[].content | CAPTURED / N_A | Existing colors не упомянуты → N_A; пустой массив [] |
| C085 | Existing fonts | Существующие фирменные шрифты | sources[].content | CAPTURED / N_A | Existing fonts не упомянуты → N_A; пустой массив [] |
| C086 | Reference | Визуальный референс (URL или описание) | sources[].content | CAPTURED / N_A | Reference не упомянут → N_A; использовать null |
| C087 | Design auto-inference | Не выводить дизайн автоматически из business category | sources[].content | CAPTURED | B2B → строгий, technology → квадратный — не использовать без основания |
| C088 | Constraint categories | legal / commercial / geographic / technical / content | sources[].content | CAPTURED / N_A | Constraints не упомянуты → N_A; пустые массивы [] |
| C089 | Constraint conflict | Противоречие между sources по constraints | sources[] comparison | CAPTURED / CONFLICT | Разные constraints в разных sources → CONFLICT → DATA_GAP |

---

## Semantic identity / Traceability (C090–C099)

| ID | Aspect | What to extract | Source | Status | Gap condition |
|----|--------|-----------------|--------|--------|---------------|
| C090 | Primary entity | Название сущности (если есть) или entity_type | business.name / entity_type | CAPTURED | Всегда можно сгенерировать из доступных данных |
| C091 | Entity type | Нормализованный тип (повтор из business.entity_type) | business.entity_type | CAPTURED | Всегда доступен, если business.entity_type CAPTURED |
| C092 | Categories | Рыночные категории | business.category, offers[].category | CAPTURED / DATA_GAP | Categories не упомянуты → DATA_GAP important; пустой массив [] |
| C093 | Services or products | Нормализованный список услуг/продуктов | offers[] | CAPTURED / DATA_GAP | Offers не извлечены → DATA_GAP critical; пустой массив [] |
| C094 | Audiences | Нормализованный список аудиторий | audiences[] | CAPTURED / DATA_GAP / N_A | Audiences не извлечены → N_A; пустой массив [] |
| C095 | Use cases | Нормализованный список use case | demand_situations[] | CAPTURED / DATA_GAP / N_A | Demand situations не извлечены → N_A; пустой массив [] |
| C096 | Locations | Нормализованный список локаций | business.geography | CAPTURED / N_A | Geography не упомянута → N_A; пустой массив [] |
| C097 | Semantic normalization | Нормализация терминов без добавления новых фактов | all sections | CAPTURED | Допустима нормализация, но не добавление фактов |
| C098 | Meaningful inference | Фиксация существенных inferred решений в decisions[] | all sections | CAPTURED / DATA_GAP | Meaningful inference не зафиксирован → DATA_GAP minor |
| C099 | Trivial normalization | Не фиксировать тривиальные нормализации в decisions[] | all sections | CAPTURED | Kebab-case, singular/plural, пунктуация — не фиксировать |

---

## Использование registry

Registry используется SiteContext Builder как канонический список аспектов, которые
обязаны быть рассмотрены. На уровне run-time он не превращается в pass/fail-проверки —
это coverage по группам, где для каждой группы считаются счётчики
`CAPTURED / DATA_GAP / N_A / CONFLICT`.

Маппинг аспектов registry в поля SiteContext contract определён в
`contracts/site-context.schema.json` и `docs/SITE_CONTEXT_V0_1.md`.
