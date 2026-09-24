import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => { console.error(`Form connector check FAILED: ${message}`); process.exit(1); };

const gas = read('form-connectors/google-apps-script/Code.gs');
for (const marker of ['LockService.getScriptLock()', 'getDisplayValues()', "key === 'timestamp'", 'safeSheetValue_', 'MailApp.sendEmail', '_honeypot']) {
  if (!gas.includes(marker)) fail(`GAS template missing ${marker}`);
}
const form = read('src/components/Form.astro');
for (const marker of ['new FormData(form)', 'data-gas-endpoint', "mode: 'no-cors'", 'form.dataset.submitState']) {
  if (!form.includes(marker)) fail(`runtime integration missing ${marker}`);
}
const example = JSON.parse(read('tests/fixtures/form-connectors/FORM_CONNECTOR.example.json'));
if (example.version !== '0.1' || !example.forms['example-rfq']?.endpoint) fail('example connector is invalid');
const sample = JSON.parse(read('tests/fixtures/form-connectors/SAMPLE_FORM.json'));
if (!sample.fields.includes('company') || !sample.sheet_headers.includes('timestamp')) fail('arbitrary-fields fixture is invalid');
console.log('Form connector check OK');
