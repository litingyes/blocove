import { useState } from 'react'
import {
  Editor,
  EditorContent,
  EditorToolbar,
} from '@/registry/folio/ui/editor'
import {
  EditorDetails,
  EditorDetailsToolbar,
} from '@/registry/folio/ui/editor-details'
import { EditorHardBreak } from '@/registry/folio/ui/editor-hard-break'
import { EditorParagraph } from '@/registry/folio/ui/editor-paragraph'
import { EditorText } from '@/registry/folio/ui/editor-text'

const initialContent = [
  '<details open><summary>What is Tiptap?</summary><div data-type="detailsContent"><p>Tiptap is a headless editor framework built on ProseMirror. Folio wraps its extensions as composable components.</p></div></details>',
  '<p>Details blocks collapse long content. Click the chevron to toggle the block, or insert a new one from the toolbar.</p>',
].join('')

export default function EditorDetailsDemo() {
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
      <EditorDetails />
      <EditorToolbar>
        <EditorDetailsToolbar />
      </EditorToolbar>
      <EditorContent className="min-h-40" />
    </Editor>
  )
}
