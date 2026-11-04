import type { DocsPage } from '@/docs/types'
import EditorLinkDemo from '@/docs/examples/rich-text-editor/link'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-link',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorLinkDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorLink',
        ],
        toolbar: ['EditorLinkToolbar'],
        bubble: ['EditorLinkToolbar'],
        content: '<p><a href="https://ui.shadcn.com">link</a> text</p>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorLink',
      description:
        'Registers the link mark. Links do not open on click while editing; the toolbar popover inserts, replaces and removes them.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<LinkOptions>',
          default: '-',
        },
      ],
    },
    {
      name: 'EditorLinkToolbar',
      description:
        'URL popover with Apply and Remove actions. Inputs without a protocol get https://, while mailto: and tel: are kept.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
}
