import type { DocsPage } from '@/docs/types'
import EditorSuperscriptDemo from '@/docs/examples/rich-text-editor/superscript'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-superscript',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorSuperscriptDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorSuperscript',
        ],
        toolbar: ['EditorSuperscriptToolbar'],
        bubble: ['EditorSuperscriptToolbar'],
        content: '<p>Exponents use the mark: E = mc<sup>2</sup> and x<sup>2</sup> + y<sup>2</sup>.</p>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorSuperscript',
      description: 'Registers the superscript mark.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<SuperscriptExtensionOptions>',
          default: '-',
        },
      ],
    },
    {
      name: 'EditorSuperscriptToolbar',
      description:
        'Toolbar toggle for the superscript mark, also usable inside the bubble menu.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
}
