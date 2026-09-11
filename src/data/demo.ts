import matrix from '../../tests/fixtures/demo-matrix.json';
import layoutA from '../../tests/fixtures/pages/layout-a.json';
import layoutB from '../../tests/fixtures/pages/layout-b.json';
import layoutC from '../../tests/fixtures/pages/layout-c.json';
import type { DemoMatrix, PageFixture, ThemeId } from '../renderer/types';

export const demoMatrix = matrix as DemoMatrix;
export const demoThemes = demoMatrix.themes;
export const demoLayouts = [layoutA, layoutB, layoutC] as PageFixture[];

export function getLayout(id: string): PageFixture {
  const layout = demoLayouts.find((item) => item.id === id);
  if (!layout) throw new Error(`Unknown demo layout "${id}".`);
  return layout;
}

export function isThemeId(value: string): value is ThemeId {
  return demoThemes.includes(value as ThemeId);
}
