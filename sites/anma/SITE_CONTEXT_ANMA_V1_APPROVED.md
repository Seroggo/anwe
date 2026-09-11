# SITE_CONTEXT_ANMA_V1_APPROVED

**Проект:** ANMA — AI Native Marketing Agency  
**Артефакт:** SiteContext  
**Версия:** v1 — Critic revised  
**Дата:** 2026-09-10  
**Статус:** `CRITIC_APPROVED / HUMAN_GATE_3_PENDING`  
**Следующий шаг:** Human Gate #3 → ANWE Blueprint Gap Analysis

---

# 0. Contract

Этот файл — **production-oriented marketing contract** для ANWE.

Он содержит только downstream-решения, необходимые для проектирования сайта.

ANWE может:

- выбирать композицию SiteBlueprint;
- предлагать представление обязательной информации;
- переписывать формулировки в пределах заданного смысла;
- создавать SiteModel / visual briefs / representations.

ANWE не может:

- менять ICP;
- менять demand priority;
- добавлять неутверждённые услуги;
- менять primary intent страницы;
- придумывать цены;
- придумывать клиентов / отзывы / результаты;
- превращать Client #0 в внешний client case;
- делать AI главным обещанием;
- менять scope SFD;
- подгонять SiteContext под существующий Blueprint.

---

# 1. Site Contract

```yaml
site:
  id: anma_main
  public_name: ANMA
  descriptor: AI Native Marketing Agency
  language: ru
  geography: Russia
  familiar_category:
    - маркетинговое агентство
    - senior marketing partner
  lifecycle: new_brand_validation
  jobs:
    - credibility
    - conversion
    - compounding_demand
    - learning
  commercial_goal:
    metric: monthly_revenue_run_rate
    target_rub: 200000
    horizon: end_of_month_3_after_launch
  acquisition_sources:
    - founder_network
    - referral
    - outbound
    - partner
    - direct
    - organic_search
    - content
    - SFD
```

---

# 2. Audience Contract

## P1 — Primary

```yaml
id: P1
priority: primary
context: owner-led upper-small / medium company
buyers:
  - Owner
  - CEO
  - Commercial Head
conditions:
  - established business
  - concrete marketing trigger
  - task requires several connected competencies
  - owner still materially coordinates marketing
  - buyer can consider senior-led project rather than commodity execution
primary_demand:
  - DS1
  - DS3
anti_fit:
  - price-first
  - commodity-only
  - guarantee-first
```

Core job:

> Решить важную маркетинговую задачу без самостоятельной сборки и координации нескольких отдельных исполнителей.

---

## P2 — Secondary

```yaml
id: P2
priority: secondary
context: medium company with internal marketing owner/team
buyers:
  - CMO
  - Head of Marketing
  - Head of Digital
  - Growth / Commercial Lead
conditions:
  - internal marketing exists
  - bounded project requires missing breadth / time / capability
  - permanent hiring is not the preferred solution
primary_demand:
  - DS5
  - DS1
forbidden_frame:
  - заменить отдел маркетинга
```

Core job:

> Усилить внутреннюю команду на конкретной сложной задаче, сохранив её ownership.

---

## P3 — Opportunistic

```yaml
id: P3
priority: opportunistic
context: enterprise / business unit
conditions:
  - bounded high-value task
  - sufficient trust / warm access / proof
  - scope compatible with current ANMA governance
site_requirement:
  - site must not look amateur
  - no enterprise-first acquisition architecture
```

---

# 3. Demand Contract

## DS1 — Launch / Relaunch

```yaml
id: DS1
priority: primary
segments: [P1, P2]
surface_language:
  - запуск нового продукта
  - новое направление
  - выход на рынок
  - GTM
problem:
  "До execution не связаны рынок, сегмент, предложение и спрос."
desired_outcome:
  "Получить обоснованную последовательность решений и путь запуска."
commercial_route: launch
offer: GL-A
```

---

## DS3 — Site / Demand Mismatch

```yaml
id: DS3
priority: primary
segments: [P1]
surface_language:
  - сайт не продает
  - нет заявок
  - нужен новый сайт
  - аудит лендинга
  - сайт под SEO
problem:
  "Сайт / landing не соответствует сегменту, спросу, предложению или критериям выбора."
desired_outcome:
  "Пересобрать сайт от demand logic до production."
commercial_routes:
  - site-demand
  - sfd
offer: GL-B
```

---

## DS5 — Internal Capability Gap

```yaml
id: DS5
priority: secondary
segments: [P2]
problem:
  "Команда есть, но для проекта не хватает cross-functional senior capability."
desired_outcome:
  "Закрыть bounded project вместе с внутренней командой."
commercial_route: marketing-consulting
offer: GL-C
```

---

## DS2 — Fragmentation / Orchestration

```yaml
id: DS2
priority: underlying
status: hypothesis
usage:
  - sales diagnosis
  - supporting argument
  - case narrative
not_primary_headline: true
```

---

## DS4 — Failed Agency / Trust Reset

```yaml
id: DS4
priority: trust_overlay
usage:
  - proof
  - objections
  - process transparency
message_rule:
  "diagnosis and visible decision logic before large promises"
```

---

## DS6 — AI Adoption

```yaml
id: DS6
priority: experimental
usage:
  - content
  - future capability test
not_primary_commercial_route: true
```

---

# 4. Positioning Contract

```yaml
positioning:
  core_semantic_claim:
    "ANMA решает конкретные сложные маркетинговые задачи, требующие нескольких связанных компетенций, и доводит решение от анализа до нужной реализации."
  message_order:
    - situation
    - problem
    - desired_outcome
    - approach
    - proof
    - senior_accountability
    - AI_and_ANWE
  supporting_difference:
    - one_senior_accountable_owner
    - connected_capabilities
    - strategy_to_production_continuity
    - AI_native_production
  AI_role:
    - operating_model
    - reason_to_believe
  AI_not:
    - primary_value_proposition
    - guaranteed_outcome
```

Forbidden core claims:

```text
заменим весь отдел маркетинга
один человек + AI заменит агентство из 20 человек
дешевле всех благодаря AI
маркетинг под ключ для любого бизнеса
гарантируем рост продаж
лучшее AI-агентство
уникальная технология без аналогов
```

---

# 5. Public Offer Contract

## SFD

```yaml
internal_id: SFD
public_label: SFD — диагностика посадочной
public_label_status: working_approved
status: strategic_ready
functional_status: BLOCKED_BY_SFD_RUNTIME_CONTRACT
segment: P1
demand: DS3
scope:
  - one page
  - one intended segment
  - one primary CTA
not:
  - full SEO audit
  - full UX audit
  - full marketing audit
  - ICP selection
  - GTM strategy
next_route: site-demand
```

Message intent:

> Проверить соответствие конкретной посадочной заявленному сегменту и целевому действию.

---

## GL-A

```yaml
internal_id: GL-A
family_internal: Growth Launch
public_label: Запуск / перезапуск
public_label_status: working_approved
segment:
  - P1
  - P2
demand: DS1
pricing: UNKNOWN
scope_rule: modular
```

Message intent:

> Сначала связать рынок, сегмент, предложение и спрос; затем выбирать и производить launch assets.

---

## GL-B

```yaml
internal_id: GL-B
family_internal: Growth Launch
public_label: Сайт и спрос
public_label_status: working_approved
segment: P1
demand: DS3
pricing: UNKNOWN
scope_rule: modular
```

Message intent:

> Проектировать сайт как продолжение спроса и маркетинговых решений, а не начинать с дизайна.

---

## GL-C

```yaml
internal_id: GL-C
family_internal: Growth Launch
public_label: Маркетинговый консалтинг
public_label_status: working_approved
alternative_public_label: Проектная маркетинговая экспертиза
segment:
  - P2
  - selected P1
  - opportunistic P3
demand: DS5
pricing: UNKNOWN
scope_rule: bounded_project
```

Message intent:

> Подключить senior-level capability на конкретную задачу без замены внутренней команды.

---

## Growth Engine

```yaml
internal_id: GROWTH_ENGINE
public_label: UNKNOWN
status: hypothesis
public_at_launch: false_by_default
rule: only_after_real_recurring_job
possible_scope:
  - SEO
  - content
  - analytics
  - CRO
  - site iteration
  - CRM / lifecycle when relevant
```

---

# 6. Proof Contract

Priority:

```text
1. External ANMA case
2. External pilot metrics / testimonial
3. Founder track record
4. Process / methodology proof
5. ANMA Client #0
6. AI / ANWE technology proof
```

## Public proof rules

```yaml
proof_rules:
  founder_metrics:
    publication: BLOCKED_UNTIL_SOURCE_VERIFIED
  external_case_claims:
    publication: only_if_real_and_publishable
  client_zero:
    label: ANMA Client #0 / собственный проект
    must_not_be_labeled_client_case: true
  AI_speed_claim:
    numeric_claims: BLOCKED_UNTIL_MEASURED
  testimonials:
    publication: only_real_attributable
```

---

# 7. Copy Contract

```yaml
copy:
  tone:
    - direct
    - evidence-based
    - senior
    - calm
    - business-first
  avoid:
    - AI hype
    - generic superlatives
    - magic
    - cheapness-first
    - guarantees without evidence
  freedom:
    ANWE_may_rewrite: true
    ANWE_may_change_semantic_claim: false
    ANWE_may_upgrade_hypothesis_to_fact: false
    ANWE_may_invent_proof: false
    ANWE_may_invent_price: false
```

Internal terms should not automatically appear publicly:

```text
P1/P2/P3
DS1/DS3/etc.
GL-A/GL-B/GL-C
Capability Sprint
Growth Launch
Growth Engine
Human Gate
```

They may be translated into familiar public language.

---

# 8. CTA Contract

```yaml
CTA:
  global:
    primary: Обсудить задачу
  launch:
    primary: Разобрать задачу запуска
  site_demand:
    primary: Обсудить сайт и спрос
    secondary: Проверить посадочную
  sfd:
    primary: Проверить посадочную
  marketing_strategy:
    primary: Обсудить стратегическую задачу
  marketing_consulting:
    primary: Обсудить задачу команды
```

Rule:

> One primary CTA per page. Secondary CTA only if it is a genuinely different lower-friction route.

---

# 9. Release Scope

## launch_core

```text
home
launch
site-demand
sfd
marketing-strategy
marketing-consulting
method
about
contact
```

## launch_if_ready

```text
cases-or-experience
insights-hub
```

## minimum_content

```text
insight-launch-guide
insight-site-not-selling
```

## early_content

```text
insight-redesign
insight-choose-agency
insight-strategy-vs-plan
```

## deferred

```text
dedicated SEO service
context ads
content service
CRO service
analytics service
CRM service
SMM service
branding service
design service
AI-agency service
enterprise landing
```

---

# 10. Page Contracts

## PAGE — Home

```yaml
id: home
path_working: /
release: launch_core
primary_role: route_and_credibility
segments: [P1, P2]
secondary_segment: P3
primary_conversion: global
primary_intent: brand/direct/referral verification
message_intent:
  "ANMA помогает решить сложную маркетинговую задачу от анализа до нужной реализации."
required_content_units:
  - familiar category / what ANMA is
  - three situation routes: launch / site-demand / team capability
  - simplified approach: evidence -> decision -> demand -> implementation
  - product-route explanation
  - accountable senior explanation
  - AI/ANWE supporting explanation
  - strongest available proof
  - method transparency
  - primary CTA
optional_content_units:
  - SFD secondary route
  - selected content
forbidden_content:
  - generic long service catalog
  - AI as hero promise
  - unsupported client logos / claims
proof:
  - founder_verified
  - external_case_if_available
  - process
internal_links:
  - launch
  - site-demand
  - marketing-consulting
  - marketing-strategy
  - method
  - about
  - cases-or-experience if published
copy_freedom: wording_flexible_semantics_fixed
```

---

## PAGE — Launch

```yaml
id: launch
path_working: /launch/
release: launch_core
segment: [P1, P2]
demand: DS1
primary_intent_owner:
  - вывод нового продукта / направления
  - launch / relaunch
  - GTM
primary_conversion: launch
message_intent:
  "Не начинать execution, пока не связаны рынок, сегмент, предложение и спрос."
required_content_units:
  - recognition of launch situations
  - risks of wrong sequence
  - decisions ANMA helps make
  - possible outputs
  - modular scope boundary
  - how project proceeds
  - proof
  - CTA
forbidden_content:
  - mandatory website in every launch
  - guarantee of PMF / sales
  - generic list of all agency services
SEO_not_owner:
  - generic standalone marketing strategy
links:
  - marketing-strategy
  - method
  - launch-guide
  - contact
```

---

## PAGE — Site & Demand

```yaml
id: site-demand
path_working: /site-demand/
release: launch_core
segment: P1
demand: DS3
primary_intent_owner:
  - сайт + спрос
  - сайт под SEO / продвижение
  - пересборка сайта
primary_conversion: site_demand
message_intent:
  "Сайт проектируется из сегмента, спроса и сообщения; дизайн/production идут после маркетинговых решений."
required_content_units:
  - symptoms
  - why redesign alone may fail
  - demand -> message -> structure -> SiteContext -> production
  - what ANWE does and does not do
  - who this route fits
  - proof
  - CTA
optional_content_units:
  - SFD secondary route
forbidden_content:
  - generic web studio promise
  - automatic SEO guarantee
SEO_not_owner:
  - informational "почему сайт не продаёт"
  - transactional landing audit
links:
  - sfd
  - site-not-selling
  - method
  - contact
```

---

## PAGE — SFD

```yaml
id: sfd
path_working: /sfd/
release: launch_core
segment: P1
demand: DS3
functional_status: BLOCKED_BY_SFD_RUNTIME_CONTRACT
primary_intent_owner:
  - аудит лендинга
  - аудит посадочной
primary_conversion: sfd
message_intent:
  "Узкая диагностика соответствия page × segment × CTA."
required_content_units:
  - exact scope
  - visible criteria
  - exclusions
  - what free result means
  - input placeholder
  - result placeholder
  - contact-gate placeholder
  - next route
forbidden_content:
  - claim of full SEO/UX/marketing audit
  - runtime fields invented by ANWE
  - conversion guarantee
links:
  - site-demand
  - site-not-selling
```

---

## PAGE — Marketing Strategy

```yaml
id: marketing-strategy
path_working: /marketing-strategy/
release: launch_core
segments: [P1, P2]
primary_intent_owner:
  - разработка маркетинговой стратегии
  - стратегический маркетинг
primary_conversion: marketing_strategy
message_intent:
  "Стратегия — система решений и приоритетов, а не только презентация."
required_content_units:
  - business questions solved
  - inputs / evidence
  - outputs / decisions
  - what happens after strategy
  - standalone vs implementation boundary
  - proof
  - CTA
forbidden_content:
  - imply that strategy alone guarantees business outcome
SEO_not_owner:
  - GTM launch intent where launch is the core need
  - external team capability intent
links:
  - launch
  - marketing-consulting
  - method
  - contact
```

---

## PAGE — Marketing Consulting

```yaml
id: marketing-consulting
path_working: /marketing-consulting/
release: launch_core
segment: P2
secondary_segments:
  - selected P1
  - P3 opportunistic
demand: DS5
primary_intent_owner:
  - маркетинговый консалтинг
  - внешняя senior expertise
  - external CMO adjacent only
primary_conversion: marketing_consulting
message_intent:
  "ANMA усиливает внутреннюю команду в bounded project, а не забирает весь маркетинг."
required_content_units:
  - capability-gap situations
  - bounded scope
  - responsibility boundary
  - collaboration with internal owner
  - example project types
  - founder senior proof
  - handoff / artifacts
  - CTA
forbidden_content:
  - replace-your-team claim
  - claim of full CMO responsibility unless actually scoped
SEO_not_owner:
  - standalone strategy purchase
links:
  - marketing-strategy
  - launch
  - method
  - contact
```

---

## PAGE — Method

```yaml
id: method
path_working: /method/
release: launch_core
primary_role: process_proof
primary_conversion: global
message_intent:
  "Evidence -> hypotheses -> human decision -> demand -> implementation -> measurement."
required_content_units:
  - research/evidence
  - hypothesis discipline
  - segmentation / strategy
  - demand architecture
  - implementation
  - Human review / gates in familiar language
  - FACT vs HYPOTHESIS
  - feedback loop
  - AI limitations
forbidden_content:
  - synthetic interview represented as real CustDev
  - private prompt dump
  - methodology guarantees results
links:
  - launch
  - site-demand
  - marketing-strategy
  - about
```

---

## PAGE — About

```yaml
id: about
path_working: /about/
release: launch_core
primary_role: human_accountability
primary_conversion: global
message_intent:
  "За стратегические решения отвечает конкретный senior-маркетолог; AI расширяет production capability."
required_content_units:
  - accountable founder
  - relevant verified experience
  - agency operating model
  - human vs AI responsibility
  - ANMA vs ANWE distinction
  - contractor role if needed
forbidden_content:
  - pretend-large-agency framing
  - faceless AI factory framing
  - unverified experience metrics
links:
  - method
  - experience
  - contact
```

---

## PAGE — Contact

```yaml
id: contact
path_working: /contact/
release: launch_core
primary_role: qualification
primary_conversion: submit_contact
functional_status: BLOCKED_BY_CONTACT_ENDPOINT
message_intent:
  "Опишите, что сейчас происходит и какую задачу нужно решить."
required_content_units:
  - short expectation of next step
  - minimal form shell
  - privacy/consent slot
form_data_intent:
  - name
  - contact
  - company_or_site
  - task
optional:
  - timing
  - budget_context
forbidden_content:
  - invented response SLA
  - invented contact channel
  - oversized questionnaire
```

---

## PAGE — Cases / Experience

```yaml
id: experience
path_working: /cases/
release: launch_if_ready
public_label_rule:
  if_external_case_available: Кейсы
  else: Опыт и проекты
publish_condition:
  "At least one publishable proof object with honest status."
required_labels:
  - External ANMA case
  - Pilot
  - Founder track record
  - ANMA Client #0
message_intent:
  "Показывать problem -> evidence -> decision -> implementation -> result, with limitations."
forbidden_content:
  - Client #0 as external client
  - founder history as ANMA client work
  - fabricated metrics/testimonials
```

---

## PAGE — Insights Hub

```yaml
id: insights
path_working: /insights/
release: launch_if_ready
publish_condition:
  "Enough published content to justify a hub; otherwise articles may exist without prominent hub."
primary_role: demand_and_authority
content_taxonomy:
  - Launch / GTM
  - Site / Demand
  - Strategy / Research
  - External Marketing / Trust
  - AI-native Marketing
```

---

# 11. Content Contracts

## Launch / GTM Guide

```yaml
id: launch-guide
release: minimum_content
intent: informational
route_to: launch
message_intent:
  "Запуск — последовательность связанных решений, не параллельная закупка execution."
```

## Site Not Selling

```yaml
id: site-not-selling
release: minimum_content
intent: informational_problem
route_to: sfd
message_intent:
  "Причина может быть в traffic, segment, offer, trust, page or post-lead process; redesign is one hypothesis."
```

## Redesign vs Marketing Problem

```yaml
id: redesign-guide
release: early_content
route_to:
  - sfd
  - site-demand
```

## How to Choose Agency

```yaml
id: choose-agency
release: early_content
route_to:
  - method
  - experience
  - contact
```

## Strategy vs Promotion Plan

```yaml
id: strategy-vs-plan
release: early_content
route_to: marketing-strategy
```

---

# 12. SEO Ownership Contract

```yaml
SEO:
  semantic_core_status: PARTIAL
  final_slug_status: PROVISIONAL
  rules:
    - one primary intent family per page where possible
    - do not merge commercial and informational intent without evidence
    - public language may differ from internal product language
    - generic agency SEO is secondary
    - AI-agency terminology is not primary commercial acquisition
```

Ownership:

```text
Launch
→ launch / relaunch / GTM / вывод продукта

Marketing Strategy
→ standalone strategy / strategic marketing

SFD
→ landing audit / landing diagnosis

Site & Demand
→ site + demand / site under SEO / rebuild

Site Not Selling
→ why no leads / why site does not sell

Marketing Consulting
→ consulting / external senior capability

Choose Agency
→ agency selection / trust
```

---

# 13. Analytics Contract

## Site events

```text
cta_click
contact_form_start
contact_form_submit
sfd_start
sfd_complete
sfd_contact_submit
content_to_commercial_click
case_view
method_view
```

## Event context

```text
source
medium
campaign
entry_page
page_family
demand_situation
segment_hypothesis
offer_route
```

## External business sync

Desired later:

```text
lead
→ qualified
→ proposal
→ won/lost
→ revenue
```

This requires CRM/process integration and is not guaranteed by static site generation.

---

# 14. Production Blockers

## PB-01 Contact

```yaml
status: BLOCKER_FOR_FUNCTIONAL_RELEASE
need:
  - chosen contact endpoint
  - form delivery
  - consent behavior
```

## PB-02 SFD runtime

```yaml
status: BLOCKER_FOR_FUNCTIONAL_SFD
need:
  - exact input fields
  - free output contract
  - gating
  - full-result delivery
  - proposal trigger
```

## PB-03 Legal / privacy

```yaml
status: BLOCKER_FOR_PUBLIC_DATA_COLLECTION
need:
  - privacy policy
  - personal-data consent
  - analytics/cookie requirements as applicable
  - SFD URL/business-data processing policy
```

## PB-04 Proof publication

```yaml
status: BLOCKER_FOR_UNVERIFIED_CLAIMS
need:
  - verified founder metrics selected for public use
  - current status of SMD
  - current status of Interior Stairs
  - real testimonials if available
```

---

# 15. Non-Blocking Unknowns

```text
exact pricing
final logo
final colors
final typography
full Wordstat export
final slugs
Growth Engine public naming
long-term enterprise architecture
```

These may be resolved downstream or before release without changing the strategic SiteContext.

---

# 16. Blueprint Composition Rules

When ANWE evaluates the Blueprint Library:

1. Preserve every `launch_core` page unless explicit human change.
2. Do not create a service catalog because the Blueprint expects one.
3. Do not merge pages with different primary search intents.
4. Do not split pages merely to fit a pattern.
5. Do not expose internal product IDs by default.
6. Keep one primary conversion per page.
7. Keep proof status honest.
8. Support conditional pages.
9. Support incomplete functional modules (SFD/contact) as blockers rather than inventing behavior.
10. Report every mismatch as a **Blueprint Gap**, not silently adapt SiteContext.

---

# 17. Visual Semantics — only requirements

ANWE should find suitable representations for:

```text
client situations
evidence -> decision -> demand -> implementation
real proof artifacts
human accountability + AI production
site-demand relationship
SFD diagnostic result
```

Avoid making the visual concept depend on:

```text
robots
neon AI brains
generic futuristic dashboards
stock teamwork
```

This is not a color/style decision.

---

# 18. Human Gate #3 Checklist

Approve or change:

- [ ] P1 primary / P2 secondary.
- [ ] DS1 and DS3 primary routes.
- [ ] DS5 secondary.
- [ ] DS2 supporting hypothesis.
- [ ] AI as supporting layer.
- [ ] Public offer labels.
- [ ] Core release pages.
- [ ] Cases page conditional rule.
- [ ] SFD remains required route but functionally blocked until runtime contract.
- [ ] Contact form functionally blocked until endpoint selected.
- [ ] Proof publication requires source verification.
- [ ] ANWE must perform Blueprint Gap Analysis instead of forcing SiteContext into existing Blueprint.

---

# 19. Status

```text
STAGE 11 — COMPLETE

SITE_CONTEXT_ANMA_V1_APPROVED
STATUS:
CRITIC_APPROVED
HUMAN_GATE_3_PENDING

NEXT AFTER HUMAN APPROVAL:
ANWE
→ Blueprint Gap Analysis
→ ANMA SiteBlueprint
→ SiteContext ↔ SiteBlueprint Composition
→ SiteModel
```
