import type { DocsPage } from '@/docs/types'
import EditorBlockquoteDemo from '@/docs/examples/rich-text-editor/blockquote'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-blockquote',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorBlockquoteDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorBlockquote',
        ],
        toolbar: ['EditorBlockquoteToolbar'],
        content: '<blockquote><p>Quoted text</p></blockquote><p>Body</p>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorBlockquote',
      description: 'Registers the blockquote node.',
      rows: [],
    },
    {
      name: 'EditorBlockquoteToolbar',
      description: 'Toolbar toggle for the blockquote node.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
}
