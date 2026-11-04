import type { DocsPageData } from '@/docs/types'
import EditorTableDemo from '@/docs/examples/editor-table'
import editorTableCode from '@/docs/examples/editor-table?raw'

const usage = `import { Editor, EditorContent, EditorToolbar } from "@/components/ui/editor"
import { EditorText } from "@/components/ui/editor-text"
import { EditorParagraph } from "@/components/ui/editor-paragraph"
import { EditorHardBreak } from "@/components/ui/editor-hard-break"
import { EditorTable, EditorTableToolbar } from "@/components/ui/editor-table"

export function Example() {
  return (
    <Editor defaultValue={'<table><tbody><tr><th>Name</th><th>Value</th></tr><tr><td>A</td><td>1</td></tr></tbody></table>'}>
      <EditorText />
      <EditorParagraph />
      <EditorHardBreak />
      <EditorTable />
      <EditorToolbar>
        <EditorTableToolbar />
      </EditorToolbar>
      <EditorContent className="min-h-40" />
    </Editor>
  )
}`

export const tableDocs: DocsPageData = {
  examples: [
    {
      title: 'Default',
      component: EditorTableDemo,
      code: editorTableCode,
    },
  ],
  usage: [
    { title: 'Usage', code: usage, language: 'tsx' },
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
  requiresTypeset: true,
}
