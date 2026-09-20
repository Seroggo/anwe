const siteMediaUrls = import.meta.glob('../../sites/*/media/*', {
  eager: true,
  query: '?url',
  import: 'default'
}) as Record<string, string>;

export function resolveSiteMedia(src: string | null): string | null {
  if (src === null) return null;

  const key = `../../${src}`;
  const resolved = siteMediaUrls[key];
  if (typeof resolved !== 'string') {
    throw new Error(`Unable to resolve site media asset "${src}"`);
  }
  return resolved;
}
