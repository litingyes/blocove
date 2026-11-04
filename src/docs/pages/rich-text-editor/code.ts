import type { DocsPage } from '@/docs/types'
import EditorCodeDemo from '@/docs/examples/rich-text-editor/code'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-code',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorCodeDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorCode',
        ],
        toolbar: ['EditorCodeToolbar'],
        bubble: ['EditorCodeToolbar'],
        content: '<p><code>inline code</code> text</p>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorCode',
      description:
        'Registers the inline code mark. Code blocks are a separate node item.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<CodeOptions>',
          default: '-',
        },
      ],
    },
    {
      name: 'EditorCodeToolbar',
      description:
        'Toolbar toggle for the inline code mark, also usable inside the bubble menu.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
}
