import type { DocsPage } from '@/docs/types'
import EditorHighlightDemo from '@/docs/examples/rich-text-editor/highlight'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-highlight',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorHighlightDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorHighlight',
        ],
        toolbar: ['EditorHighlightToolbar'],
        bubble: ['EditorHighlightToolbar'],
        content: '<p>This paragraph contains <mark>highlighted text</mark> next to regular text.</p>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorHighlight',
      description:
        'Registers the highlight mark. Multiple colors are enabled, so a highlight can carry its own color.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<HighlightOptions>',
          default: '-',
        },
      ],
    },
    {
      name: 'EditorHighlightToolbar',
      description:
        'Toolbar toggle for the highlight mark, also usable inside the bubble menu.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
}
