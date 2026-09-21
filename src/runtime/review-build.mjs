import fs from 'node:fs';
import path from 'node:path';
const REQUIRED_ARTIFACTS = ['SITE_MODEL.json', 'MACHINE_SPEC.json', 'THEME_SPEC.json'];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function requireString(value, label) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Review Build: ${label} must be a non-empty string.`);
  }
  return value;
}

function assertConsistent(folder, siteModel, machineSpec) {
  if (siteModel.site_id !== machineSpec.site_id) {
    throw new Error(
      `Review Build: site folder "${folder}" mismatched site_id: SiteModel "${siteModel.site_id}" != MachineSpec "${machineSpec.site_id}".`
    );
  }
  if (siteModel.source_context_id !== machineSpec.source_context_id) {
    throw new Error(
      `Review Build: site folder "${folder}" mismatched source_context_id: SiteModel "${siteModel.source_context_id}" != MachineSpec "${machineSpec.source_context_id}".`
    );
  }

  for (const page of siteModel.pages) {
    const machinePage = machineSpec.pages.find((candidate) => candidate.page_id === page.id);
    if (!machinePage) {
      throw new Error(
        `Review Build: site folder "${folder}" SiteModel page "${page.id}" has no matching MachineSpec page.`
      );
    }
    if (page.path !== machinePage.path) {
      throw new Error(
        `Review Build: site folder "${folder}" mismatched page path for "${page.id}": SiteModel "${page.path}" != MachineSpec "${machinePage.path}".`
      );
    }
  }
}

/** Discovers only complete, internally consistent site artifact sets. */
export function discoverReviewSites(root = process.cwd()) {
  const sitesRoot = path.join(root, 'sites');
  if (!fs.existsSync(sitesRoot)) return [];

  return fs.readdirSync(sitesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b))
    .flatMap((folder) => {
      const directory = path.join(sitesRoot, folder);
      if (!REQUIRED_ARTIFACTS.every((artifact) => fs.existsSync(path.join(directory, artifact)))) {
        return [];
      }

      const siteModel = readJson(path.join(directory, 'SITE_MODEL.json'));
      const machineSpec = readJson(path.join(directory, 'MACHINE_SPEC.json'));
      const themeSpec = readJson(path.join(directory, 'THEME_SPEC.json'));
      requireString(siteModel.site_id, `site folder "${folder}" SiteModel.site_id`);
      requireString(siteModel.source_context_id, `site folder "${folder}" SiteModel.source_context_id`);
      if (!Array.isArray(siteModel.pages) || !Array.isArray(machineSpec.pages)) {
        throw new Error(`Review Build: site folder "${folder}" has invalid pages arrays.`);
      }
      assertConsistent(folder, siteModel, machineSpec);
      return [{ folder, siteModel, machineSpec, themeSpec }];
    });
}
