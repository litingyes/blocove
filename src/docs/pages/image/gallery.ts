import type { DocsPage } from '@/docs/types'
import ImageGalleryDemo from '@/docs/examples/image/gallery'
import { imageGalleryUsage } from '@/docs/snippets/image'

export const docsPage: DocsPage = {
  item: 'image-gallery',
  examples: [
    {
      title: 'Gallery',
      component: ImageGalleryDemo,
      code: imageGalleryUsage({ columns: 3 }),
    },
  ],
  note: 'The selected picture keeps the zoom behaviour of `ImageZoom`; the thumbnails are one roving-focus group. Arrow keys wrap around the set, Home and End jump to the edges, and the selected thumbnail carries `aria-current` so the state is exposed to assistive technology as well as sighted users.',
  api: [
    {
      name: 'ImageGallery',
      description:
        'A selected image with a thumbnail grid. Clicking a thumbnail selects it; the keyboard moves the selection and the focus together.',
      rows: [
        { prop: 'images', type: 'readonly ImageGalleryItem[]', default: 'Required' },
        { prop: 'defaultIndex', type: 'number', default: '0' },
        { prop: 'columns', type: '2 | 3 | 4', default: '3' },
        { prop: 'aspectRatio', type: 'number | string', default: '-' },
        { prop: 'widths', type: 'readonly number[]', default: '-' },
        { prop: 'transform', type: '(src, width) => string', default: 'Identity' },
        { prop: 'sizes', type: 'string', default: '-' },
        { prop: 'label', type: 'string', default: '\'Image gallery\'' },
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
    {
      name: 'ImageGalleryItem',
      description: 'One image in the set.',
      rows: [
        { prop: 'src', type: 'string', default: 'Required' },
        { prop: 'alt', type: 'string', default: 'Required' },
        { prop: 'thumbnailSrc', type: 'string', default: 'src' },
        { prop: 'caption', type: 'ReactNode', default: '-' },
      ],
    },
  ],
}
