import type { DocsPage } from '@/docs/types'
import { imageSamples } from '@/docs/examples/image/content'
import ImageDemo from '@/docs/examples/image/image'
import { imageUsage } from '@/docs/snippets/image'

export const docsPage: DocsPage = {
  item: 'image',
  examples: [
    {
      title: 'Responsive image',
      component: ImageDemo,
      code: imageUsage({
        widths: imageSamples.widths,
        sizes: '(min-width: 1024px) 640px, 100vw',
        placeholder: 'var(--muted)',
      }),
    },
  ],
  note: 'The box reserves the aspect ratio before the file arrives, so the surrounding layout never shifts. `widths` and `transform` build the srcset, `sizes` lets the browser choose a candidate, and the placeholder stays visible until the image loads. The component is a native `<img>` (or `<picture>` when `sources` is set), so it works in every framework and can be replaced by a framework image component without changing the rest of the page.',
  api: [
    {
      name: 'Image',
      description:
        'The responsive image. The box keeps the aspect ratio, paints the placeholder and exposes `data-state`; the `<img>` inside stays a plain native element.',
      rows: [
        { prop: 'src', type: 'string', default: 'Required' },
        { prop: 'alt', type: 'string', default: 'Required' },
        { prop: 'width', type: 'number', default: '-' },
        { prop: 'height', type: 'number', default: '-' },
        { prop: 'aspectRatio', type: 'number | string', default: 'width / height' },
        { prop: 'srcSet', type: 'string', default: '-' },
        { prop: 'sizes', type: 'string', default: '-' },
        { prop: 'widths', type: 'readonly number[]', default: '[320, 480, 640, 960]' },
        { prop: 'transform', type: '(src, width) => string', default: 'Identity' },
        { prop: 'sources', type: 'readonly ImageSource[]', default: '-' },
        { prop: 'priority', type: 'boolean', default: 'false' },
        { prop: 'focalPoint', type: '{ x: number, y: number }', default: '-' },
        { prop: 'objectFit', type: 'CSSProperties[\'objectFit\']', default: '\'cover\'' },
        { prop: 'placeholder', type: 'string', default: '-' },
        { prop: 'fallback', type: 'ReactNode', default: '-' },
        { prop: 'containerClassName', type: 'string', default: '-' },
        { prop: 'className', type: 'string', default: '-' },
        { prop: '...props', type: 'ImgHTMLAttributes<HTMLImageElement>', default: '-' },
      ],
    },
  ],
}
