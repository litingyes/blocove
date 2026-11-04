import { useState } from 'react'
import {
  Editor,
  EditorContent,
  EditorToolbar,
} from '@/registry/folio/ui/editor'
import { EditorHardBreak } from '@/registry/folio/ui/editor-hard-break'
import { EditorParagraph } from '@/registry/folio/ui/editor-paragraph'
import {
  EditorTable,
  EditorTableToolbar,
} from '@/registry/folio/ui/editor-table'
import { EditorText } from '@/registry/folio/ui/editor-text'

const initialContent = [
  '<p>Tables are rendered as native table elements and styled by typeset.</p>',
  '<table><tbody><tr><th>Component</th><th>Package</th></tr><tr><td>Editor</td><td>@tiptap/react</td></tr><tr><td>Table</td><td>@tiptap/extension-table</td></tr><tr><td>Placeholder</td><td>@tiptap/extensions</td></tr></tbody></table>',
  '<p>Use the table menu to insert a 3×3 table and add or remove rows and columns.</p>',
].join('')

export default function EditorTableDemo() {
  const [value, setValue] = useState(initialContent)

  return (
    <Editor
      value={value}
      onChange={setValue}
      placeholder="Start writing…"
      className="w-full max-w-2xl"
    >
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
}
