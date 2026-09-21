/** Deterministic acceptance checks for generated Review Build HTML. */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const sitesRoot = path.join(root, 'sites');
const required = ['SITE_MODEL.json', 'MACHINE_SPEC.json', 'THEME_SPEC.json'];
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function outputFile(folder, pagePath) {
  const segments = pagePath === '/' ? [] : pagePath.replace(/^\/|\/$/g, '').split('/');
  return path.join(root, 'dist', 'review', folder, ...segments, 'index.html');
}

const folders = fs.existsSync(sitesRoot)
  ? fs.readdirSync(sitesRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()
  : [];

for (const folder of folders) {
  const directory = path.join(sitesRoot, folder);
  if (!required.every((file) => fs.existsSync(path.join(directory, file)))) continue;

  const siteModel = JSON.parse(fs.readFileSync(path.join(directory, 'SITE_MODEL.json'), 'utf8'));
  const machineSpec = JSON.parse(fs.readFileSync(path.join(directory, 'MACHINE_SPEC.json'), 'utf8'));
  const themeSpec = JSON.parse(fs.readFileSync(path.join(directory, 'THEME_SPEC.json'), 'utf8'));

  check(siteModel.site_id === machineSpec.site_id, `[${folder}] SiteModel.site_id does not match MachineSpec.site_id`);
  check(siteModel.source_context_id === machineSpec.source_context_id, `[${folder}] SiteModel.source_context_id does not match MachineSpec.source_context_id`);

  for (const page of siteModel.pages) {
    const machinePage = machineSpec.pages.find((candidate) => candidate.page_id === page.id);
    check(Boolean(machinePage), `[${folder}:${page.id}] missing matching MachineSpec page`);
    if (!machinePage) continue;
    check(page.path === machinePage.path, `[${folder}:${page.id}] SiteModel and MachineSpec paths differ`);

    const file = outputFile(folder, page.path);
    check(fs.existsSync(file), `[${folder}:${page.id}] missing built HTML: ${path.relative(root, file)}`);
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    const label = `[${folder}:${page.id}]`;
    check(html.includes(`<title>${machinePage.meta.title}</title>`), `${label} MachineSpec meta title is not rendered`);
    check(html.includes(`rel="canonical" href="${machinePage.canonical.path}"`), `${label} MachineSpec canonical path is not rendered`);
    check(html.includes(`data-theme-id="${themeSpec.theme_id}"`), `${label} ThemeSpec theme id is not applied`);
    const absoluteHrefs = [...html.matchAll(/<a\b[^>]*\bhref="(\/(?!\/)[^"]*)"/g)].map((match) => match[1]);
    check(
      absoluteHrefs.every((href) => href.startsWith(`/review/${folder}/`)),
      `${label} visible internal link is outside the expected review mount`
    );
    check(!html.includes(`rel="canonical" href="/review/${folder}/`), `${label} internal review link is incorrectly used as canonical URL`);
    for (const block of page.blocks) {
      check(html.includes(`id="${block.id}"`), `${label} missing rendered block id "${block.id}"`);
    }
  }
}

if (failures.length > 0) {
  console.error('Review Build validation FAILED:');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log('Review Build validation OK: all complete site artifact sets verified');
