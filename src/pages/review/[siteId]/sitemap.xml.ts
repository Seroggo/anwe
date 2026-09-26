import type { APIRoute, GetStaticPaths } from 'astro';
import { discoverReviewSites } from '../../../runtime/review-build.mjs';
import { buildSitemapXml, normalizeSiteUrl } from '../../../runtime/machine-files.mjs';
import type { MachineSpec } from '../../../machine/structured-data';

type Site = { folder: string; siteUrl: { base_url: string } | null; machineSpec: MachineSpec };
export const getStaticPaths = (() => (discoverReviewSites() as Site[]).map((site) => {
  const config = site.siteUrl;
  if (!config) throw new Error(`Machine files: missing sites/${site.folder}/SITE_URL.json (required for robots.txt and sitemap.xml).`);
  return {
    params: { siteId: site.folder },
    props: { machineSpec: site.machineSpec, origin: normalizeSiteUrl(config.base_url, site.folder) }
  };
})) as GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const { machineSpec, origin } = props as { machineSpec: MachineSpec; origin: string };
  return new Response(buildSitemapXml(machineSpec, origin), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
