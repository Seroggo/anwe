import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());

// Discover test fixtures
const fixtures = [
  'tests/fixtures/site-model/fixture-a-output.json',
  'tests/fixtures/site-model/fixture-c-output.json'
];

// Discover production SITE_MODEL.json files
const sitesDir = path.join(root, 'sites');
if (fs.existsSync(sitesDir)) {
  const siteIds = fs.readdirSync(sitesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const siteId of siteIds) {
    const modelPath = path.join('sites', siteId, 'SITE_MODEL.json');
    if (fs.existsSync(path.join(root, modelPath))) {
      fixtures.push(modelPath);
    }
  }
}
const variants = {
  header: new Set(['default', 'transparent']),
  hero: new Set(['centered', 'split']),
  text: new Set(['narrow', 'wide']),
  split: new Set(['media-left', 'media-right']),
  cards: new Set(['grid', 'horizontal']),
  steps: new Set(['vertical', 'horizontal']),
  stats: new Set(['inline', 'grid']),
  gallery: new Set(['grid', 'featured']),
  faq: new Set(['stacked']),
  cta: new Set(['centered', 'split']),
  footer: new Set(['simple', 'columns'])
};
const surfaces = new Set(['default', 'muted', 'accent', 'inverse']);
const aspects = new Set(['4:3', '1:1', '3:4']);
let failed = false;

function fail(fixture, message) {
  failed = true;
  console.error(`SITE MODEL ERROR: ${fixture}: ${message}`);
}

function checkMedia(fixture, media, owner, required) {
  if (required && !media) return fail(fixture, `${owner} requires media`);
  if (!media) return;
  if (media.src !== null) fail(fixture, `${owner} media.src must be null`);
  if (media.alt !== '') fail(fixture, `${owner} media.alt must be empty`);
  if (media.fit !== 'cover') fail(fixture, `${owner} media.fit must be cover`);
  if (!aspects.has(media.aspect)) fail(fixture, `${owner} media.aspect is invalid`);
}

function checkLink(fixture, href, page, pagesByPath, owner) {
  // Path pattern matches the contract: ^/(?:[a-z0-9]+(?:-[a-z0-9]+)*/)*$
  // This allows: /, /services/, /services/assembly/
  if (typeof href !== 'string' || !/^(?:#[a-z0-9]+(?:-[a-z0-9]+)*|\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)*|https:\/\/[^\s]+|mailto:[^\s]+|tel:[^\s]+)$/.test(href)) {
    fail(fixture, `${owner} uses invalid href ${String(href)}`);
    return;
  }
  if (href.startsWith('#')) {
    const target = href.slice(1);
    // Allow #top as a global runtime anchor
    if (target !== 'top' && !page.blocks.some((block) => block.id === target)) {
      fail(fixture, `${owner} links to missing same-page anchor ${href}`);
    }
  } else if (href.startsWith('/')) {
    if (!pagesByPath.has(href)) fail(fixture, `${owner} links to missing page ${href}`);
  }
}

function checkActions(fixture, actions, page, pagesByPath, owner) {
  for (const action of actions ?? []) checkLink(fixture, action.href, page, pagesByPath, owner);
}

for (const relPath of fixtures) {
  const model = JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8'));
  const severities = new Set((model.issues ?? []).map((issue) => issue.severity));
  const expectedStatus = severities.has('critical')
    ? 'blocked'
    : severities.has('important')
      ? 'partial'
      : 'ready';
  if (model.status !== expectedStatus) {
    fail(relPath, `status must be ${expectedStatus} for its issue severities`);
  }
  const pageIds = new Set();
  const pagePaths = new Set();
  let homeCount = 0;

  for (const page of model.pages ?? []) {
    if (pageIds.has(page.id)) fail(relPath, `duplicate page id ${page.id}`);
    if (pagePaths.has(page.path)) fail(relPath, `duplicate page path ${page.path}`);
    pageIds.add(page.id);
    pagePaths.add(page.path);
    if (page.path === '/') homeCount += 1;
  }
  if (homeCount !== 1) fail(relPath, 'must contain exactly one home path /');
  const pagesByPath = new Set(pagePaths);

  for (const page of model.pages ?? []) {
    const blocks = page.blocks ?? [];
    const blockIds = new Set();
    let heroes = 0;
    let headers = 0;
    let footers = 0;

    for (const [index, block] of blocks.entries()) {
      if (blockIds.has(block.id)) fail(relPath, `page ${page.id} has duplicate block id ${block.id}`);
      blockIds.add(block.id);
      if (!variants[block.type]) fail(relPath, `page ${page.id} uses unknown block type ${block.type}`);
      else if (!variants[block.type].has(block.variant)) fail(relPath, `block ${block.id} uses invalid ${block.type} variant ${block.variant}`);
      if (!surfaces.has(block.surface)) fail(relPath, `block ${block.id} uses invalid surface ${block.surface}`);
      if (block.type === 'hero') heroes += 1;
      if (block.type === 'header') {
        headers += 1;
        if (index !== 0) fail(relPath, `header ${block.id} must be first`);
      }
      if (block.type === 'footer') {
        footers += 1;
        if (index !== blocks.length - 1) fail(relPath, `footer ${block.id} must be last`);
      }
    }
    if (heroes !== 1) fail(relPath, `page ${page.id} must have exactly one hero`);
    if (headers > 1) fail(relPath, `page ${page.id} has more than one header`);
    if (footers > 1) fail(relPath, `page ${page.id} has more than one footer`);

    for (const block of blocks) {
      const content = block.content ?? {};
      if (block.type === 'header') {
        if ((content.actions ?? []).length > 1) fail(relPath, `header ${block.id} has more than one action`);
        for (const link of content.nav ?? []) checkLink(relPath, link.href, page, pagesByPath, `header ${block.id}`);
      }
      if (block.type === 'hero') {
        if (!content.title) fail(relPath, `hero ${block.id} needs non-empty title`);
        checkMedia(relPath, content.media, `hero ${block.id}`, block.variant === 'split');
        if (block.variant === 'centered' && content.media !== null) fail(relPath, `centered hero ${block.id} must have media:null`);
      }
      if (block.type === 'split') checkMedia(relPath, content.media, `split ${block.id}`, true);
      if (block.type === 'cta') {
        checkMedia(relPath, content.media, `cta ${block.id}`, block.variant === 'split');
        if (block.variant === 'centered' && content.media !== null) fail(relPath, `centered cta ${block.id} must have media:null`);
      }
      if (block.type === 'gallery') {
        for (const [index, item] of (content.items ?? []).entries()) checkMedia(relPath, item.media, `gallery ${block.id} item ${index}`, true);
      }
      if (block.type === 'cards') {
        for (const [index, item] of (content.items ?? []).entries()) {
          if (item.media !== null) fail(relPath, `cards ${block.id} item ${index} media must be null`);
          if (item.icon !== null) fail(relPath, `cards ${block.id} item ${index} icon must be null`);
          checkActions(relPath, item.actions, page, pagesByPath, `cards ${block.id} item ${index}`);
        }
      }
      if (block.type === 'steps') {
        for (const [index, item] of (content.items ?? []).entries()) if (item.icon !== null) fail(relPath, `steps ${block.id} item ${index} icon must be null`);
      }
      checkActions(relPath, content.actions, page, pagesByPath, `block ${block.id}`);
      if (block.type === 'footer') {
        for (const column of content.columns ?? []) for (const link of column.links ?? []) checkLink(relPath, link.href, page, pagesByPath, `footer ${block.id}`);
      }
    }
  }
}

if (failed) process.exit(1);
console.log(`SiteModel semantic validation OK: ${fixtures.length} fixtures`);
