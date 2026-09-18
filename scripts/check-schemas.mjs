import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv/dist/2020.js';

const root = path.resolve(process.cwd());
const ajv = new Ajv({ strict: true, allErrors: true });
const compiledSchemas = new Map();

const schemas = [
  { name: 'site-context contract', path: 'contracts/site-context.schema.json' },
  { name: 'site-model contract', path: 'contracts/site-model.schema.json' },
  { name: 'site.context.build input', path: 'schemas/input/site.context.build.json' },
  { name: 'site.context.build output', path: 'schemas/output/site.context.build.json' },
  { name: 'site.model.build input', path: 'schemas/input/site.model.build.json' },
  { name: 'site.model.build output', path: 'schemas/output/site.model.build.json' },
  { name: 'machine-spec contract', path: 'contracts/machine-spec.schema.json' },
  { name: 'site.machine.build input', path: 'schemas/input/site.machine.build.json' },
  { name: 'site.machine.build output', path: 'schemas/output/site.machine.build.json' },
  { name: 'theme-spec contract', path: 'contracts/theme-spec.schema.json' },
  { name: 'designer.theme.interpret input', path: 'schemas/input/designer.theme.interpret.json' },
  { name: 'designer.theme.interpret output', path: 'schemas/output/designer.theme.interpret.json' }
];

const fixtures = [
  { name: 'fixture A input', schemaPath: 'schemas/input/site.context.build.json', dataPath: 'tests/fixtures/site-context/fixture-a-input.json' },
  { name: 'fixture A output', schemaPath: 'schemas/output/site.context.build.json', dataPath: 'tests/fixtures/site-context/fixture-a-output.json' },
  { name: 'fixture B input', schemaPath: 'schemas/input/site.context.build.json', dataPath: 'tests/fixtures/site-context/fixture-b-input.json' },
  { name: 'fixture B output', schemaPath: 'schemas/output/site.context.build.json', dataPath: 'tests/fixtures/site-context/fixture-b-output.json' },
  { name: 'fixture C input', schemaPath: 'schemas/input/site.context.build.json', dataPath: 'tests/fixtures/site-context/fixture-c-input.json' },
  { name: 'fixture C output', schemaPath: 'schemas/output/site.context.build.json', dataPath: 'tests/fixtures/site-context/fixture-c-output.json' },
  { name: 'fixture D input', schemaPath: 'schemas/input/site.context.build.json', dataPath: 'tests/fixtures/site-context/fixture-d-input.json' },
  { name: 'fixture D output', schemaPath: 'schemas/output/site.context.build.json', dataPath: 'tests/fixtures/site-context/fixture-d-output.json' },
  { name: 'fixture A SiteModel input', schemaPath: 'schemas/input/site.model.build.json', dataPath: 'tests/fixtures/site-context/fixture-a-output.json' },
  { name: 'fixture C SiteModel input', schemaPath: 'schemas/input/site.model.build.json', dataPath: 'tests/fixtures/site-context/fixture-c-output.json' },
  { name: 'fixture A SiteModel output', schemaPath: 'schemas/output/site.model.build.json', dataPath: 'tests/fixtures/site-model/fixture-a-output.json' },
  { name: 'fixture C SiteModel output', schemaPath: 'schemas/output/site.model.build.json', dataPath: 'tests/fixtures/site-model/fixture-c-output.json' },
  { name: 'production-shell SiteModel output', schemaPath: 'schemas/output/site.model.build.json', dataPath: 'tests/fixtures/site-model/fixture-production-shell.json' },
  { name: 'fixture A MachineSpec input', schemaPath: 'schemas/input/site.machine.build.json', dataPath: 'tests/fixtures/machine-spec/fixture-a-input.json' },
  { name: 'fixture confirmed-contacts MachineSpec input', schemaPath: 'schemas/input/site.machine.build.json', dataPath: 'tests/fixtures/machine-spec/fixture-confirmed-contacts-input.json' },
  { name: 'fixture placeholder-contacts MachineSpec input', schemaPath: 'schemas/input/site.machine.build.json', dataPath: 'tests/fixtures/machine-spec/fixture-placeholder-contacts-input.json' },
  { name: 'fixture A MachineSpec output', schemaPath: 'schemas/output/site.machine.build.json', dataPath: 'tests/fixtures/machine-spec/fixture-a-output.json' },
  { name: 'fixture confirmed-contacts MachineSpec output', schemaPath: 'schemas/output/site.machine.build.json', dataPath: 'tests/fixtures/machine-spec/fixture-confirmed-contacts-output.json' },
  { name: 'fixture placeholder-contacts MachineSpec output', schemaPath: 'schemas/output/site.machine.build.json', dataPath: 'tests/fixtures/machine-spec/fixture-placeholder-contacts-output.json' },
  { name: 'Human Layer fixture SiteModel', schemaPath: 'schemas/output/site.model.build.json', dataPath: 'tests/fixtures/human-layer/SITE_MODEL.json' },
  { name: 'Human Layer fixture MachineSpec', schemaPath: 'schemas/output/site.machine.build.json', dataPath: 'tests/fixtures/human-layer/MACHINE_SPEC.json' },
  { name: 'fixture A Theme Interpreter input', schemaPath: 'schemas/input/designer.theme.interpret.json', dataPath: 'tests/fixtures/machine-spec/fixture-a-input.json' },
  { name: 'fixture A ThemeSpec output', schemaPath: 'schemas/output/designer.theme.interpret.json', dataPath: 'tests/fixtures/theme-spec/fixture-a-output.json' }
];

const outputFixtures = new Map([
  ['tests/fixtures/site-context/fixture-a-output.json', 'contracts/site-context.schema.json'],
  ['tests/fixtures/site-context/fixture-b-output.json', 'contracts/site-context.schema.json'],
  ['tests/fixtures/site-context/fixture-c-output.json', 'contracts/site-context.schema.json'],
  ['tests/fixtures/site-context/fixture-d-output.json', 'contracts/site-context.schema.json'],
  ['tests/fixtures/site-model/fixture-a-output.json', 'contracts/site-model.schema.json'],
  ['tests/fixtures/site-model/fixture-c-output.json', 'contracts/site-model.schema.json'],
  ['tests/fixtures/machine-spec/fixture-a-output.json', 'contracts/machine-spec.schema.json'],
  ['tests/fixtures/machine-spec/fixture-confirmed-contacts-output.json', 'contracts/machine-spec.schema.json'],
  ['tests/fixtures/machine-spec/fixture-placeholder-contacts-output.json', 'contracts/machine-spec.schema.json'],
  ['tests/fixtures/human-layer/SITE_MODEL.json', 'contracts/site-model.schema.json'],
  ['tests/fixtures/human-layer/MACHINE_SPEC.json', 'contracts/machine-spec.schema.json'],
  ['tests/fixtures/theme-spec/fixture-a-output.json', 'contracts/theme-spec.schema.json']
]);

let failed = false;
const rawSchemas = new Map();
for (const { path: relPath } of schemas) {
  rawSchemas.set(relPath, JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8')));
}

// Register canonical contracts first so wrappers can use their canonical $id refs.
for (const relPath of ['contracts/site-context.schema.json', 'contracts/site-model.schema.json', 'contracts/machine-spec.schema.json', 'contracts/theme-spec.schema.json']) {
  ajv.addSchema(rawSchemas.get(relPath));
}

for (const { name, path: relPath } of schemas) {
  try {
    const validate = ajv.compile(rawSchemas.get(relPath));
    compiledSchemas.set(relPath, validate);
  } catch (err) {
    failed = true;
    console.error(`SCHEMA ERROR: ${name} (${relPath})\n${err.stack || err.message}`);
  }
}

for (const { name, schemaPath, dataPath } of fixtures) {
  try {
    const validate = compiledSchemas.get(schemaPath);
    const data = JSON.parse(fs.readFileSync(path.join(root, dataPath), 'utf8'));
    if (!validate(data)) {
      failed = true;
      console.error(`FIXTURE VALIDATION ERROR: ${name} (${dataPath})`);
      for (const err of validate.errors || []) console.error(`  ${err.instancePath || '/'}: ${err.message}`);
    }
  } catch (err) {
    failed = true;
    console.error(`FIXTURE ERROR: ${name} (${dataPath})\n${err.stack || err.message}`);
  }
}

if (failed) process.exit(1);
console.log(`Schema validation OK: ${schemas.length} schemas, ${fixtures.length} fixtures`);

for (const [dataPath, contractPath] of outputFixtures) {
  const data = JSON.parse(fs.readFileSync(path.join(root, dataPath), 'utf8'));
  const validateContract = compiledSchemas.get(contractPath);
  if (!validateContract(data)) {
    failed = true;
    console.error(`CONTRACT VALIDATION ERROR: ${dataPath}`);
    for (const err of validateContract.errors || []) console.error(`  ${err.instancePath || '/'}: ${err.message}`);
  }
}

if (failed) process.exit(1);
console.log(`Contract validation OK: ${outputFixtures.size} output fixtures`);

// Discover and validate production artifacts
const sitesDir = path.join(root, 'sites');
const productionArtifacts = [];

if (fs.existsSync(sitesDir)) {
  const siteIds = fs.readdirSync(sitesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const siteId of siteIds) {
    const contextPath = path.join('sites', siteId, 'SITE_CONTEXT.json');
    const modelPath = path.join('sites', siteId, 'SITE_MODEL.json');
    const machinePath = path.join('sites', siteId, 'MACHINE_SPEC.json');
    const themePath = path.join('sites', siteId, 'THEME_SPEC.json');

    if (fs.existsSync(path.join(root, contextPath))) {
      productionArtifacts.push({ name: `${siteId} SITE_CONTEXT`, dataPath: contextPath, contractPath: 'contracts/site-context.schema.json' });
    }

    if (fs.existsSync(path.join(root, modelPath))) {
      productionArtifacts.push({ name: `${siteId} SITE_MODEL`, dataPath: modelPath, contractPath: 'contracts/site-model.schema.json' });
    }

    if (fs.existsSync(path.join(root, machinePath))) {
      productionArtifacts.push({ name: `${siteId} MACHINE_SPEC`, dataPath: machinePath, contractPath: 'contracts/machine-spec.schema.json' });
    }

    if (fs.existsSync(path.join(root, themePath))) {
      productionArtifacts.push({ name: `${siteId} THEME_SPEC`, dataPath: themePath, contractPath: 'contracts/theme-spec.schema.json' });
    }
  }
}

for (const { name, dataPath, contractPath } of productionArtifacts) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(root, dataPath), 'utf8'));
    const validateContract = compiledSchemas.get(contractPath);
    if (!validateContract(data)) {
      failed = true;
      console.error(`PRODUCTION ARTIFACT ERROR: ${name} (${dataPath})`);
      for (const err of validateContract.errors || []) console.error(`  ${err.instancePath || '/'}: ${err.message}`);
    }
  } catch (err) {
    failed = true;
    console.error(`PRODUCTION ARTIFACT ERROR: ${name} (${dataPath})\n${err.stack || err.message}`);
  }
}

if (failed) process.exit(1);
if (productionArtifacts.length > 0) {
  console.log(`Production artifacts OK: ${productionArtifacts.length} files`);
}
