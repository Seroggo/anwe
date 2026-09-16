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
  "source_model_id": "example-site",
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
- `source_context_id` совпадает с `site_context.context_id`.
- `source_model_id` совпадает с `site_model.site_id`.

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
- `home_path` — существующий SiteModel path (обычно `/`).
- `contacts.phone`/`contacts.email` — только confirmed SiteModel contacts, объект `{value, href}`, либо `null`. Placeholder-значения **никогда** не попадают сюда.

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

Service возникает из реального offer/service/meaningful commercial capability в SiteContext/SiteModel. Не создавать Service из:

- benefit;
- proof;
- process step;
- FAQ;
- audience;
- generic capability wording.

`provider_entity_id` всегда указывает на `primary_entity.id`.

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

## sitemap

Хранится один source of truth: `page.sitemap: boolean`. Отдельного дублирующего списка sitemap paths нет. Физический `sitemap.xml` создаётся deterministic Human/Deploy layer позже.

## open_graph

Базовые `type`, `title`, `description`. Для обычных business pages `type = "website"`. OG image не добавляется — он зависит от Visual Layer. Никаких fake/placeholder image URL.

## breadcrumbs

`breadcrumbs[]` — массив `{label, path}`. Home: `[]`. Для других pages обычно:

```json
[{"label": "Главная", "path": "/"}]
```

Каждый breadcrumb path должен существовать в SiteModel. Нельзя выдумывать промежуточные страницы (например, `/services/`, если её нет).

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

Readiness policy (минимальное правило):

```text
SiteModel blocked  → MachineSpec не может быть ready/partial выше blocked
SiteModel partial  → MachineSpec не может стать ready
SiteModel ready    → MachineSpec может быть ready либо lower при machine gap
```

`issues[]` содержит только machine-stage issues. Для v0.1 используется только `DATA_GAP` — когда machine representation невозможно построить без отсутствующего factual input. Не создавать issue только потому, что domain ещё неизвестен: canonical path достаточен до deploy.

Status детерминированно соответствует максимальной severity issues: `critical` → `blocked`; иначе `important` → `partial`; иначе `ready` — но не выше upstream SiteModel status.