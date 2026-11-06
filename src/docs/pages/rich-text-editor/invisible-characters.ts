import type { DocsPage } from '@/docs/types'
import EditorInvisibleCharactersDemo from '@/docs/examples/rich-text-editor/invisible-characters'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-invisible-characters',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorInvisibleCharactersDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorInvisibleCharacters',
        ],
        content: '<p>Toggle the control to reveal the spaces and the paragraph marks.</p>',
      }),
    },
  ],
  note: 'Invisible characters are decorations: they are rendered next to the document, never written into it. The extension starts with the characters visible, so the toolbar toggle can reveal and hide them.',
  api: [
    {
      name: 'EditorInvisibleCharacters',
      description:
        'Registers the invisible characters extension. Spaces, paragraph marks and hard breaks are rendered through decorations while the characters are visible.',
      rows: [
        { prop: 'visible', type: 'boolean', default: 'true' },
      ],
    },
    {
      name: 'EditorInvisibleCharactersToolbar',
      description:
        'Toolbar toggle that shows and hides the invisible characters.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
}
