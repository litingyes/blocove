import type { DocsPage } from '@/docs/types'
import { markdownDemoContent } from '@/docs/examples/markdown/content'
import MarkdownOverviewDemo from '@/docs/examples/markdown/markdown'
import {
  MarkdownFootnotesDemo,
  MarkdownHeadingsDemo,
  MarkdownInlineDemo,
  MarkdownListsDemo,
  MarkdownMediaDemo,
  MarkdownQuoteDemo,
  MarkdownTableDemo,
} from '@/docs/examples/markdown/nodes'
import { MarkdownStreamingDemo } from '@/docs/examples/markdown/streaming'
import { markdownStreamingUsage, markdownUsage } from '@/docs/snippets/markdown'
import { typesetCommand, typesetSetup } from '@/docs/snippets/typeset'

export const docsPage: DocsPage = {
  item: 'markdown',
  requiresTypeset: true,
  demoDeps: ['markdown-code-block', 'markdown-math'],
  examples: [
    {
      title: 'Overview',
      component: MarkdownOverviewDemo,
      code: markdownUsage({
        source: markdownDemoContent.overview,
        code: true,
        math: true,
      }),
    },
    {
      title: 'Headings',
      component: MarkdownHeadingsDemo,
      code: markdownUsage({ source: markdownDemoContent.headings }),
    },
    {
      title: 'Inline marks',
      component: MarkdownInlineDemo,
      code: markdownUsage({ source: markdownDemoContent.inline }),
    },
    {
      title: 'Lists and tasks',
      component: MarkdownListsDemo,
      code: markdownUsage({ source: markdownDemoContent.lists }),
    },
    {
      title: 'Tables',
      component: MarkdownTableDemo,
      code: markdownUsage({ source: markdownDemoContent.table }),
    },
    {
      title: 'Quotes and rules',
      component: MarkdownQuoteDemo,
      code: markdownUsage({ source: markdownDemoContent.quote }),
    },
    {
      title: 'Images and links',
      component: MarkdownMediaDemo,
      code: markdownUsage({ source: markdownDemoContent.media }),
    },
    {
      title: 'Footnotes',
      component: MarkdownFootnotesDemo,
      code: markdownUsage({ source: markdownDemoContent.footnotes }),
    },
    {
      title: 'Streaming',
      component: MarkdownStreamingDemo,
      code: markdownStreamingUsage(markdownDemoContent.streaming),
    },
  ],
  usage: [
    {
      title: 'Install typeset',
      code: typesetCommand,
      language: 'bash',
    },
    {
      title: 'Typeset setup',
      code: typesetSetup,
      language: 'css',
    },
  ],
  note: 'Every node is a plain semantic element inside a `.typeset typeset-docs` container, so a document looks exactly like the rich text editor and no second stylesheet has to be kept in sync. Streaming is the default behaviour, not a second mode: while `source` grows, the parse cache keeps every block that already ended and re-parses only the open one, so finished elements keep their DOM, a completed fence is not tokenized again, and a half-written marker stays literal until its closing token arrives. Raw HTML is escaped, and only `http`, `https`, `mailto`, `tel`, fragment and relative targets become anchors.',
  api: [
    {
      name: 'Markdown',
      description:
        'The streaming-safe renderer. `source` is the whole document; growing the string token by token is the case the shell is built for. The layout element carries `data-slot="markdown"`; the typeset element deliberately does not, because typeset skips the descendants of a `data-slot` element.',
      rows: [
        { prop: 'source', type: 'string', default: 'Required' },
        { prop: 'streaming', type: 'boolean', default: 'false' },
        { prop: 'typeset', type: 'boolean', default: 'true' },
        { prop: 'components', type: 'MarkdownComponents', default: '-' },
        { prop: 'className', type: 'string', default: '-' },
        { prop: 'contentClassName', type: 'string', default: '-' },
      ],
    },
    {
      name: 'MarkdownComponents',
      description:
        'Capability map of the shell. A node with no registered renderer keeps its literal source — a fence falls back to `<pre><code>` and math stays `$…$` — so the optional items compose without the shell knowing them. Fence renderers are keyed by lowercase language and fall back to `code`; a fence renderer receives `complete` when the closing fence has arrived or the source is final.',
      rows: [
        { prop: 'code', type: 'ComponentType<MarkdownCodeProps>', default: '-' },
        { prop: 'math', type: 'ComponentType<MarkdownMathProps>', default: '-' },
        { prop: 'fences', type: 'Record<string, ComponentType<MarkdownCodeProps>>', default: '-' },
      ],
    },
  ],
}
