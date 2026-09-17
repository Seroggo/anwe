/**
 * Render-time link rebasing for preview mounts.
 *
 * SiteModel internal absolute hrefs are canonical site paths:
 *   "/"          → canonical homepage
 *   "/services/consulting/" → canonical service page
 *
 * Review/test runtime may be mounted under a prefix, e.g. "/test/human-runtime/".
 * This helper transforms ONLY internal absolute hrefs to the mounted form,
 * without mutating SiteModel or MachineSpec canonical paths.
 *
 * Untouched (returned as-is):
 *   - anchors "#contacts", "#top"
 *   - external "https://..."
 *   - "mailto:..."
 *   - "tel:..."
 *
 * A mountBase of "/" or "" is a no-op.
 */

export function normalizeMountBase(mountBase: string): string {
  if (typeof mountBase !== 'string' || mountBase.length === 0) return '/';
  let base = mountBase.trim();
  if (!base.startsWith('/')) base = '/' + base;
  if (!base.endsWith('/')) base = base + '/';
  // Collapse accidental leading double slash (e.g. user passed "" → "/").
  if (base.length > 1 && base.startsWith('//')) base = base.slice(1);
  return base;
}

function isInternalAbsolute(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//');
}

/**
 * Rebase a single href. Returns the same string for non-internal hrefs.
 */
export function rebaseHref(href: string, mountBase: string): string {
  if (typeof href !== 'string' || href.length === 0) return href;
  if (!isInternalAbsolute(href)) return href;
  const base = normalizeMountBase(mountBase);
  if (base === '/') return href;
  // href always starts with "/" here; strip it to avoid double slash.
  return base + href.slice(1);
}

/**
 * Recursive, non-mutating transform of any block-shaped content.
 * Only string values found under property name "href" are rebased.
 * Returns a structurally-shared deep clone where unchanged subtrees
 * may keep original references (safe because we never mutate inputs).
 */
export function rebaseContent<T>(value: T, mountBase: string): T {
  const base = normalizeMountBase(mountBase);
  if (base === '/') return value;
  return rebaseValue(value, base) as T;
}

function rebaseValue(value: unknown, base: string): unknown {
  if (Array.isArray(value)) {
    let changed = false;
    const out = value.map((item) => {
      const rebased = rebaseValue(item, base);
      if (rebased !== item) changed = true;
      return rebased;
    });
    return changed ? out : value;
  }
  if (value && typeof value === 'object') {
    let changed = false;
    const out: Record<string, unknown> = {};
    for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
      if (key === 'href' && typeof raw === 'string' && isInternalAbsolute(raw)) {
        out[key] = base + raw.slice(1);
        changed = true;
      } else {
        const rebased = rebaseValue(raw, base);
        if (rebased !== raw) changed = true;
        out[key] = rebased;
      }
    }
    return changed ? out : value;
  }
  return value;
}