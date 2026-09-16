import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv/dist/2020.js';
import { validateSpec } from './check-machine-spec.mjs';

const root = path.resolve(process.cwd());
const loadJson = (relPath) => JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8'));
const clone = (value) => JSON.parse(JSON.stringify(value));

const machineSchema = loadJson('contracts/machine-spec.schema.json');
const ajv = new Ajv({ strict: true, allErrors: true });
const validateSchema = ajv.compile(machineSchema);

const confirmedInput = loadJson('tests/fixtures/machine-spec/fixture-confirmed-contacts-input.json');
const confirmedSpec = loadJson('tests/fixtures/machine-spec/fixture-confirmed-contacts-output.json');
const placeholderInput = loadJson('tests/fixtures/machine-spec/fixture-placeholder-contacts-input.json');
const placeholderSpec = loadJson('tests/fixtures/machine-spec/fixture-placeholder-contacts-output.json');
const partialInput = loadJson('tests/fixtures/machine-spec/fixture-a-input.json');
const partialSpec = loadJson('tests/fixtures/machine-spec/fixture-a-output.json');
const cases = [];

function invalid(id, mutate, ctx = confirmedInput.site_context, model = confirmedInput.site_model, spec = confirmedSpec) {
  const next = clone(spec);
  mutate(next);
  cases.push({ id, spec: next, ctx, model, shouldPass: false });
}
function positive(id, spec, ctx, model) {
  cases.push({ id, spec: clone(spec), ctx, model, shouldPass: true });
}

// A–G: retained published regression cases.
invalid('A extra machine page', (spec) => spec.pages.push({
  page_id: 'ghost-page', path: '/ghost/', semantic_role: 'other',
  meta: { title: 'Ghost', description: null }, canonical: { path: '/ghost/' },
  robots: { index: true, follow: true }, open_graph: { type: 'website', title: 'Ghost', description: null },
  breadcrumbs: [{ label: 'Главная', path: '/' }], primary_entity_id: 'organization', service_ids: [], sitemap: true
}));
invalid('B missing machine page', (spec) => { spec.pages = spec.pages.filter((page) => page.page_id !== 'services-consulting'); });
invalid('C wrong canonical path', (spec) => { spec.pages.find((page) => page.page_id === 'services-consulting').canonical.path = '/service/'; });
invalid('D invented breadcrumb', (spec) => { spec.pages.find((page) => page.page_id === 'services-consulting').breadcrumbs = [{ label: 'Главная', path: '/' }, { label: 'Услуги', path: '/fake/' }]; });
invalid('E placeholder contact leak', (spec) => {
  spec.primary_entity.contacts = {
    phone: { value: '+7 (000) 000-00-00', href: 'tel:+70000000000' },
    email: { value: 'example@mail.test', href: 'mailto:example@mail.test' }
  };
}, placeholderInput.site_context, placeholderInput.site_model, placeholderSpec);
invalid('F unknown service ref', (spec) => { spec.pages.find((page) => page.page_id === 'home').service_ids = ['missing-service']; });
invalid('G upstream readiness escalation', (spec) => { spec.status = 'ready'; spec.issues = []; }, placeholderInput.site_context, placeholderInput.site_model, placeholderSpec);

// H–S: corrective invariant regressions.
invalid('H forbidden source_model_id', (spec) => { spec.source_model_id = 'anything'; });
invalid('I empty Service.page_ids', (spec) => { spec.services[0].page_ids = []; });
invalid('J unknown service page', (spec) => { spec.services[0].page_ids = ['missing-page']; });
invalid('K reciprocal mismatch service to page', (spec) => { spec.pages.find((page) => page.page_id === 'home').service_ids = []; });
invalid('L reciprocal mismatch page to service', (spec) => { spec.services[0].page_ids = ['services-consulting']; });
invalid('M wrong entity home', (spec) => { spec.primary_entity.home_path = '/services/consulting/'; });
invalid('N OpenGraph article', (spec) => { spec.pages[0].open_graph.type = 'article'; });
invalid('O home breadcrumb present', (spec) => { spec.pages.find((page) => page.page_id === 'home').breadcrumbs = [{ label: 'Главная', path: '/' }]; });
invalid('P non-home breadcrumb empty', (spec) => { spec.pages.find((page) => page.page_id === 'services-consulting').breadcrumbs = []; });
invalid('Q breadcrumb contains current page', (spec) => { spec.pages.find((page) => page.page_id === 'services-consulting').breadcrumbs = [{ label: 'Главная', path: '/' }, { label: 'Консультация', path: '/services/consulting/' }]; });
invalid('R noindex in sitemap', (spec) => { const page = spec.pages.find((item) => item.page_id === 'services-consulting'); page.robots.index = false; page.sitemap = true; });
invalid('S embedded placeholder in metadata', (spec) => { spec.pages.find((page) => page.page_id === 'home').meta.title = 'Связаться: example@mail.test'; });

// T: upstream partial remains partial with no machine-stage issues.
positive('T upstream partial without machine issues', partialSpec, partialInput.site_context, partialInput.site_model);

let failures = 0;
for (const test of cases) {
  const schemaValid = validateSchema(test.spec);
  const schemaErrors = schemaValid ? [] : (validateSchema.errors ?? []).map((error) => `${error.instancePath || '/'}: ${error.message}`);
  const semanticErrors = validateSpec(test.id, test.spec, test.ctx, test.model);
  const rejectedBy = !schemaValid ? 'schema' : semanticErrors.length > 0 ? 'semantics' : null;

  if (test.shouldPass) {
    if (rejectedBy) {
      failures += 1;
      console.error(`REGRESSION TEST FAIL: ${test.id}: unexpectedly rejected by ${rejectedBy}: ${(rejectedBy === 'schema' ? schemaErrors : semanticErrors)[0]}`);
    } else console.log(`REGRESSION TEST OK: ${test.id}: accepted`);
  } else if (!rejectedBy) {
    failures += 1;
    console.error(`NEGATIVE TEST FAIL: ${test.id}: expected schema or semantic rejection but got none`);
  } else {
    const detail = (rejectedBy === 'schema' ? schemaErrors : semanticErrors)[0];
    console.log(`NEGATIVE TEST OK: ${test.id}: rejected by ${rejectedBy} — ${detail}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} regression test(s) failed`);
  process.exit(1);
}
console.log(`\nAll ${cases.length} MachineSpec regression cases passed.`);
