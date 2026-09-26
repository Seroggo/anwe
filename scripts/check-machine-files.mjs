import assert from 'node:assert/strict';
import { buildRobotsTxt, buildSitemapXml, normalizeSiteUrl } from '../src/runtime/machine-files.mjs';

const origin = normalizeSiteUrl('https://example.org/', 'fixture');
assert.equal(origin, 'https://example.org');
assert.equal(buildRobotsTxt(origin), 'User-agent: *\nAllow: /\nSitemap: https://example.org/sitemap.xml\n');
const xml = buildSitemapXml({ pages: [
  { path: '/', sitemap: true, robots: { index: true } },
  { path: '/services/assembly/', sitemap: true, robots: { index: true } },
  { path: '/private/', sitemap: false, robots: { index: true } },
  { path: '/hidden/', sitemap: true, robots: { index: false } }
] }, origin);
assert.match(xml, /<loc>https:\/\/example\.org\/<\/loc>/);
assert.match(xml, /<loc>https:\/\/example\.org\/services\/assembly\/<\/loc>/);
assert.equal((xml.match(/<loc>/g) || []).length, 2, 'only sitemap-enabled, indexable pages belong in sitemap');
assert.throws(() => normalizeSiteUrl('example.org', 'fixture'), /absolute HTTP\(S\) origin/);
assert.throws(() => normalizeSiteUrl('https://example.org/path', 'fixture'), /without path/);
console.log('Machine crawler file checks passed: origin validation, robots policy and sitemap membership');
