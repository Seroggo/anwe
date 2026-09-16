import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());

const PLACEHOLDER_PHONE_VALUE = '+7 (000) 000-00-00';
const PLACEHOLDER_PHONE_HREF = 'tel:+70000000000';
const PLACEHOLDER_EMAIL_VALUE = 'example@mail.test';
const PLACEHOLDER_EMAIL_HREF = 'mailto:example@mail.test';
const PLACEHOLDER_VALUES = new Set([
  PLACEHOLDER_PHONE_VALUE,
  PLACEHOLDER_EMAIL_VALUE
]);
const PLACEHOLDER_HREFS = new Set([
  PLACEHOLDER_PHONE_HREF,
  PLACEHOLDER_EMAIL_HREF
]);

const STATUS_RANK = { blocked: 0, partial: 1, ready: 2 };

function expectedStatusForIssues(issues) {
  const severities = new Set((issues ?? []).map((issue) => issue.severity));
  if (severities.has('critical')) return 'blocked';
  if (severities.has('important')) return 'partial';
  return 'ready';
}

function collectSiteModelContacts(siteModel) {
  const result = { phone: null, email: null };
  for (const page of siteModel.pages ?? []) {
    for (const block of page.blocks ?? []) {
      if (block.type === 'contacts' && block.content) {
        const phone = block.content.phone;
        const email = block.content.email;
        if (phone && phone.status === 'confirmed' && !result.phone) {
          result.phone = { value: phone.value, href: phone.href };
        }
        if (email && email.status === 'confirmed' && !result.email) {
          result.email = { value: email.value, href: email.href };
        }
      }
    }
  }
  return result;
}

function checkPlaceholderLeak(errors, owner, value, href) {
  if (value && PLACEHOLDER_VALUES.has(value)) {
    errors.push(`${owner} leaks placeholder contact value '${value}'`);
  }
  if (href && PLACEHOLDER_HREFS.has(href)) {
    errors.push(`${owner} leaks placeholder contact href '${href}'`);
  }
}

export function validateSpec(_name, spec, siteContext, siteModel) {
  const errors = [];
  const fail = (message) => errors.push(message);

  // Identity
  if (spec.site_id !== siteModel.site_id) {
    fail(`machine.site_id '${spec.site_id}' must equal site_model.site_id '${siteModel.site_id}'`);
  }
  if (spec.source_context_id !== siteContext.context_id) {
    fail(`machine.source_context_id '${spec.source_context_id}' must equal site_context.context_id '${siteContext.context_id}'`);
  }
  if (spec.source_model_id !== siteModel.site_id) {
    fail(`machine.source_model_id '${spec.source_model_id}' must equal site_model.site_id '${siteModel.site_id}'`);
  }
  if (siteModel.source_context_id !== siteContext.context_id) {
    fail(`site_model.source_context_id '${siteModel.source_context_id}' must equal site_context.context_id '${siteContext.context_id}'`);
  }

  // Upstream readiness escalation
  if (STATUS_RANK[spec.status] > STATUS_RANK[siteModel.status]) {
    fail(`machine status '${spec.status}' escalates above site_model status '${siteModel.status}'`);
  }

  // Status matches issue severity
  const expectedStatus = expectedStatusForIssues(spec.issues ?? []);
  if (spec.status !== expectedStatus) {
    fail(`status must be '${expectedStatus}' for its issue severities but got '${spec.status}'`);
  }

  // Primary entity
  const primaryEntity = spec.primary_entity;
  if (!primaryEntity) {
    fail('primary_entity missing');
  } else {
    if (!primaryEntity.id) fail('primary_entity.id missing');
    if (!primaryEntity.home_path) fail('primary_entity.home_path missing');
    const siteModelPaths = new Set((siteModel.pages ?? []).map((page) => page.path));
    if (!siteModelPaths.has(primaryEntity.home_path)) {
      fail(`primary_entity.home_path '${primaryEntity.home_path}' does not exist in SiteModel`);
    }
    const contacts = primaryEntity.contacts ?? { phone: null, email: null };
    if (contacts.phone) {
      checkPlaceholderLeak(errors, 'primary_entity.contacts.phone', contacts.phone.value, contacts.phone.href);
      const smContacts = collectSiteModelContacts(siteModel);
      if (!smContacts.phone) {
        fail('primary_entity.contacts.phone set but SiteModel has no confirmed phone');
      } else if (smContacts.phone.value !== contacts.phone.value || smContacts.phone.href !== contacts.phone.href) {
        fail(`primary_entity.contacts.phone must match confirmed SiteModel phone`);
      }
    }
    if (contacts.email) {
      checkPlaceholderLeak(errors, 'primary_entity.contacts.email', contacts.email.value, contacts.email.href);
      const smContacts = collectSiteModelContacts(siteModel);
      if (!smContacts.email) {
        fail('primary_entity.contacts.email set but SiteModel has no confirmed email');
      } else if (smContacts.email.value !== contacts.email.value || smContacts.email.href !== contacts.email.href) {
        fail(`primary_entity.contacts.email must match confirmed SiteModel email`);
      }
    }
    // Placeholder SiteModel contact must not appear as factual machine contact
    for (const page of siteModel.pages ?? []) {
      for (const block of page.blocks ?? []) {
        if (block.type === 'contacts' && block.content) {
          const phone = block.content.phone;
          const email = block.content.email;
          if (phone && phone.status === 'placeholder' && contacts.phone) {
            fail(`placeholder SiteModel phone leaked into primary_entity.contacts.phone`);
          }
          if (email && email.status === 'placeholder' && contacts.email) {
            fail(`placeholder SiteModel email leaked into primary_entity.contacts.email`);
          }
        }
      }
    }
  }

  // Services
  const serviceIds = new Set();
  for (const service of spec.services ?? []) {
    if (serviceIds.has(service.id)) fail(`duplicate service id '${service.id}'`);
    serviceIds.add(service.id);
    if (primaryEntity && service.provider_entity_id !== primaryEntity.id) {
      fail(`service '${service.id}' provider_entity_id '${service.provider_entity_id}' must equal primary_entity.id '${primaryEntity.id}'`);
    }
    const siteModelPageIds = new Set((siteModel.pages ?? []).map((page) => page.id));
    for (const pageId of service.page_ids ?? []) {
      if (!siteModelPageIds.has(pageId)) {
        fail(`service '${service.id}' references unknown SiteModel page_id '${pageId}'`);
      }
    }
  }

  // Pages
  const siteModelPages = siteModel.pages ?? [];
  const siteModelPageIds = new Set(siteModelPages.map((page) => page.id));
  const siteModelPaths = new Set(siteModelPages.map((page) => page.path));
  const machinePageIds = new Set();
  const machinePagePaths = new Set();

  for (const page of spec.pages ?? []) {
    if (machinePageIds.has(page.page_id)) fail(`duplicate machine page_id '${page.page_id}'`);
    machinePageIds.add(page.page_id);
    if (machinePagePaths.has(page.path)) fail(`duplicate machine page path '${page.path}'`);
    machinePagePaths.add(page.path);

    if (!siteModelPageIds.has(page.page_id)) {
      fail(`machine page_id '${page.page_id}' does not exist in SiteModel`);
    }
    const siteModelPage = siteModelPages.find((p) => p.id === page.page_id);
    if (siteModelPage && page.path !== siteModelPage.path) {
      fail(`machine page '${page.page_id}' path '${page.path}' must equal SiteModel path '${siteModelPage.path}'`);
    }
    if (page.canonical && page.canonical.path !== page.path) {
      fail(`machine page '${page.page_id}' canonical.path '${page.canonical.path}' must equal page path '${page.path}'`);
    }
    if (siteModelPage && page.canonical && page.canonical.path !== siteModelPage.path) {
      fail(`machine page '${page.page_id}' canonical.path does not match SiteModel path`);
    }
    if (page.path === '/' && page.semantic_role !== 'home') {
      fail(`machine page '${page.page_id}' with path / must have semantic_role 'home' but got '${page.semantic_role}'`);
    }
    if (page.path !== '/' && page.semantic_role === 'home') {
      fail(`machine page '${page.page_id}' with non-home path has semantic_role 'home'`);
    }

    if (primaryEntity && page.primary_entity_id !== primaryEntity.id) {
      fail(`machine page '${page.page_id}' primary_entity_id '${page.primary_entity_id}' must equal primary_entity.id '${primaryEntity.id}'`);
    }
    for (const serviceId of page.service_ids ?? []) {
      if (!serviceIds.has(serviceId)) {
        fail(`machine page '${page.page_id}' references unknown service_id '${serviceId}'`);
      }
    }

    // Metadata
    if (!page.meta || !page.meta.title) {
      fail(`machine page '${page.page_id}' meta.title must be non-empty`);
    }
    if (page.meta && page.meta.description != null && page.meta.description !== '') {
      checkPlaceholderLeak(errors, `page '${page.page_id}' meta.description`, page.meta.description, null);
    }
    if (page.open_graph) {
      checkPlaceholderLeak(errors, `page '${page.page_id}' open_graph.title`, page.open_graph.title, null);
      if (page.open_graph.description) {
        checkPlaceholderLeak(errors, `page '${page.page_id}' open_graph.description`, page.open_graph.description, null);
      }
    }

    // Breadcrumbs: each path must exist in SiteModel
    for (const crumb of page.breadcrumbs ?? []) {
      if (!siteModelPaths.has(crumb.path)) {
        fail(`machine page '${page.page_id}' breadcrumb path '${crumb.path}' does not exist in SiteModel`);
      }
    }
  }

  // Exactly one machine page per SiteModel page
  if ((spec.pages ?? []).length !== siteModelPages.length) {
    fail(`machine has ${(spec.pages ?? []).length} pages but SiteModel has ${siteModelPages.length}; must be equal`);
  }
  for (const smPage of siteModelPages) {
    if (!machinePageIds.has(smPage.id)) {
      fail(`SiteModel page '${smPage.id}' missing from MachineSpec`);
    }
  }
  for (const mPage of spec.pages ?? []) {
    if (!siteModelPageIds.has(mPage.page_id)) {
      fail(`machine page '${mPage.page_id}' is an extra page not present in SiteModel`);
    }
  }

  return errors;
}

// Synthetic fixtures: each entry pairs a MachineSpec output with its input wrapper
// (site_context + site_model) so the validator can check cross-document semantics.
const fixtures = [
  {
    name: 'fixture-a',
    inputPath: 'tests/fixtures/machine-spec/fixture-a-input.json',
    outputPath: 'tests/fixtures/machine-spec/fixture-a-output.json'
  },
  {
    name: 'fixture-confirmed-contacts',
    inputPath: 'tests/fixtures/machine-spec/fixture-confirmed-contacts-input.json',
    outputPath: 'tests/fixtures/machine-spec/fixture-confirmed-contacts-output.json'
  },
  {
    name: 'fixture-placeholder-contacts',
    inputPath: 'tests/fixtures/machine-spec/fixture-placeholder-contacts-input.json',
    outputPath: 'tests/fixtures/machine-spec/fixture-placeholder-contacts-output.json'
  }
];

function isMain() {
  const argv = process.argv[1] ?? '';
  return path.resolve(argv) === path.resolve(root, 'scripts/check-machine-spec.mjs')
    || path.basename(argv) === 'check-machine-spec.mjs';
}

if (isMain()) {
  let failed = false;
  let productionCount = 0;

  for (const { name, inputPath, outputPath } of fixtures) {
    try {
      const input = JSON.parse(fs.readFileSync(path.join(root, inputPath), 'utf8'));
      const spec = JSON.parse(fs.readFileSync(path.join(root, outputPath), 'utf8'));
      const siteContext = input.site_context;
      const siteModel = input.site_model;
      if (!siteContext || !siteModel) {
        failed = true;
        console.error(`MACHINE SPEC ERROR: ${name}: input wrapper must contain site_context and site_model`);
        continue;
      }
      const errors = validateSpec(name, spec, siteContext, siteModel);
      for (const message of errors) {
        failed = true;
        console.error(`MACHINE SPEC ERROR: ${name}: ${message}`);
      }
    } catch (err) {
      failed = true;
      console.error(`MACHINE SPEC ERROR: ${name}: ${err.stack || err.message}`);
    }
  }

  // Production discovery: sites/<site-id>/MACHINE_SPEC.json (optional)
  const sitesDir = path.join(root, 'sites');
  if (fs.existsSync(sitesDir)) {
    const siteIds = fs.readdirSync(sitesDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    for (const siteId of siteIds) {
      const machinePath = path.join('sites', siteId, 'MACHINE_SPEC.json');
      const contextPath = path.join('sites', siteId, 'SITE_CONTEXT.json');
      const modelPath = path.join('sites', siteId, 'SITE_MODEL.json');
      if (!fs.existsSync(path.join(root, machinePath))) continue;

      try {
        const spec = JSON.parse(fs.readFileSync(path.join(root, machinePath), 'utf8'));
        let siteContext = null;
        let siteModel = null;
        if (fs.existsSync(path.join(root, contextPath))) {
          siteContext = JSON.parse(fs.readFileSync(path.join(root, contextPath), 'utf8'));
        }
        if (fs.existsSync(path.join(root, modelPath))) {
          siteModel = JSON.parse(fs.readFileSync(path.join(root, modelPath), 'utf8'));
        }
        if (!siteContext || !siteModel) {
          failed = true;
          console.error(`MACHINE SPEC ERROR: production ${siteId}: MACHINE_SPEC.json requires paired SITE_CONTEXT.json and SITE_MODEL.json`);
          continue;
        }
        const errors = validateSpec(`production ${siteId}`, spec, siteContext, siteModel);
        for (const message of errors) {
          failed = true;
          console.error(`MACHINE SPEC ERROR: production ${siteId}: ${message}`);
        }
        productionCount += 1;
      } catch (err) {
        failed = true;
        console.error(`MACHINE SPEC ERROR: production ${siteId}: ${err.stack || err.message}`);
      }
    }
  }

  if (failed) process.exit(1);
  console.log(`MachineSpec semantic validation OK: ${fixtures.length} fixtures${productionCount > 0 ? `, ${productionCount} production artifacts` : ''}`);
}