import type { DocsPage } from '@/docs/types'
import EditorTableDemo from '@/docs/examples/rich-text-editor/table'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-table',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorTableDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorTable',
        ],
        toolbar: ['EditorTableToolbar'],
        content: '<table><tbody><tr><th>Name</th><th>Value</th></tr><tr><td>A</td><td>1</td></tr></tbody></table>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorTable',
      description:
        'Registers the table kit (table, row, header and cell nodes). Options pass through to the kit.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<TableKitOptions>',
          default: '-',
        },
      ],
    },
    {
      name: 'EditorTableToolbar',
      description:
        'Table menu with insert, add/remove row and column, and delete table commands. Commands are disabled when the current selection cannot run them.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
}
