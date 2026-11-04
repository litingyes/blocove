import type { DocsPage } from '@/docs/types'
import EditorBoldDemo from '@/docs/examples/rich-text-editor/bold'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-bold',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorBoldDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorBold',
        ],
        toolbar: ['EditorBoldToolbar'],
        bubble: ['EditorBoldToolbar'],
        content: '<p><strong>Bold</strong> text</p>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorBold',
      description: 'Registers the bold mark.',
      rows: [],
    },
    {
      name: 'EditorBoldToolbar',
      description:
        'Toolbar toggle for the bold mark, also usable inside the bubble menu.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
}
