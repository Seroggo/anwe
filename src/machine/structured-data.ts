/**
 * Deterministic JSON-LD serialization from MachineSpec.
 *
 * Source of truth: MachineSpec only. This module never reaches back into
 * SiteModel for contact facts or business claims. Machine Layer already
 * accepted the decision about which facts are machine-true (including null
 * contacts), and Human Layer must respect that.
 *
 * Scope v0.1:
 *   - primary Organization-like entity (Organization | LocalBusiness |
 *     ProfessionalService | Person)
 *   - page-relevant Service entities (machinePage.service_ids → services[])
 *
 * No absolute URLs are invented. Entity/service identifiers are
 * document-relative fragment ids: "#primary-entity", "#service-<id>".
 */

export interface MachineContactValue {
  value: string;
  href: string;
}

export interface MachineContacts {
  phone: MachineContactValue | null;
  email: MachineContactValue | null;
}

export interface MachinePrimaryEntity {
  id: string;
  schema_type: 'Organization' | 'LocalBusiness' | 'ProfessionalService' | 'Person';
  name: string;
  description: string | null;
  home_path: '/';
  contacts: MachineContacts;
  context_refs: string[];
}

export interface MachineService {
  id: string;
  name: string;
  description: string | null;
  provider_entity_id: string;
  page_ids: string[];
  context_refs: string[];
}

export interface MachinePage {
  page_id: string;
  path: string;
  semantic_role: string;
  meta: { title: string; description: string | null };
  canonical: { path: string };
  robots: { index: boolean; follow: boolean };
  open_graph: { type: string; title: string; description: string | null };
  breadcrumbs: Array<{ label: string; path: string }>;
  primary_entity_id: string;
  service_ids: string[];
  sitemap: boolean;
}

export interface MachineSpec {
  schema_version: '0.1';
  machine_id: string;
  site_id: string;
  source_context_id: string;
  status: string;
  primary_entity: MachinePrimaryEntity;
  services: MachineService[];
  pages: MachinePage[];
  decisions: unknown[];
  issues: unknown[];
}

function isNonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Build the @graph node for the primary entity.
 * description/telephone/email added only when non-null/present.
 */
export function buildPrimaryEntityNode(entity: MachinePrimaryEntity): Record<string, unknown> {
  const node: Record<string, unknown> = {
    '@id': '#primary-entity',
    '@type': entity.schema_type,
    name: entity.name
  };
  if (isNonEmpty(entity.description)) node.description = entity.description;
  if (entity.contacts.phone && isNonEmpty(entity.contacts.phone.href)) {
    node.telephone = entity.contacts.phone.href.replace(/^tel:/, '');
  }
  if (entity.contacts.email && isNonEmpty(entity.contacts.email.href)) {
    node.email = entity.contacts.email.href.replace(/^mailto:/, '');
  }
  return node;
}

export function buildServiceNode(service: MachineService): Record<string, unknown> {
  const node: Record<string, unknown> = {
    '@id': `#service-${service.id}`,
    '@type': 'Service',
    name: service.name,
    provider: { '@id': '#primary-entity' }
  };
  if (isNonEmpty(service.description)) node.description = service.description;
  return node;
}

/**
 * Serialize the JSON-LD @graph for a single page.
 * Only page-relevant services (machinePage.service_ids) are included.
 *
 * Throws on integrity violations:
 *   - primary_entity not found by machinePage.primary_entity_id
 *   - a referenced service id missing from MachineSpec.services
 */
export function serializePageJsonLd(
  machine: MachineSpec,
  machinePage: MachinePage
): Record<string, unknown> {
  if (machine.primary_entity.id !== machinePage.primary_entity_id) {
    throw new Error(
      `JSON-LD: machine page "${machinePage.page_id}" primary_entity_id "${machinePage.primary_entity_id}" does not match MachineSpec.primary_entity.id "${machine.primary_entity.id}".`
    );
  }

  const graph: Record<string, unknown>[] = [buildPrimaryEntityNode(machine.primary_entity)];

  for (const serviceId of machinePage.service_ids) {
    const service = machine.services.find((s) => s.id === serviceId);
    if (!service) {
      throw new Error(
        `JSON-LD: machine page "${machinePage.page_id}" references service "${serviceId}" which is not present in MachineSpec.services.`
      );
    }
    graph.push(buildServiceNode(service));
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  };
}

/**
 * Safe JSON-LD string for embedding in <script type="application/ld+json">.
 *
 * Uses JSON.stringify (no string concatenation) and escapes "<" as the
 * Unicode escape "\u003c" so a business string can never prematurely close
 * the <script> element. Also escapes the line-separator characters for
 * defense in depth. No dependencies.
 */
export function serializeJsonLdScript(data: Record<string, unknown>): string {
  const json = JSON.stringify(data);
  return json
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}