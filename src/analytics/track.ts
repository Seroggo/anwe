export type AnalyticsEvent = 'lead_submit' | 'lead_submit_success' | 'lead_submit_error' | 'cta_click' | 'phone_click' | 'email_click' | 'messenger_click';
export interface AnalyticsSpec {
  enabled: boolean;
  providers: { yandex_metrika?: { enabled: boolean; counter_id?: string | number | null }; ga4?: { enabled: boolean; measurement_id?: string | null } };
  bindings?: Array<{ event: AnalyticsEvent; target: string; parameters?: Record<string, unknown>; yandex_event?: string; ga4_event?: string }>;
}
declare global { interface Window { dataLayer?: Array<Record<string, unknown>>; ym?: (...args: unknown[]) => void; gtag?: (...args: unknown[]) => void; anweAnalytics?: { track: typeof track }; } }
const gaNames: Record<AnalyticsEvent, string> = { lead_submit: 'form_submit', lead_submit_success: 'generate_lead', lead_submit_error: 'form_error', cta_click: 'select_content', phone_click: 'contact', email_click: 'contact', messenger_click: 'contact' };
const requiredParameters: Record<AnalyticsEvent, string[]> = {
  lead_submit: ['analytics_id', 'block_id'], lead_submit_success: ['analytics_id', 'block_id'], lead_submit_error: ['analytics_id', 'block_id'],
  cta_click: ['analytics_id', 'block_id'], phone_click: ['analytics_id'], email_click: ['analytics_id'], messenger_click: ['analytics_id']
};
export function track(eventName: AnalyticsEvent, payload: Record<string, unknown> = {}, spec?: AnalyticsSpec): void {
  if (typeof window === 'undefined') return;
  if (!requiredParameters[eventName]?.every((key) => typeof payload[key] === 'string' && payload[key].length > 0)) return;
  const binding = spec?.bindings?.find((item) => item.event === eventName && (!payload.analytics_id || item.target === payload.analytics_id));
  const data = { ...binding?.parameters, ...payload, event: eventName };
  try { window.dataLayer = window.dataLayer || []; window.dataLayer.push(data); } catch { /* isolated provider failure */ }
  const ym = spec?.providers?.yandex_metrika;
  if (spec?.enabled && ym?.enabled && ym.counter_id && typeof window.ym === 'function') {
    try { window.ym(ym.counter_id, 'reachGoal', binding?.yandex_event || eventName, data); } catch { /* blocked or unavailable */ }
  }
  const ga = spec?.providers?.ga4;
  if (spec?.enabled && ga?.enabled && ga.measurement_id && typeof window.gtag === 'function') {
    try { const { event: _event, ...params } = data; window.gtag('event', binding?.ga4_event || gaNames[eventName], params); } catch { /* blocked or unavailable */ }
  }
}
