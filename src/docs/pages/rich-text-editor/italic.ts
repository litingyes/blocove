import type { DocsPage } from '@/docs/types'
import EditorItalicDemo from '@/docs/examples/rich-text-editor/italic'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-italic',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorItalicDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorItalic',
        ],
        toolbar: ['EditorItalicToolbar'],
        bubble: ['EditorItalicToolbar'],
        content: '<p><em>Italic</em> text</p>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorItalic',
      description:
        'Registers the italic mark. Options pass through to the Tiptap extension.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<ItalicOptions>',
          default: '-',
        },
      ],
    },
    {
      name: 'EditorItalicToolbar',
      description:
        'Toolbar toggle for the italic mark, also usable inside the bubble menu.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
}
