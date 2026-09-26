<!-- Generated from contracts/analytics-events.json and this site's ANALYTICS_SPEC.json. -->

# Цели аналитики: anwe-studio

Состояние AnalyticsSpec: **включена**.
Яндекс Метрика: включена, счётчик 113078525.
GA4: включена, ресурс G-37KN8H6GRN.

| Событие | Значение | Цель / элемент | Яндекс Метрика | GA4 |
| --- | --- | --- | --- | --- |
| lead_submit | User initiated a valid form submission | `landing-audit-request` | `lead_submit` | `form_submit` |
| cta_click | User activated a meaningful CTA | `header-primary-cta` | `cta_header_primary` | `select_content` |
| cta_click | User activated a meaningful CTA | `hero-primary-cta` | `cta_hero_primary` | `select_content` |
| cta_click | User activated a meaningful CTA | `result-primary-cta` | `cta_result_primary` | `select_content` |

## Реестр событий

- `lead_submit` — User initiated a valid form submission. Обязательные параметры: `analytics_id`, `block_id`.
- `lead_submit_success` — Transport confirmed lead acceptance. Обязательные параметры: `analytics_id`, `block_id`.
- `lead_submit_error` — Transport reported a submission failure. Обязательные параметры: `analytics_id`, `block_id`.
- `cta_click` — User activated a meaningful CTA. Обязательные параметры: `analytics_id`, `block_id`.
- `phone_click` — User activated a telephone link. Обязательные параметры: `analytics_id`.
- `email_click` — User activated an email link. Обязательные параметры: `analytics_id`.
- `messenger_click` — User activated a supported messenger link. Обязательные параметры: `analytics_id`.

Цели и key events в аккаунтах провайдеров настраиваются отдельно. В GA4 при необходимости отметьте событие конверсии как key event; в Метрике создайте JavaScript-цели с указанными выше идентификаторами.
