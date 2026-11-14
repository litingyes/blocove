import type { DocsPage } from '@/docs/types'
import { markdownDemoContent } from '@/docs/examples/markdown/content'
import MarkdownMathDemo from '@/docs/examples/markdown/math'
import { markdownMathUsage } from '@/docs/snippets/markdown'

export const docsPage: DocsPage = {
  item: 'markdown-math',
  requiresTypeset: true,
  demoDeps: ['markdown'],
  examples: [
    {
      title: 'Default',
      component: MarkdownMathDemo,
      code: markdownMathUsage(markdownDemoContent.math),
    },
  ],
  usage: [
    {
      title: 'Import the KaTeX stylesheet',
      code: `// KaTeX ships the layout the formulas render into.\nimport "katex/dist/katex.min.css"`,
      language: 'ts',
    },
  ],
  note: 'Formulas are typeset with KaTeX: `$…$` renders inline and `$$…$$` as a display block that scrolls instead of overflowing the reading column. A formula that is still being written, or that has a syntax error, renders with KaTeX\'s error color instead of throwing, so streaming math never blanks the sentence. Without this renderer the shell leaves the dollar signs in the text.',
  api: [
    {
      name: 'MarkdownMath',
      description:
        'Renders one formula. The shell passes `value`, `display` and `streaming`; register it through the shell\'s `components` map. The item declares `katex` as its dependency and expects the KaTeX stylesheet to be imported once by the application.',
      extends: 'MarkdownMathProps',
      rows: [
        { prop: 'value', type: 'string', default: 'Required' },
        { prop: 'display', type: 'boolean', default: 'Required' },
        { prop: 'streaming', type: 'boolean', default: '-' },
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
}
