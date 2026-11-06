import type { DocsPage } from '@/docs/types'
import EditorListDemo from '@/docs/examples/rich-text-editor/list'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-list',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorListDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorBulletList',
          'EditorOrderedList',
          'EditorTaskList',
        ],
        toolbar: ['EditorListToolbar'],
        content: '<ul><li><p>Bullet</p></li></ul><ol><li><p>Ordered</p></li></ol><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>Task</p></li></ul>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorBulletList',
      description: 'Registers the bullet list, its item node and the list keymap.',
      rows: [],
    },
    {
      name: 'EditorOrderedList',
      description: 'Registers the ordered list, its item node and the list keymap.',
      rows: [],
    },
    {
      name: 'EditorTaskList',
      description: 'Registers the task list and its checkable item, styled through the typeset task list rules.',
      rows: [],
    },
    {
      name: 'EditorListToolbar',
      description: 'Toolbar toggles for the bullet, ordered and task list nodes.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  note: 'A list node is only valid together with its item node, so each component registers both. Declaring two of them is safe: the shared item node and keymap are registered once.',
}
