/** Deterministic crawler files derived only from MachineSpec + the site's public origin. */
export function normalizeSiteUrl(value, siteId = 'site') {
  let url;
  try { url = new URL(value); } catch { throw new Error(`Machine files: sites/${siteId}/SITE_URL.json base_url must be an absolute HTTP(S) origin.`); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`Machine files: sites/${siteId}/SITE_URL.json base_url must be an HTTP(S) origin without path, credentials, query, or fragment.`);
  }
  return url.origin;
}

export function buildRobotsTxt(origin) {
  return `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`;
}

export function buildSitemapXml(machineSpec, origin) {
  const pages = machineSpec.pages.filter((page) => page.sitemap && page.robots.index);
  const urls = pages.map((page) => {
    const loc = new URL(page.path, `${origin}/`).href;
    return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}
