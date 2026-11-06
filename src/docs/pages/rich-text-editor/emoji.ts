import type { DocsPage } from '@/docs/types'
import EditorEmojiDemo from '@/docs/examples/rich-text-editor/emoji'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-emoji',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorEmojiDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorEmoji',
        ],
        toolbar: ['EditorEmojiToolbar'],
        content: '<p>Hello <span data-type="emoji" data-name="smile"></span></p>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorEmoji',
      description: 'Registers the emoji node and the shortcode suggestion. It accepts the emoji data set, so a project can ship a smaller list than the default.',
      rows: [
        { prop: 'emojis', type: 'EmojiItem[]', default: 'Bundled emoji set' },
        { prop: 'char', type: 'string', default: '":"' },
        { prop: 'enableEmoticons', type: 'boolean', default: 'false' },
        { prop: 'forceFallbackImages', type: 'boolean', default: 'false' },
        { prop: 'ariaLabel', type: 'string', default: '"Emoji"' },
        { prop: 'HTMLAttributes', type: 'Record<string, any>', default: '{}' },
      ],
    },
    {
      name: 'EditorEmojiToolbar',
      description: 'Toolbar picker that inserts an emoji node at the caret.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  note: 'The emoji data set ships with the package. Pass `emojis` to narrow the picker and the shortcode suggestion to the set your project supports.',
}
