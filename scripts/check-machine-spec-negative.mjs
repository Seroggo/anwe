import fs from 'node:fs';
import path from 'node:path';
import { validateSpec } from './check-machine-spec.mjs';

const root = path.resolve(process.cwd());

function loadJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
}

const input = loadJson('tests/fixtures/machine-spec/fixture-confirmed-contacts-input.json');
const baseSpec = loadJson('tests/fixtures/machine-spec/fixture-confirmed-contacts-output.json');
const placeholderInput = loadJson('tests/fixtures/machine-spec/fixture-placeholder-contacts-input.json');
const placeholderSpec = loadJson('tests/fixtures/machine-spec/fixture-placeholder-contacts-output.json');

const cases = [];

// A. Extra machine page
{
  const spec = JSON.parse(JSON.stringify(baseSpec));
  spec.pages.push({
    page_id: 'ghost-page',
    path: '/ghost/',
    semantic_role: 'other',
    meta: { title: 'Ghost', description: null },
    canonical: { path: '/ghost/' },
    robots: { index: true, follow: true },
    open_graph: { type: 'website', title: 'Ghost', description: null },
    breadcrumbs: [{ label: 'Главная', path: '/' }],
    primary_entity_id: 'organization',
    service_ids: [],
    sitemap: true
  });
  cases.push({ id: 'A extra machine page', spec, ctx: input.site_context, model: input.site_model, expectFail: true });
}

// B. Missing machine page
{
  const spec = JSON.parse(JSON.stringify(baseSpec));
  spec.pages = spec.pages.filter((p) => p.page_id !== 'services-consulting');
  cases.push({ id: 'B missing machine page', spec, ctx: input.site_context, model: input.site_model, expectFail: true });
}

// C. Wrong canonical path
{
  const spec = JSON.parse(JSON.stringify(baseSpec));
  const page = spec.pages.find((p) => p.page_id === 'services-consulting');
  page.canonical.path = '/service/';
  cases.push({ id: 'C wrong canonical path', spec, ctx: input.site_context, model: input.site_model, expectFail: true });
}

// D. Invented breadcrumb
{
  const spec = JSON.parse(JSON.stringify(baseSpec));
  const page = spec.pages.find((p) => p.page_id === 'services-consulting');
  page.breadcrumbs = [{ label: 'Главная', path: '/' }, { label: 'Услуги', path: '/fake/' }];
  cases.push({ id: 'D invented breadcrumb', spec, ctx: input.site_context, model: input.site_model, expectFail: true });
}

// E. Placeholder contact leak
{
  const spec = JSON.parse(JSON.stringify(placeholderSpec));
  spec.primary_entity.contacts = {
    phone: { value: '+7 (000) 000-00-00', href: 'tel:+70000000000' },
    email: { value: 'example@mail.test', href: 'mailto:example@mail.test' }
  };
  cases.push({ id: 'E placeholder contact leak', spec, ctx: placeholderInput.site_context, model: placeholderInput.site_model, expectFail: true });
}

// F. Unknown service ref
{
  const spec = JSON.parse(JSON.stringify(baseSpec));
  const page = spec.pages.find((p) => p.page_id === 'home');
  page.service_ids = ['missing-service'];
  cases.push({ id: 'F unknown service ref', spec, ctx: input.site_context, model: input.site_model, expectFail: true });
}

// G. Upstream readiness escalation
{
  const spec = JSON.parse(JSON.stringify(placeholderSpec));
  spec.status = 'ready';
  spec.issues = [];
  cases.push({ id: 'G upstream readiness escalation', spec, ctx: placeholderInput.site_context, model: placeholderInput.site_model, expectFail: true });
}

let failures = 0;
for (const { id, spec, ctx, model, expectFail } of cases) {
  const errors = validateSpec(id, spec, ctx, model);
  if (expectFail && errors.length === 0) {
    console.error(`NEGATIVE TEST FAIL: ${id}: expected validation errors but got none`);
    failures += 1;
  } else if (!expectFail && errors.length > 0) {
    console.error(`NEGATIVE TEST FAIL: ${id}: unexpected errors:\n  - ${errors.join('\n  - ')}`);
    failures += 1;
  } else {
    console.log(`NEGATIVE TEST OK: ${id}: ${errors.length} error(s) — ${errors[0] ?? ''}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} negative test(s) failed`);
  process.exit(1);
}
console.log(`\nAll ${cases.length} negative tests passed (each correctly rejected).`);