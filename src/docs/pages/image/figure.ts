import type { DocsPage } from '@/docs/types'
import { imageSamples } from '@/docs/examples/image/content'
import ImageFigureDemo from '@/docs/examples/image/figure'
import { imageFigureUsage } from '@/docs/snippets/image'

export const docsPage: DocsPage = {
  item: 'image-figure',
  examples: [
    {
      title: 'Captioned image',
      component: ImageFigureDemo,
      code: imageFigureUsage({
        widths: imageSamples.widths,
        sizes: '(min-width: 1024px) 640px, 100vw',
      }),
    },
  ],
  note: '`ImageFigure` is the editorial wrapper: the image keeps every `Image` behaviour and the `<figcaption>` keeps the caption and the credit on one baseline. `className` styles the figure, so the caption spacing stays with the caption.',
  api: [
    {
      name: 'ImageFigure',
      description:
        'An image with a caption and a credit. Every Image prop is forwarded to the image; the three below style the wrapper.',
      extends: 'ImageProps',
      rows: [
        { prop: 'caption', type: 'ReactNode', default: '-' },
        { prop: 'credit', type: 'ReactNode', default: '-' },
        { prop: 'imageClassName', type: 'string', default: '-' },
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
}
