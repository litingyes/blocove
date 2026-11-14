import type { DocsPage } from '@/docs/types'
import ImageHeroDemo from '@/docs/examples/image/image-hero'
import { getRegistrySource } from '@/lib/registry-source'

export const docsPage: DocsPage = {
  item: 'image-hero',
  examples: [
    {
      title: 'Image Hero',
      component: ImageHeroDemo,
      code: getRegistrySource('blocks/image-hero.tsx') ?? '',
    },
  ],
  usage: [
    {
      title: 'Use the block',
      code: `import { ImageHero } from "@/components/blocove/image-hero"

export function MissionHero() {
  return (
    <ImageHero
      src="/hero.jpg"
      alt="The launch vehicle on the pad"
      eyebrow="Image family"
      title="A hero that reserves its own space"
      description="One frame, four widths, no layout shift while it loads."
      actions={<a href="/missions">Read the mission</a>}
    />
  )
}`,
    },
  ],
  api: [
    {
      name: 'ImageHero',
      description:
        'A full-bleed photograph behind a gradient, with the eyebrow, headline, description and actions in the lower left corner. The image is a priority image by default.',
      rows: [
        { prop: 'src', type: 'string', default: 'Required' },
        { prop: 'alt', type: 'string', default: 'Required' },
        { prop: 'title', type: 'string', default: 'Required' },
        { prop: 'eyebrow', type: 'string', default: '-' },
        { prop: 'description', type: 'string', default: '-' },
        { prop: 'actions', type: 'ReactNode', default: '-' },
        { prop: 'priority', type: 'boolean', default: 'true' },
        { prop: 'aspectRatio', type: 'number | string', default: '\'16 / 9\'' },
        { prop: 'widths', type: 'readonly number[]', default: '-' },
        { prop: 'transform', type: '(src, width) => string', default: 'Identity' },
        { prop: 'sizes', type: 'string', default: '\'100vw\'' },
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  note: 'The block is the shipped `Image` behind a gradient, so the copy stays legible over any photograph and the box keeps its ratio before the file arrives. Pass `priority` only when the hero is the first thing on the page; the image loads eagerly by default.',
}
