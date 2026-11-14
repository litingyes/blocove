import type { DocsPage } from '@/docs/types'
import ImageShowcaseDemo from '@/docs/examples/image/image-showcase'
import { getRegistrySource } from '@/lib/registry-source'

export const docsPage: DocsPage = {
  item: 'image-showcase',
  examples: [
    {
      title: 'Image Showcase',
      component: ImageShowcaseDemo,
      code: getRegistrySource('blocks/image-showcase.tsx') ?? '',
    },
  ],
  usage: [
    {
      title: 'Use the block',
      code: `import { ImageShowcase } from "@/components/blocove/image-showcase"

export function MissionStory() {
  return (
    <ImageShowcase
      eyebrow="Photo essay"
      title="Around the Moon"
      description="Four stills from the launch trailer."
      credit="NASA"
      meta={["Four stills", "Artemis II"]}
      href="https://images.nasa.gov/"
      images={[
        { src: "/lead.jpg", alt: "The launch vehicle on the pad", caption: "A still from the trailer." },
        { src: "/detail.jpg", alt: "A detail of the launch vehicle" },
        { src: "/liftoff.jpg", alt: "The launch" }
      ]}
    />
  )
}`,
    },
  ],
  api: [
    {
      name: 'ImageShowcase',
      description:
        'An editorial image story: a lead photograph with its caption and credit, a facts and actions row, and a gallery for the rest of the set.',
      rows: [
        { prop: 'title', type: 'string', default: 'Required' },
        { prop: 'images', type: 'readonly ImageShowcaseItem[]', default: 'Required' },
        { prop: 'eyebrow', type: 'string', default: '-' },
        { prop: 'description', type: 'string', default: '-' },
        { prop: 'credit', type: 'ReactNode', default: '-' },
        { prop: 'meta', type: 'string[]', default: '-' },
        { prop: 'actions', type: 'ReactNode', default: '-' },
        { prop: 'href', type: 'string', default: '-' },
        { prop: 'aspectRatio', type: 'number | string', default: '\'16 / 9\'' },
        { prop: 'widths', type: 'readonly number[]', default: '-' },
        { prop: 'transform', type: '(src, width) => string', default: 'Identity' },
        { prop: 'sizes', type: 'string', default: '-' },
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
    {
      name: 'ImageShowcaseItem',
      description: 'One image in the story; the first one leads the block.',
      rows: [
        { prop: 'src', type: 'string', default: 'Required' },
        { prop: 'alt', type: 'string', default: 'Required' },
        { prop: 'thumbnailSrc', type: 'string', default: 'src' },
        { prop: 'caption', type: 'ReactNode', default: '-' },
      ],
    },
  ],
  note: 'The lead image keeps the zoom behaviour, so a reader can open it without leaving the story. Images after the first become the gallery, which owns the roving-focus thumbnails; the block itself only supplies the label.',
}
