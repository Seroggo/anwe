# Coverage Registry — site.model.build

Это registry coverage, а не audit PASS/FAIL. Он перечисляет, что SiteModel Builder обязан рассмотреть перед output.

## Statuses

- `RESOLVED` — аспект выражен правдивой структурой или copy.
- `DATA_GAP` — SiteContext не содержит достаточных данных.
- `N_A` — аспект несущественен для данного сайта.
- `BLOCK_LIBRARY_GAP` — необходимая функция не выражается существующими blocks.

## Input Readiness (M001–M009)

| ID | Check | Status guide |
| --- | --- | --- |
| M001 | Valid SiteContext and source context id | DATA_GAP if no meaningful entity/offer |
| M002 | Business/entity identity | DATA_GAP when unknown and it affects page clarity |
| M003 | Primary offer | DATA_GAP or blocked when unavailable |
| M004 | Audience and demand situations | DATA_GAP when missing; do not infer from industry |
| M005 | Positioning and required messages | Resolve every supported required message |
| M006 | Forbidden claims and constraints | RESOLVED only when copy respects them |
| M007 | Proof availability | N_A only if proof is not material |
| M008 | Conversion and exact destinations | DATA_GAP when goal has no destination |
| M009 | Existing SiteContext data_gaps | Carry material gaps into SiteModel issues |

## Site / Page Architecture (M010–M019)

| ID | Check | Status guide |
| --- | --- | --- |
| M010 | Default single-page decision | RESOLVED unless a qualified separate page exists |
| M011 | Additional page qualification | Requires own meaning, no repetition, hero + two substantive blocks |
| M012 | Page id and canonical path | RESOLVED with kebab-case and `/` or `/segment/` |
| M013 | Home route | Exactly one `/` |
| M014 | One hero per substantive page | RESOLVED or DATA_GAP/blocked |
| M015 | Header/footer placement | Header first and footer last when present |
| M016 | Semantic unique block ids | Do not use numeric placeholders |
| M017 | Block economy | Remove repeated or decorative blocks |

## AI-First Message Hierarchy (M020–M029)

| ID | Check | Status guide |
| --- | --- | --- |
| M020 | Clear entity and offer in hero | DATA_GAP if no supported clarity is possible |
| M021 | Audience/situation included when material | Do not invent audience |
| M022 | Proof follows core offer | N_A when no supported proof exists |
| M023 | Required messages retained | RESOLVED across relevant pages |
| M024 | Required terms used naturally | N_A when term is not relevant to content |
| M025 | No abstract unsupported slogan | RESOLVED when H1 explains offer |

## Block Selection (M030–M039)

| ID | Check | Status guide |
| --- | --- | --- |
| M030 | Offers/capabilities mapped to generic blocks | cards, split or text; never semantic type |
| M031 | Steps only for factual sequences | N_A without a sequence |
| M032 | Stats only for verified numeric proof | N_A without numbers |
| M033 | Gallery only for actual visual narrative | N_A when decorative |
| M034 | FAQ only for supported answers | N_A without answers |
| M035 | CTA only for known conversion purpose | N_A without conversion |
| M036 | Structural use of split/media | N_A when visual slot is unjustified |

## Block Content / Copy (M040–M049)

| ID | Check | Status guide |
| --- | --- | --- |
| M040 | Every claim traceable to SiteContext | DATA_GAP or remove unsupported claim |
| M041 | No new benefits, capabilities or guarantees | RESOLVED when literal/rephrased only |
| M042 | No prohibited/constraint-breaking copy | RESOLVED when excluded |
| M043 | Stats values are confirmed facts | DATA_GAP if numeric support is absent |
| M044 | FAQ answers are supported | DATA_GAP or omit item |
| M045 | Duplicate-content prevention | Remove repeated messages |

## Navigation / Conversion (M050–M059)

| ID | Check | Status guide |
| --- | --- | --- |
| M050 | Header primary action limit | At most one action |
| M051 | Anchor integrity | Same-page existing block only |
| M052 | Internal page integrity | Existing SiteModel page only |
| M053 | External destination provenance | Exact SiteContext destination only |
| M054 | No fake `#` or invented contacts | DATA_GAP when destination missing |
| M055 | CTA conversion handling | Action only when honest |

## Proof / FAQ (M060–M069)

| ID | Check | Status guide |
| --- | --- | --- |
| M060 | Proof claim fidelity | Use confirmed claim/evidence only |
| M061 | Numeric proof discipline | No decorative metrics |
| M062 | Objection response fidelity | Use supported_response only |
| M063 | Generated visual not used as proof | RESOLVED by separating visual placeholder from evidence |

## Media / Visual Boundary (M070–M079)

| ID | Check | Status guide |
| --- | --- | --- |
| M070 | Required media placeholders | split hero/CTA, split and gallery items |
| M071 | Centered media is null | hero and CTA centered |
| M072 | Initial media fields | src null, alt empty, fit cover, allowed aspect |
| M073 | Cards media and icon are null | Visual Skill decides later |
| M074 | Steps icon is null | Visual Skill decides later |
| M075 | No Lucide name, generated image or ThemeSpec | RESOLVED when absent |

## Block Library Compatibility (M080–M089)

| ID | Check | Status guide |
| --- | --- | --- |
| M080 | Only 11 registered block types | BLOCK_LIBRARY_GAP for unmet mechanic |
| M081 | Only existing variants | Never invent variant |
| M082 | Semantic surfaces only | No color/design assumptions |
| M083 | Missing interactive mechanic surfaced | BLOCK_LIBRARY_GAP, not custom component |

## Validation / Traceability (M090–M099)

| ID | Check | Status guide |
| --- | --- | --- |
| M090 | Schema conformance | RESOLVED before output |
| M091 | Unique page ids and paths | RESOLVED before output |
| M092 | Unique page block ids | RESOLVED before output |
| M093 | Status matches issue severity | ready, partial or blocked honestly selected |
| M094 | Meaningful structural decisions only | Omit CSS-like details |
| M095 | Final factual self-check | Remove any untraceable claim |
