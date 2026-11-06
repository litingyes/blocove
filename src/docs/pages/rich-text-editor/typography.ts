import type { DocsPage } from '@/docs/types'
import EditorTypographyDemo from '@/docs/examples/rich-text-editor/typography'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-typography',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorTypographyDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorTypography',
        ],
        content: '<p>Type "--" for an em dash and "..." for an ellipsis.</p>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorTypography',
      description:
        'Registers the typography input rules. Dashes, ellipses, quotes, arrows and other patterns are rewritten as they are typed.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<TypographyOptions>',
          default: '-',
        },
      ],
    },
  ],
}
