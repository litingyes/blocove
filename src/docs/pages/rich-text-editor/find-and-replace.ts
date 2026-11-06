import type { DocsPage } from '@/docs/types'
import EditorFindAndReplaceDemo from '@/docs/examples/rich-text-editor/find-and-replace'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-find-and-replace',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorFindAndReplaceDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorFindAndReplace',
        ],
        toolbar: ['EditorFindAndReplaceToolbar'],
        content: '<p>Search inside this document.</p>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorFindAndReplace',
      description: 'Registers the search plugin and its commands. Options pass through to the extension.',
      rows: [
        { prop: 'searchTerm', type: 'string', default: '""' },
        { prop: 'replaceTerm', type: 'string', default: '""' },
        { prop: 'caseSensitive', type: 'boolean', default: 'false' },
        { prop: 'useRegex', type: 'boolean', default: 'false' },
        { prop: 'wholeWord', type: 'boolean', default: 'false' },
        { prop: 'searchDebounceMs', type: 'number', default: '250' },
      ],
    },
    {
      name: 'EditorFindAndReplaceToolbar',
      description: 'Popover with the search field, the replacement field, the result counter and the navigation and replace actions.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  note: 'The search field waits for the input method to commit before it searches, so composing a character never moves the highlights mid-word.',
}
