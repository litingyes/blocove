import type { DocsPage } from '@/docs/types'
import EditorImageDemo from '@/docs/examples/rich-text-editor/image'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-image',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorImageDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorImage',
        ],
        toolbar: ['EditorImageToolbar'],
        content: '<p>Before</p><img src="/editor-image.svg" alt="Example"><p>After</p>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorImage',
      description:
        'Registers the image node. Options pass through to the Tiptap extension; uploads are not included, the toolbar inserts by URL.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<ImageOptions>',
          default: '-',
        },
      ],
    },
    {
      name: 'EditorImageToolbar',
      description:
        'Toolbar control with a URL popover. Opening it while an image is selected pre-fills the current source.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
}
