import type { APIRoute, GetStaticPaths } from 'astro';
import { discoverReviewSites } from '../../../runtime/review-build.mjs';
import { buildRobotsTxt, normalizeSiteUrl } from '../../../runtime/machine-files.mjs';

type Site = { folder: string; siteUrl: { base_url: string } | null };
export const getStaticPaths = (() => (discoverReviewSites() as Site[]).map((site) => {
  const config = site.siteUrl;
  if (!config) throw new Error(`Machine files: missing sites/${site.folder}/SITE_URL.json (required for robots.txt and sitemap.xml).`);
  return { params: { siteId: site.folder }, props: { origin: normalizeSiteUrl(config.base_url, site.folder) } };
})) as GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const { origin } = props as { origin: string };
  return new Response(buildRobotsTxt(origin), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
