import type { DocsPage } from '@/docs/types'
import EditorParagraphDemo from '@/docs/examples/rich-text-editor/paragraph'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-paragraph',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorParagraphDemo,
      code: richTextEditorUsage({
        extensions: ['EditorText', 'EditorParagraph', 'EditorHardBreak'],
        toolbar: [],
        content: '<p>First paragraph</p><p>Second paragraph</p>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorParagraph',
      description:
        'Registers the paragraph block. Options pass through to the Tiptap extension, including shared HTML attributes.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<ParagraphOptions>',
          default: '-',
        },
      ],
    },
  ],
}
