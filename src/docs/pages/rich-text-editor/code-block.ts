import type { DocsPage } from '@/docs/types'
import EditorCodeBlockDemo from '@/docs/examples/rich-text-editor/code-block'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-code-block',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorCodeBlockDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorCodeBlock',
        ],
        toolbar: ['EditorCodeBlockToolbar'],
        content: '<p>Example</p><pre><code>const x = 1</code></pre>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorCodeBlock',
      description:
        'Registers the code block node. Options pass through to the Tiptap extension.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<CodeBlockOptions>',
          default: '-',
        },
      ],
    },
    {
      name: 'EditorCodeBlockToolbar',
      description: 'Toolbar toggle for the code block node.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
}
