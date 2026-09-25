import { track, type AnalyticsEvent, type AnalyticsSpec } from './track';

type YandexFunction = ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number };
type AnalyticsWindow = Window & { ym?: YandexFunction; gtag?: (...args: unknown[]) => void };

function installYandex(counterId: string | number): void {
  const w = window as AnalyticsWindow;
  if (!w.ym) {
    const queue: YandexFunction = (...args: unknown[]) => { queue.a = queue.a || []; queue.a.push(args); };
    queue.l = Date.now();
    w.ym = queue;
  }
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://mc.yandex.ru/metrika/tag.js';
  document.head.append(script);
  w.ym(counterId, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true });
}

function installGa4(measurementId: string): void {
  const w = window as AnalyticsWindow;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.append(script);
  w.dataLayer = w.dataLayer || [];
  w.gtag = w.gtag || ((...args: unknown[]) => { w.dataLayer?.push(args as unknown as Record<string, unknown>); });
  w.gtag('js', new Date());
  w.gtag('config', measurementId);
}

export function initAnalytics(): void {
  let spec: AnalyticsSpec | null = null;
  try {
    const element = document.getElementById('anwe-analytics-config');
    if (element) spec = JSON.parse(element.textContent || 'null') as AnalyticsSpec;
  } catch { return; }
  if (!spec?.enabled) return;
  const ym = spec.providers?.yandex_metrika;
  if (ym?.enabled && ym.counter_id) { try { installYandex(ym.counter_id); } catch { /* provider may be blocked */ } }
  const ga = spec.providers?.ga4;
  if (ga?.enabled && ga.measurement_id) { try { installGa4(ga.measurement_id); } catch { /* provider may be blocked */ } }
  window.anweAnalytics = { track: (name, payload = {}) => track(name, payload, spec || undefined) };

  document.addEventListener('click', (event) => {
    const target = event.target;
    const link = target instanceof Element ? target.closest('a[href]') as HTMLAnchorElement | null : null;
    if (!link) return;
    const href = link.getAttribute('href') || '';
    const explicit = link.dataset.analyticsEvent as AnalyticsEvent | undefined;
    const id = link.dataset.analyticsId;
    const blockId = link.closest('.block')?.id;
    const api = window.anweAnalytics;
    if (!api) return;
    if (explicit && id) api.track(explicit, { analytics_id: id, block_id: blockId, destination: href });
    else if (/^tel:/i.test(href)) api.track('phone_click', { analytics_id: id || `phone-${blockId || 'site'}`, block_id: blockId });
    else if (/^mailto:/i.test(href)) api.track('email_click', { analytics_id: id || `email-${blockId || 'site'}`, block_id: blockId });
    else if (/(?:wa\.me|api\.whatsapp\.com|t\.me|telegram\.me|viber\.com|m\.me)(?:\/|$)/i.test(href)) api.track('messenger_click', { analytics_id: id || `messenger-${blockId || 'site'}`, block_id: blockId, messenger: href });
    else if (link.classList.contains('action-link--primary') && blockId) api.track('cta_click', { analytics_id: `${blockId}-primary-cta`, block_id: blockId, destination: href });
  });
  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.dataset.analyticsId) return;
    window.anweAnalytics?.track('lead_submit', { analytics_id: form.dataset.analyticsId, block_id: form.closest('.block')?.id, form_id: form.dataset.formId });
  });
}
