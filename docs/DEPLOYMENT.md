# ANWE Deployment Contract v0.1

## Purpose

This document defines the operator-managed production lifecycle for an ANWE site. It covers both the first publication and every later production update. Deployment is a separate, explicit operator action after Review Build and any requested refinement; it does not extend or restart the automatic site-generation pipeline.

## Lifecycle

```text
Review Build
→ STOP
→ Human Operator Refinement
→ Pre-deploy
→ explicit Deploy <site-id>
→ Production
→ further local change
→ validation/build
→ explicit Deploy <site-id>
→ Production update
→ ...
```

The automatic pipeline ends at Review Build. The operator may continue refining the site after the first publication. Each production publication, initial or subsequent, requires its own explicit `Deploy <site-id>` command. A local change alone never publishes to production.

## Source of truth and production state

- The local ANWE repository is the editable source of truth for site artifacts, source, and operator changes.
- Production hosting contains the published runtime state. It is a deployment target, not a second editable source of truth.
- An update is prepared from the current approved local state for the requested site. Changes made only on production are not treated as canonical source changes.
- Deployment does not automatically run the full SiteContext → SiteModel → Machine Layer → Human Layer → Theme pipeline. It publishes the current approved site state after the applicable local validation/build steps.

## Operator command and authorization

The target operator command is:

```text
Deploy <site-id>
```

The command is explicit authorization for the requested site's current approved local state to be published. It applies to both first publication and later updates. A Review Build, a successful build, or a pre-deploy review is not by itself deployment authorization.

## Pre-deploy and publication

Before each deployment, including the first, complete the applicable local validation/build checks and review the current site state for desktop/mobile structure, contacts, forms, and content. Resolve issues that prevent approval. Then deploy only the requested site's approved output.

The deployment mechanism must support repeatable publication from the local source of truth. It must not require VPS, Docker, CI/CD, or a particular hosting provider. This contract does not select a transfer protocol or prescribe implementation tooling.

## Ownership and preservation

Remote changes are limited to the production files and paths explicitly owned by the ANWE site deployment. Unrelated hosting content and files not established as ANWE-owned are preserved. A deployment must not use broad destructive operations against an ambiguously owned target. Any removal or replacement is limited to obsolete published artifacts whose ownership is established by the deployment contract/tooling and whose removal is necessary to make the requested site's published state match the approved local output.

## Rollback

Every deployment must provide a usable rollback to the immediately preceding known-good production runtime state. The rollback point must be established before the new state replaces production and retained until the new publication is accepted as healthy. Rollback restores published runtime state; the local repository remains the editable source of truth.

## Completion

A deployment is complete when the requested site's approved runtime state is published, the production result has been checked for availability and basic integrity, and a rollback path to the preceding known-good state remains available. The operator-managed lifecycle then returns to local refinement and validation; each further publication again requires `Deploy <site-id>`.

## Implementation-stage decisions

This contract intentionally leaves the following to a separate implementation task: transfer strategy, remote directory and ownership detection, backup/rollback mechanics and retention, hosting-specific commands or credentials, health-check details, and deploy-tool interface beyond the target operator command. Implementation must satisfy the ownership, preservation, and rollback requirements above.
