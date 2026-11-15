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
  note: 'Fences render inside the shadcn/ui code block: a card with the language in the header and a copy action, so an answer looks like the docs code panels instead of a bare `<pre>`. Copy takes the current source, including while the fence is still streaming. The card is a typeset component, so typeset supplies the block spacing and the old `pre > code` rules no longer apply to fences. Tokens still arrive line by line: finished lines keep their tokens and only the open line is tokenized again, starting from the grammar state of the line before it, so the cost of a token is one line, not the block. The shipped languages are bash, css, diff, html, javascript, json, jsx, markdown, python, sql, tsx, typescript and yaml, with the usual aliases; anything else renders as plain text.',
  api: [
    {
      name: 'MarkdownCodeBlock',
      description:
        'The fence renderer. The shell passes `language`, `code`, `streaming` and `complete`; register it through the shell\'s `components` map. The card root carries `data-language` and the header shows the language; the copy action copies the current source, including while the fence streams. Typeset supplies the block spacing, and the code block itself styles the fence.',
      extends: 'MarkdownCodeProps',
      rows: [
        { prop: 'language', type: 'string', default: 'Required' },
        { prop: 'code', type: 'string', default: 'Required' },
        { prop: 'streaming', type: 'boolean', default: '-' },
        { prop: 'complete', type: 'boolean', default: '-' },
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
}
