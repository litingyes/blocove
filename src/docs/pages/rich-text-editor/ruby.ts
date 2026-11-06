import type { DocsPage } from '@/docs/types'
import EditorRubyDemo from '@/docs/examples/rich-text-editor/ruby'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-ruby',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorRubyDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorRuby',
        ],
        toolbar: ['EditorRubyToolbar'],
        bubble: ['EditorRubyToolbar'],
        content: '<p>Ruby annotations place a reading above the base text: <ruby>漢字<rt>かんじ</rt></ruby>.</p>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorRuby',
      description:
        'Registers the ruby text mark. The annotation is rendered above the base text in an rt element.',
      rows: [],
    },
    {
      name: 'EditorRubyToolbar',
      description:
        'Toolbar popover that sets, edits or removes the annotation of the selected base text.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
}
