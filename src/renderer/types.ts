export const blockTypes = [
  'header',
  'hero',
  'text',
  'split',
  'cards',
  'steps',
  'stats',
  'gallery',
  'faq',
  'cta',
  'media',
  'contacts',
  'footer'
] as const;

export type BlockType = (typeof blockTypes)[number];
export type Surface = 'default' | 'muted' | 'accent' | 'inverse';
export type ActionStyle = 'primary' | 'secondary' | 'text';
export type ThemeId = 'editorial-pastel' | 'cinematic-dark' | 'color-block';

export interface MediaObject {
  src: string | null;
  alt: string;
  aspect: string;
  fit: 'cover' | 'contain';
}

export interface Action {
  label: string;
  href: string;
  style: ActionStyle;
}

export interface Block {
  id: string;
  type: BlockType;
  variant: string;
  surface: Surface;
  content: Record<string, unknown>;
}

export type FormFieldType = 'text' | 'email' | 'tel' | 'textarea';

export interface FormField {
  name: string;
  type: FormFieldType;
  label: string;
  placeholder: string;
  required: boolean;
  autocomplete: string | null;
}

export interface FormShell {
  id: string;
  transport_status: 'unwired';
  fields: FormField[];
  submit_label: string;
}

export interface PageFixture {
  id: string;
  title: string;
  description: string;
  blocks: Block[];
}

export interface DemoMatrix {
  themes: ThemeId[];
  layouts: Array<{ id: string; fixture: string }>;
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export function asMedia(value: unknown): MediaObject | null {
  const media = asRecord(value);
  if (!('src' in media) && !('alt' in media) && !('aspect' in media)) return null;
  return {
    src: typeof media.src === 'string' ? media.src : null,
    alt: asString(media.alt),
    aspect: asString(media.aspect, '4:3'),
    fit: media.fit === 'contain' ? 'contain' : 'cover'
  };
}

export function asActions(value: unknown): Action[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const action = asRecord(item);
    if (!action.label || !action.href) return [];
    const style: ActionStyle = action.style === 'secondary' || action.style === 'text' ? action.style : 'primary';
    return [{ label: asString(action.label), href: asString(action.href, '#'), style }];
  });
}

export function mediaAspect(value: unknown): string {
  const raw = asString(value, '4:3');
  const [width, height] = raw.split(':').map(Number);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return '4 / 3';
  return `${width} / ${height}`;
}

export function textLines(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  const text = asString(value);
  return text ? [text] : [];
}
