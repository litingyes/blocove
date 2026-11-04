import type { DocsPage } from '@/docs/types'
import EditorTextDemo from '@/docs/examples/rich-text-editor/text'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-text',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorTextDemo,
      code: richTextEditorUsage({
        extensions: ['EditorText', 'EditorParagraph', 'EditorHardBreak'],
        toolbar: [],
        content: '<p>Hello</p>',
      }),
    },
  ],
  demoDeps: ['rich-text-editor'],
  api: [
    {
      name: 'EditorText',
      description:
        'Registers the Tiptap Text node. Every editor document needs it, so the Editor item installs it with the basic nodes.',
      rows: [],
    },
  ],
}
