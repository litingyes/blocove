import type { DocsPage } from '@/docs/types'
import EditorMathematicsDemo from '@/docs/examples/rich-text-editor/mathematics'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

const katexSnippet = `/* src/styles.css */
@import "katex/dist/katex.min.css";`

export const docsPage: DocsPage = {
  item: 'rich-text-editor-mathematics',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorMathematicsDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorMathematics',
        ],
        toolbar: ['EditorMathematicsToolbar'],
        content: '<p>Energy: <span data-type="inline-math" data-latex="E = mc^2"></span></p>',
      }),
    },
  ],
  usage: [
    {
      title: 'Install the KaTeX stylesheet',
      code: katexSnippet,
      language: 'css',
    },
  ],
  api: [
    {
      name: 'EditorMathematics',
      description: 'Registers the KaTeX backed inline and block math nodes. Options pass through to the Mathematics extension.',
      rows: [
        { prop: 'inlineOptions', type: 'Omit<InlineMathOptions, "katexOptions">', default: '-' },
        { prop: 'blockOptions', type: 'Omit<BlockMathOptions, "katexOptions">', default: '-' },
        { prop: 'katexOptions', type: 'KatexOptions', default: '-' },
      ],
    },
    {
      name: 'EditorMathematicsToolbar',
      description: 'Toolbar control that inserts an inline or a block formula from a LaTeX source.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  note: 'KaTeX renders the formulas, so the stylesheet has to be available. Without it the document still parses and the nodes stay editable, but the formulas render unstyled.',
}
