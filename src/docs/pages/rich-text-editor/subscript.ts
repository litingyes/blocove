import type { DocsPage } from '@/docs/types'
import EditorSubscriptDemo from '@/docs/examples/rich-text-editor/subscript'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-subscript',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorSubscriptDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorSubscript',
        ],
        toolbar: ['EditorSubscriptToolbar'],
        bubble: ['EditorSubscriptToolbar'],
        content: '<p>Chemical formulas use the mark: H<sub>2</sub>O and CO<sub>2</sub>.</p>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorSubscript',
      description: 'Registers the subscript mark.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<SubscriptExtensionOptions>',
          default: '-',
        },
      ],
    },
    {
      name: 'EditorSubscriptToolbar',
      description:
        'Toolbar toggle for the subscript mark, also usable inside the bubble menu.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
}
