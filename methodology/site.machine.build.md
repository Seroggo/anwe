# Methodology — site.machine.build

Этот документ описывает, как Machine Builder превращает валидную пару `SiteContext v0.1` + `SiteModel v0.1` в `MachineSpec v0.1`. Контракт задаёт форму output; prompt задаёт обязательные ограничения; здесь описана логика архитектурных решений.

## 0. Граница

MachineSpec — это **не** второй SiteModel. Он не хранит blocks, block order, surfaces, variants, forms, media, icons, theme, CSS, full visible copy. Он хранит machine-readable semantics: primary entity, services, page semantic role, metadata, canonical path, robots, sitemap membership, OpenGraph basics, breadcrumbs, entity/service/page refs.

Machine Layer не добавляет business facts. Он может сокращать, нормализовать, классифицировать, связывать и создавать metadata wording — но не изобретать services, capabilities, address, contacts, certificates, customers, geography, ratings, prices, guarantees, opening hours, legal data.

## 1. Input readiness

Прочитай `SiteContext` и `SiteModel`. Удостоверься, что `site_model.source_context_id == site_context.context_id`; иначе это upstream inconsistency — зафиксируй blocker.

Upstream readiness policy:

```text
SiteModel blocked  → MachineSpec blocked
SiteModel partial  → MachineSpec ≤ partial
SiteModel ready    → MachineSpec ≤ ready (или ниже при machine gap)
```

Machine Layer не «улучшает» upstream readiness.

## 2. Primary entity

Одна primary entity. `id` обычно `"organization"` (или `"person"`, если бизнес — физлицо). `name` берётся из `business.name`/`semantic_identity.primary_entity`. `description` — grounded factual description из `business.summary` или нормализованная короткая формулировка без новых claims. `home_path` — существующий SiteModel path (обычно `/`).

`schema_type`:

- `Organization` — безопасный generic mapping, когда бизнес существует как компания/организация, но более точный subtype не обоснован.
- `LocalBusiness` — только когда есть подтверждённая физическая локация и public-facing business.
- `ProfessionalService` — только когда услуга оказывается профессионалом/профессиональной фирмой и это явно поддержано.
- `Person` — только когда бизнес — физлицо.

Не создавать ложную precision. Узкий subtype выбирается только когда он действительно поддержан входом.

## 3. Contacts

Используй **только** confirmed SiteModel contacts из `contacts` block. Найди в SiteModel `contacts` block; если `phone.status == "confirmed"` — `contacts.phone = {value, href}` из этого блока; иначе `contacts.phone = null`. Аналогично для `email`.

Placeholder-значения (`+7 (000) 000-00-00`, `example@mail.test`, `tel:+70000000000`, `mailto:example@mail.test`) **никогда** не попадают в `primary_entity.contacts` как factual value. Если статус `placeholder` — поле `null`.

Не выдумывать address, legal name, INN, OGRN, messengers — их нет в MachineSpec v0.1 как factual entity fields.

## 4. Services

Service возникает из реального offer/service/meaningful commercial capability в SiteContext `offers[]` и/или SiteModel. Минимально: `id`, `name`, `description`, `provider_entity_id` (всегда `primary_entity.id`), `page_ids` (SiteModel page ids, где эта услуга представлена), `context_refs`.

Не превращай каждую card в отдельный Service. Не создавать Service из:

- benefit / proof / process step / FAQ / audience / generic capability wording,

если это не самостоятельная услуга. Если SiteContext имеет несколько offers — обычно несколько Services. Если единственный offer — обычно один Service. Если offer чисто декоративный или не имеет самостоятельной коммерческой сущности — не создавать Service.

## 5. Page semantic role

Одна machine page на каждую SiteModel page — ровно столько, сколько pages в SiteModel. Не создавать скрытые SEO pages.

`semantic_role`:

- `home` — детерминированно, если `path == "/"`.
- `offer` — страница, главным смыслом которой является конкретное предложение/услуга.
- `demand` — страница, главным смыслом которой является ситуация спроса.
- `contact` — страница контактов/связи.
- `about` — страница о компании.
- `other` — иное; выбирается, если страница совмещает функции и наиболее существенная роль неясна.

Если отдельная page совмещает функции — выбери наиболее существенную роль либо `other`. Не создавай сложную ontology.

## 6. Metadata без hallucination

`meta.title` и `meta.description` — grounded wording. Они могут отличаться от visible SiteModel page title/description, но:

- никаких новых claims;
- никаких artificial keyword lists;
- никаких unsupported locations;
- никаких придуманных преимуществ;
- кратко объясняют entity/offer/page intent, где это известно.

Если SiteModel `page.description` уже хороша — можно использовать её. `meta.title` — non-empty. `meta.description` может быть `null`, только если grounded description невозможен без выдумки (тогда `DATA_GAP`).

## 7. Canonical

`canonical.path` совпадает с SiteModel `page.path`. Никаких absolute domain URL, никаких `https://example.com`, никаких placeholder доменов. Production domain добавляется Deploy/Final Assembly.

## 8. Indexation

Default для substantive commercial pages: `{"index": true, "follow": true}`. `noindex` — только с основанием (например, page не имеет самостоятельного смысла для индексации). Не делай Preview policy частью page semantics.

## 9. Sitemap membership

`page.sitemap: boolean`. Один source of truth. Обычно `true` для substantive indexable pages; `false` — только с основанием (например, `noindex`). Отдельного дублирующего списка sitemap paths не создавать.

## 10. OpenGraph

`open_graph.type` — `website` для обычных business pages; `article`/`profile` только при обосновании. `title`/`description` — grounded, как `meta`. OG image не добавляется (зависит от Visual Layer). Никаких fake/placeholder image URL.

## 11. Breadcrumbs

`breadcrumbs[]` — массив `{label, path}`. Home: `[]`. Для других pages обычно `[{label: "Главная", path: "/"}]`, либо более глубокая hierarchy, **только если** соответствующие реальные pages существуют в SiteModel.

Каждый breadcrumb path обязан существовать в SiteModel. Нельзя выдумывать промежуточные страницы (например, `/services/`, если её нет). Можно `Главная → SMD-монтаж` без промежуточной `/services/`.

## 12. Structured-data semantics

MachineSpec хранит semantic data, достаточные для deterministic serialization: `primary_entity`, `services[]`, page relationships. Не хранить literal JSON-LD/HTML. Не дублировать те же facts в отдельный raw JSON-LD object. Один source of truth — Human Layer позже детерминированно создаст `Organization`/`Service`/`WebSite`/`WebPage` JSON-LD.

## 13. Traceability

`context_refs` в already принятом ANWE стиле (refs на SiteContext fields/paths/ids). Сложный provenance engine не строится.

## 14. Issues / status

`issues[]` — только machine-stage issues. Для v0.1 используется только `DATA_GAP`, когда machine representation невозможно построить без отсутствующего factual input. Не создавать issue только из-за неизвестного domain (canonical path достаточен).

Status детерминированно: `critical` → `blocked`; иначе `important` → `partial`; иначе `ready` — но не выше upstream SiteModel status.

## 15. Final validation

Перед output проверь:

1. JSON соответствует MachineSpec schema; ids unique.
2. Ровно одна machine page на каждую SiteModel page; `page_id`/`path`/`canonical.path` совпадают.
3. `primary_entity.id` существует; `service_ids`/`provider_entity_id`/`page_ids` ссылаются на существующие ids.
4. Placeholder SiteModel contacts не попали как factual Machine contacts.
5. Каждый breadcrumb path существует в SiteModel.
6. `meta.title` non-empty; нет placeholder contact values в metadata/OG/entity.
7. Никаких absolute domain URL; canonical — path only.
8. Status ≤ upstream SiteModel status и соответствует issue severity.