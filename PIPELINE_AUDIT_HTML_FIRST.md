# ANWE HTML-first architecture audit

Audit date: 2026-09-20.  Audit mode: read-only; the only new file is this requested report.

## 1. Executive summary

The current repository has a real, partially implemented `SiteContext -> SiteModel -> MachineSpec -> Human Layer -> Theme` path for SMD. Its schema, machine validation, renderer, Theme Compiler, and SMD route are reachable. The target defined by the current root `AGENTS.md`, however, cannot yet be reproduced for a new HTML-first, operator-refinable site without changing contracts and instructions.

The decisive gaps are: SiteModel is contractually forbidden from carrying semantic icon choices; there is no structural Operator Media Block; the default `npm run check` omits both Review-Build checks; and the only production route is hard-wired to `sites/smd`. Historical SiteBlueprint/Block Library Alpha material remains referenced by development checks and documentation, but must not steer a new canonical rebuild.

Current working tree was already dirty before the audit: `AGENTS.md` modified and `sites/smd/media/` untracked. No existing file was edited.

## 2. Verified repository identity

| Item | Verified value |
| --- | --- |
| Working directory | `C:\\Project_all\\anwe` |
| Git root | `C:/Project_all/anwe` |
| HEAD | `dc456728898e3ce76d9ea36398407ac08050560b` |
| Required root objects | `AGENTS.md`, `package.json`, `contracts/`, `methodology/`, `prompts/`, `scripts/`, `src/`, `sites/`, `tests/` all present |
| Audit population | 141 non-`node_modules`/non-`dist` worktree files discovered; 142 tracked files; plus untracked `sites/smd/media/main_smd.png` |

Root `AGENTS.md` in the current working tree—not historical material—is the sole canonical target used below.

## 3. Canonical pipeline reachability map

| Stage | Canonical inputs/instructions | Reachable implementation | Assessment |
| --- | --- | --- | --- |
| SiteContext | `contracts/site-context.schema.json`, docs/methodology/registry | SMD `SITE_CONTEXT.json`; schema checks discover site artifacts | Current canonical input; no build-stage blocker found. |
| SiteModel | contract, methodology, prompt, registry, wrappers | SMD artifact; `check-site-model.mjs`; generic block registry | Reachable, but icon and operator-media requirements are not representable. |
| Machine Layer | contract, methodology, prompt, registry, wrappers | SMD artifact; semantic/negative validators; JSON-LD renderer | Reachable and internally consistent for checked artifacts. |
| Human Layer | SiteModel + MachineSpec plus `src/renderer`, components/layout/styles | `PageRenderer`, `BlockRenderer`, block registry, SMD route | Generic renderer exists; only SMD is wired as a production route. |
| Theme | ThemeSpec contract/prompt/methodology/registry | `compile.ts`, `ThemeStyle.astro`, SMD theme passed to renderer | Compiler is active; some canonical wording remains obsolete. |
| Review Build / STOP | package scripts and Astro build routes | `check:human-build` and `check:theme-build` exist, but are not included in `check` | Default acceptance command does not prove the full Review Build. |
| Operator refinement | root `AGENTS.md` only | DEV block labels and runtime image frame offer partial diagnostics/render support | No contract, validator, route convention, or structural `media` block implements the specified editing operation. |

## 4. Critical conflicts

### C-01 — Semantic icons cannot travel through SiteModel

- Severity: critical
- Exact file: `contracts/site-model.schema.json`, `$defs.CardItem.properties.icon` and `$defs.StepItem.properties.icon` (lines 72 and 79)
- Current behavior: both fields are `null` only. The contract rejects a Lucide name even though `src/components/Icon.astro` and cards/steps render an icon when one is present.
- Required behavior according to root `AGENTS.md`: Stage 1 may use supported semantic icons; Stage 3 must render them; operator refinement may add or replace an icon.
- Minimum correction scope: align SiteModel icon field(s), renderer types, SiteModel schema/semantic checks, Stage-1 methodology/prompt/registry, fixtures, and operator-edit validation around a bounded supported-icon representation.

### C-02 — Operator Media Block is not representable

- Severity: critical
- Exact file: `contracts/site-model.schema.json`, `$defs.Media` (lines 27–34), `$defs.Block` (line 108), and block definitions; `src/renderer/registry.ts` (block registry)
- Current behavior: `Media.src` is `null` only and media occurs only inside hero/split/CTA/gallery structures. There is no `media` block type for media-only, media-plus-text, or placeholder-plus-text, and no renderer registry entry. Runtime types can accept a string `src`, but the canonical schema cannot.
- Required behavior according to root `AGENTS.md`, “Operator Media Block”: after Review Build an operator can insert or replace with a standalone media block, using a concrete asset or placeholder and optional HTML text.
- Minimum correction scope: define a narrow post-review structural block contract (including asset/placeholder/text semantics), register/render it, and add focused validation/fixture coverage. Do not use an unvalidated nested-media workaround as the operator block.

### C-03 — Stage-1 instructions explicitly preserve the obsolete Visual Skill boundary

- Severity: critical
- Exact file: `prompts/site.model.build.json`, boundary rule 4; `methodology/site.model.build.md`, section 8; `checklist-registries/site.model.build-registry.md`, M073–M075
- Current behavior: prompt mandates cards/steps icons always `null`; methodology says “Visual Skill” chooses icons later; registry requires no Lucide name and describes visual decisions as later work.
- Required behavior according to root `AGENTS.md`: SiteModel designs a complete HTML-native composition and may select contract-supported semantic icons during SiteModel build; no autonomous post-Review visual stage exists.
- Minimum correction scope: make all three Stage-1 canonical inputs describe the same bounded HTML-native/icon decision responsibility as the revised SiteModel contract.

## 5. Important conflicts

### I-01 — Default validation omits Review-Build checks

- Severity: important
- Exact file: `package.json`, `scripts.check`
- Current behavior: `check` runs JSON, blueprints, block fixtures, schemas, SiteModel, MachineSpec, Theme Compiler, and Astro type checks, but omits existing `check:human-build` and `check:theme-build`.
- Required behavior according to root `AGENTS.md`: Review Build passes the existing canonical validators/build checks after Human Layer and after Theme.
- Minimum correction scope: designate the correct Review-Build commands in the canonical check path or document an explicit mandatory sequence; keep write-producing build behavior separate if needed.

### I-02 — Production routing is site-specific, not a generic SiteContext-to-site assembly mechanism

- Severity: important
- Exact file: `src/pages/smd/index.astro`
- Current behavior: the sole production-style route imports `../../../sites/smd/SITE_MODEL.json`, `MACHINE_SPEC.json`, and `THEME_SPEC.json` by literal path. A new site artifact directory has no route or automatic discovery path.
- Required behavior according to root `AGENTS.md`: generic Astro runtime renders `sites/<site-id>` artifacts after the automatic pipeline.
- Minimum correction scope: establish a deterministic generic site/route assembly convention and test it with more than SMD; preserve site facts in artifacts.

### I-03 — Canonical documentation still describes a future Theme Compiler

- Severity: important
- Exact file: `contracts/theme-spec.schema.json`, description; `checklist-registries/designer.theme.interpret-registry.md`, opening/“next stage” mapping statements
- Current behavior: contract says the Theme Compiler is future; registry says ThemeSpec field mapping will be defined at a next stage. `src/theme/compile.ts` and `ThemeStyle.astro` already implement an active compiler.
- Required behavior according to root `AGENTS.md`: Theme Compiler deterministically applies ThemeSpec to runtime now.
- Minimum correction scope: revise only stale descriptions/registry framing to match the active contract/compiler boundary.

### I-04 — Public project narrative encodes the superseded blueprint/lower-assembly scope

- Severity: important
- Exact file: `README.md` (opening and scope), `CHANGELOG.md` (0.1), `PROJECT_MAP.md` (ANMA/current-map assertions), `package.json` description
- Current behavior: these files describe SiteBlueprint library/Block Library Alpha, synthetic fixtures, and ANMA as current scope.
- Required behavior according to root `AGENTS.md`: current executable architecture is the SiteContext-led AI-first/HTML-first automatic pipeline with SMD site artifacts and operator refinement after Review Build.
- Minimum correction scope: reconcile current-facing documentation and metadata without deleting historical evidence; retain blueprints only in the limited reusable-knowledge role stated by root AGENTS.

### I-05 — Active SMD media asset cannot enter the valid artifact contract

- Severity: important
- Exact file: untracked `sites/smd/media/main_smd.png`; `contracts/site-model.schema.json`, Media `src`; `sites/smd/SITE_MODEL.json`
- Current behavior: the asset exists in the site directory, while valid SiteModel media permits only `src:null`; no current SMD block refers to it.
- Required behavior according to root `AGENTS.md`: an operator may explicitly select a site-specific media asset in an Operator Media Block after Review Build.
- Minimum correction scope: resolve C-02 first, then add an explicit contract-valid operator reference only when commanded. Do not infer media placement from the file’s presence.

## 6. Minor conflicts

### M-01 — Old test/demo vocabulary remains visible on root and demo routes

- Severity: minor
- Exact file: `src/pages/index.astro`; `src/data/demo.ts`; `tests/fixtures/demo-matrix.json`; `scripts/check-block-fixtures.mjs`
- Current behavior: root index and test fixtures present a fixed Block Library Alpha demo matrix with three legacy CSS themes.
- Required behavior according to root `AGENTS.md`: HTML-native generic blocks and compiled ThemeSpec are the current production vocabulary; historical/dev fixtures must not define new SiteModel behavior.
- Minimum correction scope: clearly label or isolate the demo as test/dev support and prevent its fixed vocabulary/order assertions from being mistaken for the canonical SiteModel specification.

### M-02 — Theme token coverage is intentionally partial for the stated visual vocabulary

- Severity: minor
- Exact file: `contracts/theme-spec.schema.json`; `src/theme/compile.ts`; `src/styles/base.css`
- Current behavior: compiler exposes colors, typography, three spacing tokens, radii, card border/shadow. `spacing.density` has no consumer (documented in `docs/THEME_SPEC_V0_1.md`), and no tokens exist for semantic icon treatment, badges/chips, connector/separator, or diagram composition.
- Required behavior according to root `AGENTS.md`: supported HTML-native primitives use theme tokens.
- Minimum correction scope: inventory which primitives are actually supported, then either tokenise their visual roles or remove unsupported primitives from canonical claims. No new visual subsystem is implied.

## 7. Blockers

| ID | Severity | Exact file/field | Current behavior | Required behavior | Minimum correction scope |
| --- | --- | --- | --- | --- | --- |
| B-01 | critical | `contracts/site-model.schema.json` icon fields | Only null is valid. | SiteModel/operator-selected semantic icons are serializable and renderable. | Same coordinated scope as C-01. |
| B-02 | critical | `contracts/site-model.schema.json` block/media definitions; `src/renderer/registry.ts` | No standalone operator media structural unit; `src` cannot be a file path. | Insert/replace media-only, media+text, and placeholder+text after Review Build. | Same coordinated scope as C-02. |
| B-03 | important | `src/pages/smd/index.astro` | Literal SMD imports make the automatic pipeline non-generalizable to a newly built site. | Generic runtime can expose the reviewed output for a `sites/<site-id>` pipeline result. | Define an explicit artifact-to-route convention and verification. |
| B-04 | important | `package.json` `check` | Full review build is not invoked by the default check. | Existing required Human/Theme build verification is part of acceptance. | Correct check orchestration/documentation. |

## 8. SiteModel findings

`contracts/site-model.schema.json`, output wrapper, `check-site-model.mjs`, and SMD artifact form the active Stage-1 contract. It supports pages, order, stable IDs, factual copy, contacts/forms, surfaces, 12 generic block types, and nested null-only placeholders. It does not support semantic-icon values, standalone media, HTML text within such media, asset references, badges/chips, or explicit diagram primitives.

`check-site-model.mjs` discovers production `sites/*/SITE_MODEL.json`; this is a current canonical validator. It passed for four fixtures/artifacts. Passing validation does not cover the new icon/media requirements because the schema forbids them.

## 9. Machine Layer findings

MachineSpec contract, prompt, registry, validator, `structured-data.ts`, `StructuredData.astro`, `PageRenderer.astro`, and `SiteLayout.astro` are mutually reachable. Machine semantic validation passed: three fixtures plus SMD, and 20 negative regressions. It validates page parity, canonical paths, service reciprocity, breadcrumbs, sitemap/robots, placeholder exclusion, and readiness propagation.

The remaining gap is indirect: MachineSpec visible-content consistency is checked against the SiteModel that cannot encode the full target HTML-native/icon/media surface. Machine Layer itself must remain downstream of the repaired SiteModel rather than being expanded with presentation fields.

## 10. Human Layer findings

The generic renderer preserves input order, maps block IDs to HTML IDs, strictly joins pages by ID/path, emits machine metadata and JSON-LD, and applies forms/contacts. The registry supports header, hero, text, split, cards, steps, stats, gallery, FAQ, CTA, contacts, and footer. `Icon.astro` correctly renders installed Lucide icons but is unreachable from a schema-valid SiteModel because of C-01. `MediaFrame.astro` can render a non-null string source at runtime, but the contract blocks that legitimate path.

DEV `?debug=blocks` labels are useful operator diagnostics only; they are not an editing contract.

## 11. Theme findings

ThemeSpec is produced as a site artifact, compiled deterministically by `src/theme/compile.ts`, injected by `ThemeStyle.astro`, and consumed by `base.css`. The Theme Compiler check passed. This is CURRENT_CANONICAL/RUNTIME_DEPENDENCY.

The older static files under `src/themes/` are imported by the demo route and thus TEST_OR_DEV_SUPPORT, not safe removals. Their `data-theme` mechanism differs from the canonical compiled `data-theme-id` mechanism and should not become a production dependency.

## 12. Validators/tests findings

Read-only validations run successfully:

- `npm run check:site-model`: 4 SiteModel fixtures/artifacts OK.
- `npm run check:machine`: 3 fixtures plus 1 production artifact OK; 20 negative regression cases OK.
- `npm run check:theme`: Theme compiler determinism, mapping, safety, and CSS regression checks OK.

`check:human-build` and `check:theme-build` exist but were not run because this audit must not modify build outputs; importantly, neither is called by `npm run check`. Existing fixture suites encode the pre-icon/null-media contract and must be revised only with its intentional replacement.

## 13. Operator refinement findings

Root AGENTS defines operator refinement after STOP, but the repository has no operator command parser, edit schema, persistent operation log, structural media block, or validator for an operator delta. The runtime supports only the narrow visual consequences of already-valid model data. Therefore text reorder/delete/variant edits may be manually possible at JSON level, but they are not represented as a supported operator workflow; icon and media edits are blocked by contract.

## 14. Block library findings

The renderer registry and SiteModel union agree on 12 block types, so the present block library is internally coherent. It supplies much of the requested HTML-native base: cards, steps, stats, lists/FAQ, surfaces, grids, and lightweight placeholder compositions. It lacks a contract-supported semantic-icon choice and a media block, and it does not explicitly represent badges/chips/connectors/diagram compositions. Those are capability gaps, not authorization to introduce arbitrary site-specific blocks.

## 15. Repository directory inventory

| Directory | Purpose / classification | Inbound references | Canonical pipeline | Runtime | Tests/dev | Safe removal candidate | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `.git` | Git metadata | Git | no | no | yes | no | repository identity/history |
| `.astro` | Astro cache | Astro tooling | no | no | yes | no | generated tool state |
| `.kilo` | tool-owned metadata | no code reference found | no | no | unknown | no | ownership not established |
| `Archive` | historical legacy material; UNREFERENCED_CANDIDATE | none outside itself | no | no | no | yes | zero inbound text references; legacy AGENTS is not executable |
| `blueprints` | reusable knowledge; TEST_OR_DEV_SUPPORT | AGENTS, README, PROJECT_MAP, task | no direct input | no | yes | no | `check:blueprints`, registry/schema |
| `checklist-registries` | stage coverage; CURRENT_CANONICAL | AGENTS/docs | yes | no | yes | no | root stage read-lists |
| `contracts` | contracts; CURRENT_CANONICAL | 21 inbound files | yes | yes | yes | no | schemas, compiler, validators |
| `dist` | generated Astro output | no source import | no | deployment/build output | yes | no | output may be used for preview/deploy; no safe deletion proof |
| `docs` | human contract guides; CURRENT_CANONICAL with conflicts | 7 inbound | yes | no | yes | no | root stage read-lists |
| `methodology` | AI decision logic; CURRENT_CANONICAL with C-03 | AGENTS/docs | yes | no | yes | no | root stage read-lists |
| `node_modules` | installed dependencies | package manifest/lock | no | yes | yes | no | Astro/Ajv/Lucide dependencies |
| `prompts` | executable stage prompts; CURRENT_CANONICAL with C-03 | AGENTS/methodology/scripts | yes | no | yes | no | root stage read-lists |
| `schemas` | stage I/O wrappers; CURRENT_CANONICAL | AGENTS/prompts/scripts | yes | no | yes | no | stage wrappers/validator |
| `scripts` | deterministic checks; CURRENT_CANONICAL | package/AGENTS | yes | yes | yes | no | npm scripts |
| `sites` | site artifacts/operator assets; SITE_SPECIFIC | AGENTS, route, PROJECT_MAP | yes | yes | yes | no | SMD route and validators |
| `src` | generic Astro renderer; RUNTIME_DEPENDENCY | AGENTS/docs/scripts/routes | yes | yes | yes | no | production renderer/compiler |
| `tasks` | historical blueprint task; TEST_OR_DEV_SUPPORT | PROJECT_MAP only | no | no | yes | no | still documentation-linked |
| `templates` | SiteBlueprint template; TEST_OR_DEV_SUPPORT | README/PROJECT_MAP | no | no | yes | no | retained blueprint support |
| `tests` | fixtures/validation; TEST_OR_DEV_SUPPORT | 13 inbound files | yes | no | yes | no | validator and test routes |

## 16. Safe removal candidates

1. `Archive/legacy-visual-layer/AGENTS_VISUAL_LAYER_LEGACY.md` — candidate only. Exact inbound references: none found outside `Archive/`; no package script, import, route, schema, or validator references it. It conflicts historically but was treated only as evidence.

No other directory is a safe removal candidate. In particular, do not remove `blueprints/`, `templates/`, static demo themes, `dist/`, `.astro/`, or `.kilo/` solely because they are outside the current automatic runtime.

## 17. Files that should remain untouched

- Root `AGENTS.md` is the active target architecture (it was pre-modified; preserve current user work).
- `sites/smd/SITE_CONTEXT.json`, `SITE_MODEL.json`, `MACHINE_SPEC.json`, `THEME_SPEC.json`, and untracked `sites/smd/media/main_smd.png` are site-specific facts/current operator asset evidence.
- `contracts/machine-spec.schema.json`, `scripts/check-machine-spec*.mjs`, and `src/machine/structured-data.ts` passed their consistency suite and should not be broadened with presentation concerns.
- `src/theme/compile.ts`, `src/theme/ThemeStyle.astro`, and `src/styles/base.css` passed compiler regression coverage; retain their deterministic boundary while correcting only documented scope mismatches.

## 18. Recommended correction sequence

1. Freeze the root AGENTS target and explicitly classify all conflicting historical docs/prompts as audit subjects.
2. Repair the SiteModel contract for bounded semantic icons; align Stage-1 methodology, prompt, registry, wrapper, semantic validator, fixtures, types, and renderer.
3. Design the smallest post-Review Operator Media Block contract, then implement its renderer/validator/fixture path; do not fold it into automatic media selection.
4. Define a generic artifact-to-route convention so a new `sites/<site-id>` build can be reviewed without source edits per site.
5. Make Review-Build validation explicit in package orchestration while preserving audit/build-output safety.
6. Reconcile ThemeSpec registry/contract descriptions, README, CHANGELOG, PROJECT_MAP, and demo labels to the current pipeline.
7. After the above, update fixtures that deliberately encode null icons/media and run the complete canonical validation/build sequence.

## Audit totals

- Verified git root: `C:/Project_all/anwe`
- HEAD SHA: `dc456728898e3ce76d9ea36398407ac08050560b`
- Files inspected: 141 repository worktree files plus 142 tracked-file inventory and current SMD artifact directory
- Conflicts: 3 critical, 5 important, 2 minor
- Blockers: 4 (2 critical, 2 important)
- Removal candidates: 1
- Audit report: `C:\\Project_all\\anwe\\PIPELINE_AUDIT_HTML_FIRST.md`
