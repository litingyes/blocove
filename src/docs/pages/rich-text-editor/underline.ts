import type { DocsPage } from '@/docs/types'
import EditorUnderlineDemo from '@/docs/examples/rich-text-editor/underline'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-underline',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorUnderlineDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorUnderline',
        ],
        toolbar: ['EditorUnderlineToolbar'],
        bubble: ['EditorUnderlineToolbar'],
        content: '<p><u>Underline</u> text</p>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorUnderline',
      description:
        'Registers the underline mark. Options pass through to the Tiptap extension.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<UnderlineOptions>',
          default: '-',
        },
      ],
    },
    {
      name: 'EditorUnderlineToolbar',
      description:
        'Toolbar toggle for the underline mark, also usable inside the bubble menu.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
}
