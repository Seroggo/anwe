import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const PLACEHOLDER_TOKENS = ['+7 (000) 000-00-00', 'example@mail.test', 'tel:+70000000000', 'mailto:example@mail.test'];
const STATUS_RANK = { blocked: 0, partial: 1, ready: 2 };
const STATUS_FROM_RANK = ['blocked', 'partial', 'ready'];

function ownStatus(issues) {
  const severities = new Set((issues ?? []).map((issue) => issue.severity));
  return severities.has('critical') ? 'blocked' : severities.has('important') ? 'partial' : 'ready';
}

function confirmedContacts(siteModel) {
  const result = { phone: null, email: null };
  for (const page of siteModel.pages ?? []) for (const block of page.blocks ?? []) {
    if (block.type !== 'contacts') continue;
    for (const key of ['phone', 'email']) {
      const contact = block.content?.[key];
      if (contact?.status === 'confirmed' && !result[key]) result[key] = { value: contact.value, href: contact.href };
    }
  }
  return result;
}

function checkPlaceholderSubstring(errors, owner, value) {
  if (typeof value !== 'string') return;
  for (const token of PLACEHOLDER_TOKENS) if (value.includes(token)) errors.push(`${owner} contains placeholder token '${token}'`);
}

export function validateSpec(_name, spec, siteContext, siteModel) {
  const errors = [];
  const fail = (message) => errors.push(message);
  const sitePages = siteModel.pages ?? [];
  const sitePageIds = new Set(sitePages.map((page) => page.id));
  const sitePaths = new Set(sitePages.map((page) => page.path));

  if (spec.site_id !== siteModel.site_id) fail(`machine.site_id '${spec.site_id}' must equal site_model.site_id '${siteModel.site_id}'`);
  if (spec.source_context_id !== siteContext.context_id) fail(`machine.source_context_id '${spec.source_context_id}' must equal site_context.context_id '${siteContext.context_id}'`);
  if (siteModel.source_context_id !== siteContext.context_id) fail(`site_model.source_context_id '${siteModel.source_context_id}' must equal site_context.context_id '${siteContext.context_id}'`);

  const expectedStatus = STATUS_FROM_RANK[Math.min(STATUS_RANK[siteModel.status], STATUS_RANK[ownStatus(spec.issues)])];
  if (spec.status !== expectedStatus) fail(`status must be '${expectedStatus}' from min_readiness(SiteModel '${siteModel.status}', machine-own '${ownStatus(spec.issues)}') but got '${spec.status}'`);

  const entity = spec.primary_entity;
  if (!entity) fail('primary_entity missing');
  else {
    if (entity.home_path !== '/') fail(`primary_entity.home_path must be '/' but got '${entity.home_path}'`);
    if (!sitePaths.has('/')) fail('SiteModel must contain home path /');
    checkPlaceholderSubstring(errors, 'primary_entity.name', entity.name);
    checkPlaceholderSubstring(errors, 'primary_entity.description', entity.description);
    const confirmed = confirmedContacts(siteModel);
    for (const key of ['phone', 'email']) {
      const contact = entity.contacts?.[key];
      if (!contact) continue;
      checkPlaceholderSubstring(errors, `primary_entity.contacts.${key}.value`, contact.value);
      checkPlaceholderSubstring(errors, `primary_entity.contacts.${key}.href`, contact.href);
      if (!confirmed[key]) fail(`primary_entity.contacts.${key} set but SiteModel has no confirmed ${key}`);
      else if (confirmed[key].value !== contact.value || confirmed[key].href !== contact.href) fail(`primary_entity.contacts.${key} must match confirmed SiteModel ${key}`);
    }
  }

  const servicesById = new Map();
  for (const service of spec.services ?? []) {
    if (servicesById.has(service.id)) fail(`duplicate service id '${service.id}'`);
    servicesById.set(service.id, service);
    if (entity && service.provider_entity_id !== entity.id) fail(`service '${service.id}' provider_entity_id must equal primary_entity.id`);
    checkPlaceholderSubstring(errors, `service '${service.id}' name`, service.name);
    checkPlaceholderSubstring(errors, `service '${service.id}' description`, service.description);
    for (const pageId of service.page_ids ?? []) if (!sitePageIds.has(pageId)) fail(`service '${service.id}' references unknown SiteModel page_id '${pageId}'`);
  }

  const machineById = new Map();
  const machinePaths = new Set();
  for (const page of spec.pages ?? []) {
    if (machineById.has(page.page_id)) fail(`duplicate machine page_id '${page.page_id}'`);
    machineById.set(page.page_id, page);
    if (machinePaths.has(page.path)) fail(`duplicate machine page path '${page.path}'`);
    machinePaths.add(page.path);
    const source = sitePages.find((candidate) => candidate.id === page.page_id);
    if (!source) fail(`machine page_id '${page.page_id}' does not exist in SiteModel`);
    else if (page.path !== source.path) fail(`machine page '${page.page_id}' path '${page.path}' must equal SiteModel path '${source.path}'`);
    if (page.canonical?.path !== page.path) fail(`machine page '${page.page_id}' canonical.path '${page.canonical?.path}' must equal page path '${page.path}'`);
    if (page.path === '/' && page.semantic_role !== 'home') fail(`machine page '${page.page_id}' with path / must have semantic_role 'home'`);
    if (page.path !== '/' && page.semantic_role === 'home') fail(`machine page '${page.page_id}' with non-home path has semantic_role 'home'`);
    if (entity && page.primary_entity_id !== entity.id) fail(`machine page '${page.page_id}' primary_entity_id must equal primary_entity.id`);
    if (!page.meta?.title) fail(`machine page '${page.page_id}' meta.title must be non-empty`);
    for (const [owner, value] of [
      [`page '${page.page_id}' meta.title`, page.meta?.title], [`page '${page.page_id}' meta.description`, page.meta?.description],
      [`page '${page.page_id}' open_graph.title`, page.open_graph?.title], [`page '${page.page_id}' open_graph.description`, page.open_graph?.description]
    ]) checkPlaceholderSubstring(errors, owner, value);
    if (page.robots?.index === false && page.sitemap === true) fail(`machine page '${page.page_id}' has robots.index=false but sitemap=true`);

    const crumbs = page.breadcrumbs ?? [];
    if (page.path === '/' && crumbs.length !== 0) fail(`home machine page '${page.page_id}' must have empty breadcrumbs`);
    if (page.path !== '/' && crumbs.length < 1) fail(`non-home machine page '${page.page_id}' must have at least one breadcrumb`);
    if (page.path !== '/' && crumbs[0]?.path !== '/') fail(`non-home machine page '${page.page_id}' first breadcrumb path must be /`);
    const crumbPaths = new Set();
    for (const crumb of crumbs) {
      if (!sitePaths.has(crumb.path)) fail(`machine page '${page.page_id}' breadcrumb path '${crumb.path}' does not exist in SiteModel`);
      if (crumbPaths.has(crumb.path)) fail(`machine page '${page.page_id}' has duplicate breadcrumb path '${crumb.path}'`);
      crumbPaths.add(crumb.path);
      if (crumb.path === page.path) fail(`machine page '${page.page_id}' breadcrumb path must not equal current page path`);
      checkPlaceholderSubstring(errors, `machine page '${page.page_id}' breadcrumb label`, crumb.label);
    }
    for (const serviceId of page.service_ids ?? []) {
      const service = servicesById.get(serviceId);
      if (!service) fail(`machine page '${page.page_id}' references unknown service_id '${serviceId}'`);
      else if (!(service.page_ids ?? []).includes(page.page_id)) fail(`machine page '${page.page_id}' service '${serviceId}' is missing reciprocal service.page_ids reference`);
    }
  }

  if ((spec.pages ?? []).length !== sitePages.length) fail(`machine has ${(spec.pages ?? []).length} pages but SiteModel has ${sitePages.length}; must be equal`);
  for (const source of sitePages) if (!machineById.has(source.id)) fail(`SiteModel page '${source.id}' missing from MachineSpec`);
  for (const service of spec.services ?? []) for (const pageId of service.page_ids ?? []) {
    const page = machineById.get(pageId);
    if (page && !(page.service_ids ?? []).includes(service.id)) fail(`service '${service.id}' page '${pageId}' is missing reciprocal page.service_ids reference`);
  }
  return errors;
}

const fixtures = [
  ['fixture-a', 'tests/fixtures/machine-spec/fixture-a-input.json', 'tests/fixtures/machine-spec/fixture-a-output.json'],
  ['fixture-visible-service-selection', 'tests/fixtures/machine-spec/fixture-visible-service-selection-input.json', 'tests/fixtures/machine-spec/fixture-visible-service-selection-output.json'],
  ['fixture-confirmed-contacts', 'tests/fixtures/machine-spec/fixture-confirmed-contacts-input.json', 'tests/fixtures/machine-spec/fixture-confirmed-contacts-output.json'],
  ['fixture-placeholder-contacts', 'tests/fixtures/machine-spec/fixture-placeholder-contacts-input.json', 'tests/fixtures/machine-spec/fixture-placeholder-contacts-output.json']
];

if (path.resolve(process.argv[1] ?? '') === path.resolve(root, 'scripts/check-machine-spec.mjs')) {
  let failed = false;
  for (const [name, inputPath, outputPath] of fixtures) try {
    const input = JSON.parse(fs.readFileSync(path.join(root, inputPath), 'utf8'));
    const spec = JSON.parse(fs.readFileSync(path.join(root, outputPath), 'utf8'));
    for (const message of validateSpec(name, spec, input.site_context, input.site_model)) { failed = true; console.error(`MACHINE SPEC ERROR: ${name}: ${message}`); }
  } catch (err) { failed = true; console.error(`MACHINE SPEC ERROR: ${name}: ${err.stack || err.message}`); }
  const sitesDir = path.join(root, 'sites');
  let productionCount = 0;
  if (fs.existsSync(sitesDir)) for (const dirent of fs.readdirSync(sitesDir, { withFileTypes: true }).filter((item) => item.isDirectory())) {
    const base = path.join('sites', dirent.name);
    const machinePath = path.join(root, base, 'MACHINE_SPEC.json');
    if (!fs.existsSync(machinePath)) continue;
    try {
      const spec = JSON.parse(fs.readFileSync(machinePath, 'utf8'));
      const context = JSON.parse(fs.readFileSync(path.join(root, base, 'SITE_CONTEXT.json'), 'utf8'));
      const model = JSON.parse(fs.readFileSync(path.join(root, base, 'SITE_MODEL.json'), 'utf8'));
      for (const message of validateSpec(`production ${dirent.name}`, spec, context, model)) { failed = true; console.error(`MACHINE SPEC ERROR: production ${dirent.name}: ${message}`); }
      productionCount += 1;
    } catch (err) { failed = true; console.error(`MACHINE SPEC ERROR: production ${dirent.name}: ${err.stack || err.message}`); }
  }
  if (failed) process.exit(1);
  console.log(`MachineSpec semantic validation OK: ${fixtures.length} fixtures${productionCount ? `, ${productionCount} production artifacts` : ''}`);
}
