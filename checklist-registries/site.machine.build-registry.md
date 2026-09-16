# Coverage Registry — site.machine.build

Это registry coverage, а не audit PASS/FAIL. Он перечисляет, что Machine Builder обязан рассмотреть перед output.

## Statuses

- `RESOLVED` — аспект выражен правдивой machine-структурой.
- `DATA_GAP` — вход не содержит достаточных данных для machine representation.
- `N_A` — аспект несущественен для данного сайта.

## Input readiness (C001–C009)

| ID | Check | Status guide |
| --- | --- | --- |
| C001 | Valid SiteContext + SiteModel pair | DATA_GAP if either invalid |
| C002 | site_model.source_context_id == site_context.context_id | RESOLVED when matched; otherwise blocked |
| C003 | Upstream readiness respected | Machine status never higher than SiteModel status |
| C004 | Business/entity identity for primary entity | DATA_GAP when unknown and it blocks entity naming |
| C005 | Offers available for services | DATA_GAP when no grounded offer exists |
| C006 | Confirmed contacts available | N_A when placeholder-only → contacts null |
| C007 | SiteModel pages enumerable | RESOLVED when each page has machine interpretation |
| C008 | Forbidden claims respected | RESOLVED when metadata/entity omit them |
| C009 | Required terms/messages reflected where grounded | RESOLVED without keyword stuffing |

## Primary entity (C010–C019)

| ID | Check | Status guide |
| --- | --- | --- |
| C010 | Exactly one primary_entity | RESOLVED before output |
| C011 | schema_type in vocabulary | RESOLVED; narrow subtype only when supported |
| C012 | Generic Organization mapping | RESOLVED when no justified subtype |
| C013 | name grounded in SiteContext | DATA_GAP when business.name unknown |
| C014 | description grounded, no new claims | RESOLVED when derived from business.summary |
| C015 | home_path exists in SiteModel | RESOLVED when path present |
| C016 | contacts use confirmed values only | RESOLVED when placeholder excluded |
| C017 | placeholder phone excluded | RESOLVED when null for placeholder |
| C018 | placeholder email excluded | RESOLVED when null for placeholder |
| C019 | context_refs present | RESOLVED when traceable to SiteContext |

## Services (C020–C029)

| ID | Check | Status guide |
| --- | --- | --- |
| C020 | Each service from real offer/capability | RESOLVED; no Service from decorative block |
| C021 | No service from benefit/proof/FAQ/audience | RESOLVED when omitted |
| C022 | provider_entity_id == primary_entity.id | RESOLVED before output |
| C023 | page_ids reference existing SiteModel pages | RESOLVED before output |
| C024 | Unique service ids | RESOLVED before output |
| C025 | name/description grounded | RESOLVED; no new claims |
| C026 | context_refs present | RESOLVED |
| C027 | No fabricated services | RESOLVED when only SiteContext offers used |
| C028 | Single-offer site → one Service | RESOLVED when consistent |
| C029 | Decorative/unsupported offer omitted | RESOLVED when no Service forced |

## Pages (C030–C044)

| ID | Check | Status guide |
| --- | --- | --- |
| C030 | Exactly one machine page per SiteModel page | RESOLVED before output |
| C031 | No extra machine pages | RESOLVED; no hidden SEO pages |
| C032 | No missing machine pages | RESOLVED before output |
| C033 | page_id matches SiteModel page id | RESOLVED before output |
| C034 | path matches SiteModel page path | RESOLVED before output |
| C035 | canonical.path == SiteModel path | RESOLVED before output |
| C036 | home role when path == / | RESOLVED deterministically |
| C037 | semantic_role in vocabulary | RESOLVED before output |
| C038 | primary_entity_id resolves | RESOLVED before output |
| C039 | service_ids resolve | RESOLVED before output |
| C040 | Unique page_ids | RESOLVED before output |
| C041 | No fake domain / absolute canonical URL | RESOLVED; path only |
| C042 | sitemap membership boolean | RESOLVED before output |
| C043 | robots index/follow valid | RESOLVED before output |
| C044 | noindex only with basis | RESOLVED when justified |

## Metadata (C050–C059)

| ID | Check | Status guide |
| --- | --- | --- |
| C050 | meta.title non-empty | RESOLVED before output |
| C051 | meta.description grounded or null | DATA_GAP when impossible without fabrication |
| C052 | No new claims in metadata | RESOLVED when grounded |
| C053 | No artificial keyword lists | RESOLVED when omitted |
| C054 | No unsupported locations | RESOLVED when omitted |
| C055 | No invented advantages | RESOLVED when omitted |
| C056 | No placeholder contact values in metadata | RESOLVED when excluded |
| C057 | SiteModel description reused when good | RESOLVED when applicable |
| C058 | Forbidden messages respected | RESOLVED when omitted |
| C059 | Required terms reflected without stuffing | RESOLVED when natural |

## Canonical / indexation (C060–C069)

| ID | Check | Status guide |
| --- | --- | --- |
| C060 | canonical.path exists in SiteModel | RESOLVED before output |
| C061 | No absolute domain URL | RESOLVED; path only |
| C062 | No placeholder domain | RESOLVED when omitted |
| C063 | robots.index boolean | RESOLVED before output |
| C064 | robots.follow boolean | RESOLVED before output |
| C065 | Default index/follow for substantive pages | RESOLVED when true/true |
| C066 | noindex justified | RESOLVED when basis exists |
| C067 | sitemap single source of truth | RESOLVED; page.sitemap only |
| C068 | No duplicated sitemap path list | RESOLVED when omitted |
| C069 | Preview policy not in page semantics | RESOLVED when MachineSpec unchanged |

## OpenGraph (C070–C079)

| ID | Check | Status guide |
| --- | --- | --- |
| C070 | open_graph.type in vocabulary | RESOLVED before output |
| C071 | type=website for business pages | RESOLVED when default |
| C072 | open_graph.title grounded | RESOLVED when derived from meta |
| C073 | open_graph.description grounded | RESOLVED when derived from meta |
| C074 | No OG image in v0.1 | RESOLVED when omitted |
| C075 | No fake/placeholder image URL | RESOLVED when omitted |
| C076 | No placeholder contacts in OG | RESOLVED when excluded |
| C077 | No new claims in OG | RESOLVED when grounded |
| C078 | No unsupported locations in OG | RESOLVED when omitted |
| C079 | No invented advantages in OG | RESOLVED when omitted |

## Breadcrumbs (C080–C089)

| ID | Check | Status guide |
| --- | --- | --- |
| C080 | Home breadcrumbs empty | RESOLVED when [] for / |
| C081 | Each breadcrumb path exists in SiteModel | RESOLVED before output |
| C082 | No invented intermediate pages | RESOLVED when omitted |
| C083 | label non-empty | RESOLVED before output |
| C084 | No breadcrumb to non-existent page | RESOLVED before output |
| C085 | Hierarchy only from real pages | RESOLVED when grounded |
| C086 | No /services/ invented when absent | RESOLVED when omitted |
| C087 | Breadcrumb order root→leaf | RESOLVED before output |
| C088 | label uses page title or short grounded label | RESOLVED |
| C089 | No fake labels | RESOLVED when grounded |

## Structured-data grounding (C090–C099)

| ID | Check | Status guide |
| --- | --- | --- |
| C090 | primary_entity serializable as Organization/Service | RESOLVED when semantic data present |
| C091 | services serializable as Service | RESOLVED when provider/page refs present |
| C092 | No literal JSON-LD/HTML stored | RESOLVED when omitted |
| C093 | No duplicated raw JSON-LD object | RESOLVED when single source of truth |
| C094 | WebSite/WebPage not duplicated | RESOLVED when derivable from refs |
| C095 | Entity naming consistent | RESOLVED before output |
| C096 | No unsupported claims in structured data | RESOLVED when grounded |
| C097 | provider relationship explicit | RESOLVED via provider_entity_id |
| C098 | page→service relationship explicit | RESOLVED via service_ids |
| C099 | page→entity relationship explicit | RESOLVED via primary_entity_id |

## Placeholder exclusion (C100–C109)

| ID | Check | Status guide |
| --- | --- | --- |
| C100 | Placeholder phone never factual | RESOLVED when null |
| C101 | Placeholder email never factual | RESOLVED when null |
| C102 | Placeholder tel: href never factual | RESOLVED when excluded |
| C103 | Placeholder mailto: href never factual | RESOLVED when excluded |
| C104 | Placeholder not in OG | RESOLVED when excluded |
| C105 | Placeholder not in metadata | RESOLVED when excluded |
| C106 | Placeholder not in canonical | RESOLVED when path only |
| C107 | Placeholder not in sitemap | RESOLVED when page.sitemap boolean |
| C108 | Confirmed contact usable | RESOLVED when value/href copied |
| C109 | Confirmed href format valid | RESOLVED before output |

## Traceability (C110–C119)

| ID | Check | Status guide |
| --- | --- | --- |
| C110 | primary_entity.context_refs present | RESOLVED when traceable |
| C111 | service.context_refs present | RESOLVED when traceable |
| C112 | decisions.context_refs present | RESOLVED when traceable |
| C113 | issues.context_ref present | RESOLVED when grounded |
| C114 | No fabricated refs | RESOLVED when grounded |
| C115 | Refs to SiteContext fields/ids | RESOLVED when consistent |
| C116 | Refs to SiteModel pages where relevant | RESOLVED when consistent |
| C117 | Provenance engine not overbuilt | RESOLVED when minimal |
| C118 | decisions explain architectural choices | RESOLVED when present |
| C119 | No CSS-like decisions | RESOLVED when omitted |

## Validation (C120–C129)

| ID | Check | Status guide |
| --- | --- | --- |
| C120 | Schema conformance | RESOLVED before output |
| C121 | Unique ids across entities/services/pages | RESOLVED before output |
| C122 | All refs resolve | RESOLVED before output |
| C123 | Page count matches SiteModel | RESOLVED before output |
| C124 | Status matches issue severity | critical→blocked; important→partial; else ready |
| C125 | Status ≤ upstream SiteModel status | RESOLVED before output |
| C126 | No new pages | RESOLVED before output |
| C127 | No new services from decorative blocks | RESOLVED before output |
| C128 | Final factual self-check | RESOLVED when no untraceable claim |
| C129 | Semantic validator passes | RESOLVED before output |