import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv/dist/2020.js';

const root = path.resolve(process.cwd());
const ajv = new Ajv({ strict: true, allErrors: true });
const compiledSchemas = new Map();

const schemas = [
  {
    name: 'site-context contract',
    path: 'contracts/site-context.schema.json'
  },
  {
    name: 'site.context.build input',
    path: 'schemas/input/site.context.build.json'
  },
  {
    name: 'site.context.build output',
    path: 'schemas/output/site.context.build.json'
  }
];

const fixtures = [
  {
    name: 'fixture A input',
    schemaPath: 'schemas/input/site.context.build.json',
    dataPath: 'tests/fixtures/site-context/fixture-a-input.json'
  },
  {
    name: 'fixture A output',
    schemaPath: 'schemas/output/site.context.build.json',
    dataPath: 'tests/fixtures/site-context/fixture-a-output.json'
  },
  {
    name: 'fixture B input',
    schemaPath: 'schemas/input/site.context.build.json',
    dataPath: 'tests/fixtures/site-context/fixture-b-input.json'
  },
  {
    name: 'fixture B output',
    schemaPath: 'schemas/output/site.context.build.json',
    dataPath: 'tests/fixtures/site-context/fixture-b-output.json'
  }
];

let failed = false;

// Validate schemas are loadable
for (const { name, path: relPath } of schemas) {
  try {
    const fullPath = path.join(root, relPath);
    const schema = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    compiledSchemas.set(relPath, ajv.compile(schema));
  } catch (err) {
    failed = true;
    console.error(`SCHEMA ERROR: ${name} (${relPath})\n${err.stack || err.message}`);
  }
}

// Validate fixtures against schemas
for (const { name, schemaPath, dataPath } of fixtures) {
  try {
    const schemaFullPath = path.join(root, schemaPath);
    const dataFullPath = path.join(root, dataPath);

    if (!fs.existsSync(dataFullPath)) {
      console.log(`SKIP: ${name} (${dataPath} not found)`);
      continue;
    }

    const schema = JSON.parse(fs.readFileSync(schemaFullPath, 'utf8'));
    const data = JSON.parse(fs.readFileSync(dataFullPath, 'utf8'));

    const validate = compiledSchemas.get(schemaPath) || ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      failed = true;
      console.error(`FIXTURE VALIDATION ERROR: ${name} (${dataPath})`);
      for (const err of validate.errors || []) {
        console.error(`  ${err.instancePath || '/'}: ${err.message}`);
      }
    }
  } catch (err) {
    failed = true;
    console.error(`FIXTURE ERROR: ${name} (${dataPath})\n${err.stack || err.message}`);
  }
}

if (failed) process.exit(1);
console.log(`Schema validation OK: ${schemas.length} schemas, ${fixtures.length} fixtures`);
