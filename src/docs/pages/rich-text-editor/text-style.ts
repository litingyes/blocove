import type { DocsPage } from '@/docs/types'
import EditorTextStyleDemo from '@/docs/examples/rich-text-editor/text-style'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-text-style',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorTextStyleDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorTextStyle',
          'EditorColor',
          'EditorBackgroundColor',
          'EditorFontFamily',
          'EditorFontSize',
          'EditorLineHeight',
        ],
        toolbar: ['EditorTextStyleToolbar'],
        bubble: ['EditorTextStyleToolbar'],
        content: '<p><span style="color: #dc2626">Red</span> text</p>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorTextStyle',
      description: 'Registers the text style mark that carries the other attributes.',
      rows: [],
    },
    {
      name: 'EditorColor',
      description: 'Adds the color attribute to the text style mark.',
      rows: [],
    },
    {
      name: 'EditorBackgroundColor',
      description: 'Adds the background color attribute to the text style mark.',
      rows: [],
    },
    {
      name: 'EditorFontFamily',
      description: 'Adds the font family attribute to the text style mark.',
      rows: [],
    },
    {
      name: 'EditorFontSize',
      description: 'Adds the font size attribute to the text style mark.',
      rows: [],
    },
    {
      name: 'EditorLineHeight',
      description: 'Adds the line height attribute to the text style mark.',
      rows: [],
    },
    {
      name: 'EditorTextStyleToolbar',
      description: 'Popover with the color, background, font family, font size and line height controls.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  note: 'Each attribute item registers the text style mark it extends, so any one of them works on its own. Declaring the mark and an attribute together registers it once.',
}
