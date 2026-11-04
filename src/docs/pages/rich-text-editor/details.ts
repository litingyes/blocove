import type { DocsPage } from '@/docs/types'
import EditorDetailsDemo from '@/docs/examples/rich-text-editor/details'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-details',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorDetailsDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorDetails',
        ],
        toolbar: ['EditorDetailsToolbar'],
        content: '<details open><summary>Summary</summary><div data-type="detailsContent"><p>Content</p></div></details>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorDetails',
      description:
        'Registers the details, summary and content nodes with a React node view. The open state is stored on the node, so it persists in the document.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<DetailsOptions>',
          default: '{ persist: true }',
        },
      ],
    },
    {
      name: 'EditorDetailsToolbar',
      description: 'Toolbar action that inserts a details block.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
}
