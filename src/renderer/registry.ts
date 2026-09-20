import Header from '../components/blocks/Header.astro';
import Hero from '../components/blocks/Hero.astro';
import TextBlock from '../components/blocks/Text.astro';
import Split from '../components/blocks/Split.astro';
import Cards from '../components/blocks/Cards.astro';
import Steps from '../components/blocks/Steps.astro';
import Stats from '../components/blocks/Stats.astro';
import Gallery from '../components/blocks/Gallery.astro';
import FAQ from '../components/blocks/FAQ.astro';
import CTA from '../components/blocks/CTA.astro';
import Media from '../components/blocks/Media.astro';
import Contacts from '../components/blocks/Contacts.astro';
import Footer from '../components/blocks/Footer.astro';
import type { BlockType } from './types';

export const blockRegistry = {
  header: Header,
  hero: Hero,
  text: TextBlock,
  split: Split,
  cards: Cards,
  steps: Steps,
  stats: Stats,
  gallery: Gallery,
  faq: FAQ,
  cta: CTA,
  media: Media,
  contacts: Contacts,
  footer: Footer
} as const;

export function getBlockComponent(type: string) {
  if (!(type in blockRegistry)) {
    throw new Error(`Unknown block type "${type}". Add it to the explicit block registry before using it.`);
  }
  return blockRegistry[type as BlockType];
}
