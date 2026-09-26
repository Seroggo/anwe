import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const registry = JSON.parse(fs.readFileSync(path.join(root, 'contracts/analytics-events.json'), 'utf8'));
const eventMap = new Map(registry.events.map((event) => [event.name, event]));

function code(value) { return '`' + value + '`'; }

function render(siteId, spec) {
  const rows = spec.bindings.map((binding) => {
    const event = eventMap.get(binding.event);
    const yandex = spec.providers.yandex_metrika.enabled ? code(binding.yandex_event ?? binding.event) : 'не включена';
    const ga4 = spec.providers.ga4.enabled ? code(binding.ga4_event ?? event.ga4_event ?? binding.event) : 'не включена';
    return `| ${binding.event} | ${event.description} | ${code(binding.target)} | ${yandex} | ${ga4} |`;
  });
  const ym = spec.providers.yandex_metrika;
  const ga4 = spec.providers.ga4;
  return [
    '<!-- Generated from contracts/analytics-events.json and this site\'s ANALYTICS_SPEC.json. -->',
    '',
    `# Цели аналитики: ${siteId}`,
    '',
    `Состояние AnalyticsSpec: **${spec.enabled ? 'включена' : 'выключена'}**.`,
    `Яндекс Метрика: ${ym.enabled ? `включена, счётчик ${ym.counter_id}` : 'выключена'}.`,
    `GA4: ${ga4.enabled ? `включена, ресурс ${ga4.measurement_id ?? 'ID не указан'}` : 'выключена'}.`,
    '',
    '| Событие | Значение | Цель / элемент | Яндекс Метрика | GA4 |',
    '| --- | --- | --- | --- | --- |',
    ...(rows.length ? rows : ['| — | Нет настроенных привязок | — | — | — |']),
    '',
    '## Реестр событий',
    '',
    ...registry.events.map((event) => `- ${code(event.name)} — ${event.description}. Обязательные параметры: ${event.required_parameters.map(code).join(', ') || 'нет'}.`),
    '',
    'Цели и key events в аккаунтах провайдеров настраиваются отдельно. В GA4 при необходимости отметьте событие конверсии как key event; в Метрике создайте JavaScript-цели с указанными выше идентификаторами.',
    ''
  ].join('\n');
}

const sitesDir = path.join(root, 'sites');
for (const entry of fs.readdirSync(sitesDir, { withFileTypes: true }).filter((item) => item.isDirectory())) {
  const directory = path.join(sitesDir, entry.name);
  const config = path.join(directory, 'ANALYTICS_SPEC.json');
  const output = path.join(directory, 'ANALYTICS_GOALS.md');
  if (!fs.existsSync(config)) {
    if (fs.existsSync(output) && fs.readFileSync(output, 'utf8').startsWith('<!-- Generated from contracts/analytics-events.json')) fs.rmSync(output);
    continue;
  }
  const spec = JSON.parse(fs.readFileSync(config, 'utf8'));
  fs.writeFileSync(output, render(entry.name, spec), 'utf8');
}
