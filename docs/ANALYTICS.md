# ANWE Analytics Layer v0.1

The Event Registry in `contracts/analytics-events.json` defines canonical ANWE events and their required/optional parameters. Site-specific provider IDs and explicit element bindings belong in `sites/<site-id>/ANALYTICS_SPEC.json`, validated by `contracts/analytics-spec.schema.json`.

`src/analytics/track.ts` is the single event router. It emits the canonical event to `window.dataLayer`, Yandex Metrika `reachGoal`, and GA4 `gtag('event', ...)` independently. Provider tags are installed in `SiteLayout` only when enabled and configured. Block IDs already supplied by SiteModel remain HTML IDs; explicit stable analytics IDs use `data-analytics-id`, independent of styling.

`npm run build` and `npm run check:analytics` generate `sites/<site-id>/ANALYTICS_GOALS.md` from the event registry and that site's AnalyticsSpec. The report lists configured targets and provider goal/event names; account-level goal and key-event settings remain operator-managed.

To install after Review Build, read this guide and the registry, inspect the site's SiteModel/Human Layer, assign meaningful stable bindings, write AnalyticsSpec, and run `npm run check:analytics` and `npm run build`. Return the providers, IDs, event-to-element mapping, and external goal/key-event setup still required. Create JavaScript event goals in Yandex Metrika using the mapped event IDs. In GA4 mark `generate_lead` as a key event in the property if desired. These account settings are not created by this repository integration.

Example `ANALYTICS_SPEC.json` (replace IDs and bindings with the actual site elements):

```json
{
  "schema_version": "0.1",
  "enabled": true,
  "providers": {
    "yandex_metrika": { "enabled": true, "counter_id": "12345678" },
    "ga4": { "enabled": true, "measurement_id": "G-XXXXXXXXXX" }
  },
  "bindings": [
    { "event": "lead_submit_success", "target": "lead-form", "parameters": { "form_id": "lead-form" }, "yandex_event": "lead_submit_success", "ga4_event": "generate_lead" },
    { "event": "cta_click", "target": "hero-primary-cta", "parameters": {}, "yandex_event": "cta_click", "ga4_event": "select_content" },
    { "event": "phone_click", "target": "header-phone", "parameters": {}, "yandex_event": "phone_click", "ga4_event": "contact" }
  ]
}
```

Operator command: `Добавь слой аналитики. Яндекс Метрика: 12345678. GA4: G-XXXXXXXXXX.`

Yandex goal delivery uses the official `ym(counterId, 'reachGoal', goalId, params)` API. GA4 uses the Google tag `gtag('event', eventName, params)` API. No provider is required and an absent/blocked provider does not prevent other integrations.

Unwired forms emit no success event. A transport that receives an authoritative success/failure must call `window.anweAnalytics.track('lead_submit_success'|'lead_submit_error', {analytics_id, block_id, ...})`; click or submit initiation alone is not a successful lead.
