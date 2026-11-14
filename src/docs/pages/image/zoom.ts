import type { DocsPage } from '@/docs/types'
import { imageSamples } from '@/docs/examples/image/content'
import ImageZoomDemo from '@/docs/examples/image/zoom'
import { imageZoomUsage } from '@/docs/snippets/image'

export const docsPage: DocsPage = {
  item: 'image-zoom',
  examples: [
    {
      title: 'Zoomable image',
      component: ImageZoomDemo,
      code: imageZoomUsage({
        widths: imageSamples.widths,
        sizes: '(min-width: 1024px) 640px, 100vw',
      }),
    },
  ],
  note: 'The trigger is a real button and the large image opens in a dialog, so Escape closes it, the focus stays inside it and returns to the trigger when it closes. `thumbnailSrc` keeps the trigger light while the dialog requests the full image with `sizes="100vw"`.',
  api: [
    {
      name: 'ImageZoom',
      description:
        'A thumbnail that opens the full-size source in a dialog. The dialog owns the focus behaviour; the item owns the composition.',
      rows: [
        { prop: 'src', type: 'string', default: 'Required' },
        { prop: 'alt', type: 'string', default: 'Required' },
        { prop: 'thumbnailSrc', type: 'string', default: 'src' },
        { prop: 'caption', type: 'ReactNode', default: '-' },
        { prop: 'aspectRatio', type: 'number | string', default: '-' },
        { prop: 'width', type: 'number', default: '-' },
        { prop: 'height', type: 'number', default: '-' },
        { prop: 'priority', type: 'boolean', default: 'false' },
        { prop: 'sizes', type: 'string', default: '\'100vw\'' },
        { prop: 'widths', type: 'readonly number[]', default: '-' },
        { prop: 'transform', type: '(src, width) => string', default: 'Identity' },
        { prop: 'placeholder', type: 'string', default: '-' },
        { prop: 'zoomLabel', type: 'string', default: 'Zoom image: <alt>' },
        { prop: 'triggerClassName', type: 'string', default: '-' },
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
}
