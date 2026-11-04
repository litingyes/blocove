import type { DocsPage } from '@/docs/types'
import EditorHardBreakDemo from '@/docs/examples/rich-text-editor/hard-break'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-hard-break',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorHardBreakDemo,
      code: richTextEditorUsage({
        extensions: ['EditorText', 'EditorParagraph', 'EditorHardBreak'],
        toolbar: [],
        content: '<p>First line<br>Second line</p>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorHardBreak',
      description:
        'Registers the hard break node inserted with Shift + Enter. Options pass through to the Tiptap extension.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<HardBreakOptions>',
          default: '-',
        },
      ],
    },
  ],
}
