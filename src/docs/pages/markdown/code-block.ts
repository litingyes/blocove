import type { DocsPage } from '@/docs/types'
import MarkdownCodeBlockDemo from '@/docs/examples/markdown/code-block'
import { markdownDemoContent } from '@/docs/examples/markdown/content'
import { markdownCodeBlockUsage } from '@/docs/snippets/markdown'

export const docsPage: DocsPage = {
  item: 'markdown-code-block',
  requiresTypeset: true,
  demoDeps: ['markdown'],
  examples: [
    {
      title: 'Default',
      component: MarkdownCodeBlockDemo,
      code: markdownCodeBlockUsage(markdownDemoContent.code),
    },
  ],
  note: 'Fences are tokenized with shiki and the class-based theme the docs code panels use: `github-light`, and `github-dark` when the document carries the `dark` class, so a fence follows the page theme without re-rendering. A fence that streams is highlighted line by line — finished lines keep their tokens and only the open line is tokenized again, starting from the grammar state of the line before it, so the cost of a token is one line, not the block. The shipped languages are bash, css, diff, html, javascript, json, jsx, markdown, python, sql, tsx, typescript and yaml, with the usual aliases; anything else renders as plain text.',
  api: [
    {
      name: 'MarkdownCodeBlock',
      description:
        'The fence renderer. The shell passes `language`, `code` and `streaming`; register it through the shell\'s `components` map. The element keeps no `data-slot` on purpose: typeset already styles `pre > code`, so the fence stays in the typeset flow and the tokens only add color.',
      extends: 'MarkdownCodeProps',
      rows: [
        { prop: 'language', type: 'string', default: 'Required' },
        { prop: 'code', type: 'string', default: 'Required' },
        { prop: 'streaming', type: 'boolean', default: '-' },
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
}
