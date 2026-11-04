import type { DocsPage } from '@/docs/types'
import EditorStrikeDemo from '@/docs/examples/rich-text-editor/strike'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-strike',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorStrikeDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorStrike',
        ],
        toolbar: ['EditorStrikeToolbar'],
        bubble: ['EditorStrikeToolbar'],
        content: '<p><s>Struck</s> text</p>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorStrike',
      description:
        'Registers the strikethrough mark. Options pass through to the Tiptap extension.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<StrikeOptions>',
          default: '-',
        },
      ],
    },
    {
      name: 'EditorStrikeToolbar',
      description:
        'Toolbar toggle for the strikethrough mark, also usable inside the bubble menu.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
}
