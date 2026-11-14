import type { DocsPage } from '@/docs/types'
import ImageCompareDemo from '@/docs/examples/image/compare'
import { imageSamples } from '@/docs/examples/image/content'
import { imageCompareUsage } from '@/docs/snippets/image'

export const docsPage: DocsPage = {
  item: 'image-compare',
  examples: [
    {
      title: 'Before and after',
      component: ImageCompareDemo,
      code: imageCompareUsage({
        before: {
          alt: 'The frame in black and white',
          src: imageSamples.before,
        },
        after: {
          alt: 'The frame in color',
          src: imageSamples.after,
        },
      }),
    },
  ],
  note: 'Both images share one stage, so the block never jumps while the two files load. The split is a native range input rather than a decorative handle: arrow keys move it, the value is announced, and the visual divider follows the same state.',
  api: [
    {
      name: 'ImageCompare',
      description:
        'A before/after comparison on one layout-stable stage. The range input drives the split and stays visible for keyboard and screen-reader users.',
      rows: [
        { prop: 'before', type: 'ImageCompareSide', default: 'Required' },
        { prop: 'after', type: 'ImageCompareSide', default: 'Required' },
        { prop: 'beforeLabel', type: 'string', default: '\'Before\'' },
        { prop: 'afterLabel', type: 'string', default: '\'After\'' },
        { prop: 'defaultPosition', type: 'number', default: '50' },
        { prop: 'aspectRatio', type: 'number | string', default: '\'16 / 9\'' },
        { prop: 'widths', type: 'readonly number[]', default: '-' },
        { prop: 'transform', type: '(src, width) => string', default: 'Identity' },
        { prop: 'sizes', type: 'string', default: '-' },
        { prop: 'rangeLabel', type: 'string', default: '\'Comparison position\'' },
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
    {
      name: 'ImageCompareSide',
      description: 'One side of the comparison.',
      rows: [
        { prop: 'src', type: 'string', default: 'Required' },
        { prop: 'alt', type: 'string', default: 'Required' },
      ],
    },
  ],
}
