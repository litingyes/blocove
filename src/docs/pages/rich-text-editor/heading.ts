import type { DocsPage } from '@/docs/types'
import EditorHeadingDemo from '@/docs/examples/rich-text-editor/heading'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-heading',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorHeadingDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorHeading',
        ],
        toolbar: ['EditorHeadingToolbar'],
        content: '<h1>Title</h1><h2>Section</h2><p>Body</p>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorHeading',
      description:
        'Registers the heading node. The toolbar selector only offers the levels registered here.',
      rows: [
        { prop: 'levels', type: 'Level[]', default: '[1, 2, 3]' },
      ],
    },
    {
      name: 'EditorHeadingToolbar',
      description:
        'Block type selector for paragraphs and the registered heading levels.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
}
