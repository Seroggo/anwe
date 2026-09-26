# MachineSpec v0.1

`MachineSpec` описывает machine-readable интерпретацию сайта ANWE для поисковых систем, AI-систем и машинных потребителей. Он строится из `SiteContext` + `SiteModel` **до Human rendering**.

```text
SiteContext: что известно о бизнесе
SiteModel: какие страницы/блоки существуют и какой factual visible content на них размещён
MachineSpec: что является основной сущностью, какие услуги относятся к ней,
             какова semantic role страниц, какие metadata/canonical/indexation/sitemap
             нужны, какие breadcrumb relationships и Organization/Service entities существуют
```

Принцип:

```text
machine interpretation first
human presentation second
```

Формальный контракт: `contracts/machine-spec.schema.json`. Поле `schema_version` всегда равно `"0.1"`.

## Boundary against SiteModel

MachineSpec **не** повторяет:

- `blocks`, `block order`, `surfaces`, `variants`, `forms`, `media`, `icons`, `theme`, `CSS`;
- full visible copy;
- structural block library vocabulary.

MachineSpec **хранит**:

- primary entity;
- services как semantic entities;
- machine page interpretation (по одной на каждую SiteModel page);
- metadata, canonical path, robots, sitemap membership, OpenGraph basics;
- breadcrumbs;
- entity/service/page refs, из которых Human Layer позже детерминированно сериализует JSON-LD.

## Top-Level Structure

```json
{
  "schema_version": "0.1",
  "machine_id": "example-machine",
  "site_id": "example-site",
  "source_context_id": "example-context",
  "status": "ready",
  "primary_entity": {},
  "services": [],
  "pages": [],
  "decisions": [],
  "issues": []
}
```

- `machine_id` — стабильный технический id этой machine-интерпретации.
- `site_id` совпадает с `site_model.site_id`.
- `source_context_id` совпадает с `site_context.context_id` и с `site_model.source_context_id`.
- связь с SiteModel однозначна через `site_id`; отдельный идентификатор модели не нужен.

## primary_entity

Одна primary entity на MachineSpec.

```json
{
  "id": "organization",
  "schema_type": "Organization",
  "name": "Example Company",
  "description": "Grounded factual description",
  "home_path": "/",
  "contacts": {
    "phone": null,
    "email": null
  },
  "context_refs": []
}
```

- `schema_type` ∈ `Organization | LocalBusiness | ProfessionalService | Person`. Узкий subtype выбирается только когда он действительно поддержан входом; иначе безопасный generic — `Organization`. Не создавать ложную precision.
- `home_path` — канонический `/` (соответствует единственной home странице SiteModel). Не вводить альтернативный homepage concept.
- `contacts.phone`/`contacts.email` — только confirmed SiteModel contacts, объект `{value, href}`, либо `null`. Placeholder-значения **никогда** не попадают сюда. Отсутствие confirmed контакта → `null`; это нормальная truthful representation, а не machine-stage `DATA_GAP`.

## services

Реальные offers/services как semantic entities (conceptual equivalent schema.org `Service`).

```json
{
  "id": "pcb-assembly",
  "name": "SMD-монтаж печатных плат",
  "description": "Grounded description",
  "provider_entity_id": "organization",
  "page_ids": ["home"],
  "context_refs": []
}
```

Service начинается с grounded offer/service/meaningful commercial capability из SiteContext. Он попадает в MachineSpec только когда substantively visible content хотя бы одной SiteModel page даёт посетителю понять, что услуга/способность действительно предлагается. Valid visible evidence: hero title/body, text blocks, cards, steps, stats, FAQ, CTA, operator media block title/body. Wording может быть семантически эквивалентным offer, а не дословным.

Navigation labels, internal decisions, issues, `context_refs`, metadata-only wording и сам inventory offers в SiteContext не являются visible page evidence. Grounded offer без substantive visible representation на любой странице просто отсутствует из `services[]`; это не создаёт machine issue. Не создавать Service из:

- benefit;
- proof;
- process step;
- FAQ;
- audience;
- generic capability wording.

`provider_entity_id` всегда указывает на `primary_entity.id`. `page_ids` содержит ровно SiteModel pages с substantive visible representation Service и не может быть пустым (minItems 1). `service.page_ids` и `page.service_ids` обязаны быть согласованы reciprocally — если Service ссылается на page, то и page ссылается на этот Service, и наоборот.

## pages

Ровно одна machine page на каждую SiteModel page — не больше и не меньше.

```json
{
  "page_id": "home",
  "path": "/",
  "semantic_role": "home",
  "meta": {"title": "...", "description": "..."},
  "canonical": {"path": "/"},
  "robots": {"index": true, "follow": true},
  "open_graph": {"type": "website", "title": "...", "description": "..."},
  "breadcrumbs": [],
  "primary_entity_id": "organization",
  "service_ids": [],
  "sitemap": true
}
```

- `page_id` и `path` совпадают с SiteModel page.
- `canonical.path` совпадает с SiteModel `page.path`. Absolute domain URL **не** хранится; production domain добавляется Deploy/Final Assembly.
- `primary_entity_id` указывает на `primary_entity.id`.
- `service_ids` ссылаются на существующие `services[].id`.

## semantic_role

```text
home | offer | demand | contact | about | other
```

- `home` детерминированно определяется `path == "/"`.
- Остальные роли выбираются по фактическому смыслу страницы. Если страница совмещает функции — выбирается наиболее существенная роль либо `other`. Не создавать сложную ontology.

## meta title / description

`meta.title`/`meta.description` могут отличаться от visible SiteModel page title/description, но:

- только grounded wording;
- никаких новых claims, unsupported locations, invented преимуществ;
- никаких artificial keyword lists;
- кратко объясняют entity/offer/page intent, где это известно;
- если SiteModel `description` уже хороша — можно использовать её.

Не менять SiteModel.

## canonical

Хранится только `canonical.path`, соответствующий существующему SiteModel `page.path`. Никаких `https://example.com`, `https://placeholder.test` или выдуманного absolute domain URL.

## robots / indexation

Intended production indexation. Для substantive commercial pages default:

```json
{"index": true, "follow": true}
```

`noindex` создаётся только с основанием. Preview/Review Build может глобально ставить `noindex,nofollow` как environment policy — это не меняет MachineSpec.

Invariant: `sitemap = true` влечёт `robots.index = true` (эквивалентно: `robots.index = false` влечёт `sitemap = false`). `follow` независимо.

## sitemap

Хранится один source of truth: `page.sitemap: boolean`. Отдельного дублирующего списка sitemap paths нет. Production build детерминированно создаёт `sitemap.xml` и `robots.txt` из MachineSpec и `sites/<site-id>/SITE_URL.json`; sitemap содержит только страницы с `sitemap=true` и `robots.index=true`.

## open_graph

OpenGraph v0.1 содержит только `type`, `title`, `description`. Для v0.1 `type` всегда `"website"`; другие OpenGraph types не входят в текущий content model. Image data находится вне MachineSpec v0.1 contract; fake/placeholder image URLs не являются частью MachineSpec.

## breadcrumbs

`breadcrumbs[]` — массив `{label, path}`.

- Home (`path == "/"`): строго `[]`.
- Non-home page: `breadcrumbs.length >= 1`, и первый breadcrumb обязан быть `{"path": "/"}`.
- Каждый breadcrumb path существует в SiteModel; уникален внутри trail; не равен текущему `page.path`.
- Нельзя выдумывать промежуточные страницы (например, `/services/`, если её нет). Hierarchy не выводится только из URL segments.

## structured data

MachineSpec хранит semantic data, достаточные для deterministic serialization:

- `primary_entity` (Organization/LocalBusiness/ProfessionalService/Person);
- `services[]` (Service);
- `page` relationships (`primary_entity_id`, `service_ids`, `provider_entity_id`, `page_ids`).

Literal `<script type="application/ld+json">` и готовый HTML не хранятся. Отдельные full `WebSite`/`WebPage` JSON-LD объекты не дублируются — Human serializer создаёт их из site/page/canonical/entity. Один source of truth.

## machine relationships

Для v0.1 достаточно явных refs:

```text
page.primary_entity_id
page.service_ids[]
service.provider_entity_id
service.page_ids[]
```

Отдельный `relations[]` не создаётся, если он только дублирует эти refs.

## traceability

`context_refs` в already принятом ANWE стиле. Сложный provenance engine не строится.

## status / issues

```text
ready | partial | blocked
```

Readiness policy — один канонический алгоритм. Сначала вычисляется readiness собственных Machine issues:

```text
critical issue → blocked
important issue → partial
minor / no issues → ready
```

Затем она ограничивается upstream readiness:

```text
final Machine status = min_readiness(SiteModel.status, machine-own-status)
```

В ranks (`blocked = 0`, `partial = 1`, `ready = 2`):

```text
expectedRank = min(STATUS_RANK[siteModel.status], STATUS_RANK[machineOwnStatus])
```

Примеры:

```text
SiteModel partial, machine issues []        → Machine partial
SiteModel ready,   machine issues important → Machine partial
SiteModel blocked, machine issues []        → Machine blocked
SiteModel partial, machine issues critical  → Machine blocked
```

Machine Layer не улучшает upstream readiness и не создаёт искусственный issue ради сохранения status. `issues[]` содержит только machine-stage issues — возникшие именно при построении machine representation (невозможно определить primary entity, невозможно grounded сформировать необходимое machine semantic field, сломана необходимая factual связь). Для v0.1 используется только `DATA_GAP`.

Отсутствие confirmed контактов само по себе **не** machine-stage `DATA_GAP`: `placeholder → null` это нормальная truthful representation. Не создавать issue только потому, что domain ещё неизвестен: canonical path достаточен до deploy.
