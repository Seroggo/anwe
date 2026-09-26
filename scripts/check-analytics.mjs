import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv/dist/2020.js';
import ts from 'typescript';

const root = process.cwd();
const ajv = new Ajv({ strict: true, allErrors: true });
const schema = JSON.parse(fs.readFileSync(path.join(root, 'contracts/analytics-spec.schema.json'), 'utf8'));
const validate = ajv.compile(schema);
const registry = JSON.parse(fs.readFileSync(path.join(root, 'contracts/analytics-events.json'), 'utf8'));
const eventMap = new Map(registry.events.map((event) => [event.name, event]));
let failed = false;
const sitesDir = path.join(root, 'sites');
for (const dir of fs.readdirSync(sitesDir, { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
  const file = path.join(sitesDir, dir.name, 'ANALYTICS_SPEC.json');
  if (!fs.existsSync(file)) continue;
  const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!validate(spec)) { console.error(`${dir.name}: invalid AnalyticsSpec`, validate.errors); failed = true; continue; }
  const ids = new Set();
  for (const binding of spec.bindings) {
    const event = eventMap.get(binding.event);
    if (!event) { console.error(`${dir.name}: unknown canonical event ${binding.event}`); failed = true; continue; }
    if (ids.has(binding.target)) { console.error(`${dir.name}: duplicate analytics target ${binding.target}`); failed = true; }
    ids.add(binding.target);
    for (const key of event.required_parameters) if (!(key in (binding.parameters || {})) && key !== 'analytics_id' && key !== 'block_id') { console.error(`${dir.name}: ${binding.event} missing required parameter ${key}`); failed = true; }
  }
  const goalsPath = path.join(sitesDir, dir.name, 'ANALYTICS_GOALS.md');
  if (!fs.existsSync(goalsPath)) { console.error(`${dir.name}: generated ANALYTICS_GOALS.md is missing; run npm run generate:analytics-goals`); failed = true; }
  else {
    const goals = fs.readFileSync(goalsPath, 'utf8');
    if (!goals.includes(`# Цели аналитики: ${dir.name}`)) { console.error(`${dir.name}: ANALYTICS_GOALS.md has no matching site heading`); failed = true; }
    for (const binding of spec.bindings) if (!goals.includes(`\`${binding.target}\``)) { console.error(`${dir.name}: ANALYTICS_GOALS.md is missing target ${binding.target}`); failed = true; }
  }
}

const tsPath = path.join(root, 'src/analytics/track.ts');
const js = ts.transpileModule(fs.readFileSync(tsPath, 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { track } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const clientSource = fs.readFileSync(path.join(root, 'src/analytics/client.ts'), 'utf8');
if (/addEventListener\('submit'[\s\S]*?track\('lead_submit_success'/.test(clientSource)) { console.error('form success is incorrectly tied to submit initiation'); failed = true; }
if (!clientSource.includes("if (!spec?.enabled) return;") || !clientSource.includes("if (ym?.enabled && ym.counter_id)") || !clientSource.includes("if (ga?.enabled && ga.measurement_id)")) { console.error('provider enable/ID guards missing'); failed = true; }
const calls = [];
globalThis.window = { dataLayer: [], ym: (...args) => calls.push(['ym', ...args]), gtag: (...args) => calls.push(['ga', ...args]) };
track('cta_click', { analytics_id: 'hero-primary-cta', block_id: 'hero' });
if (window.dataLayer.at(-1)?.event !== 'cta_click' || calls.length) { console.error('track() without providers failed'); failed = true; }
const beforeInvalid = window.dataLayer.length;
track('lead_submit_success', { analytics_id: 'lead-form' });
if (window.dataLayer.length !== beforeInvalid) { console.error('required event parameters were not enforced'); failed = true; }
const spec = { enabled: true, providers: { yandex_metrika: { enabled: true, counter_id: 123 }, ga4: { enabled: true, measurement_id: 'G-ABC123' } }, bindings: [{ event: 'lead_submit_success', target: 'lead-form', ga4_event: 'generate_lead', yandex_event: 'lead_submit_success' }] };
track('lead_submit_success', { analytics_id: 'lead-form', block_id: 'contact' }, spec);
if (!calls.some((call) => call[0] === 'ym' && call[2] === 'reachGoal' && call[3] === 'lead_submit_success')) { console.error('Yandex mapping failed'); failed = true; }
if (!calls.some((call) => call[0] === 'ga' && call[1] === 'event' && call[2] === 'generate_lead')) { console.error('GA4 mapping failed'); failed = true; }
window.ym = undefined;
calls.length = 0;
track('cta_click', { analytics_id: 'x', block_id: 'hero' }, { enabled: true, providers: { yandex_metrika: { enabled: true, counter_id: 2 }, ga4: { enabled: true, measurement_id: 'G-ABC123' } } });
if (!calls.some((call) => call[0] === 'ga')) { console.error('provider isolation failed'); failed = true; }
if (failed) process.exit(1);
console.log('Analytics checks passed: specs, canonical events, target uniqueness, routing and provider isolation');
