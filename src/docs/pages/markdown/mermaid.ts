import type { DocsPage } from '@/docs/types'
import { markdownDemoContent } from '@/docs/examples/markdown/content'
import MarkdownMermaidDemo from '@/docs/examples/markdown/mermaid'
import { markdownMermaidUsage } from '@/docs/snippets/markdown'

export const docsPage: DocsPage = {
  item: 'markdown-mermaid',
  requiresTypeset: true,
  demoDeps: ['markdown'],
  examples: [
    {
      title: 'Default',
      component: MarkdownMermaidDemo,
      code: markdownMermaidUsage(markdownDemoContent.mermaid),
    },
  ],
  note: 'A fence with the `mermaid` language becomes a diagram once its closing fence arrives; the source stays readable while the tokens stream. The diagram mounts client-side with Pele: it reads the container width, follows resizes and owns the error display. Colors are the shadcn CSS variables mapped onto `--pele-*`, so a theme switch repaints without re-rendering. Images are disabled and links keep Pele\'s default schemes. A diagram Pele rejects falls back to the source with a short message.',
  api: [
    {
      name: 'MarkdownMermaid',
      description:
        'The Mermaid fence renderer. The shell passes `language`, `code`, `streaming` and `complete`; register it through `components.fences`. It renders the source until `complete` is set — the closing fence or the final source — then mounts Pele client-side.',
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
