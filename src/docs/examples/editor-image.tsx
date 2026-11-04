import { useState } from 'react'
import {
  Editor,
  EditorContent,
  EditorToolbar,
} from '@/registry/folio/ui/editor'
import { EditorHardBreak } from '@/registry/folio/ui/editor-hard-break'
import {
  EditorImage,
  EditorImageToolbar,
} from '@/registry/folio/ui/editor-image'
import { EditorParagraph } from '@/registry/folio/ui/editor-paragraph'
import { EditorText } from '@/registry/folio/ui/editor-text'

const initialContent = [
  '<p>Images are block nodes in the document.</p>',
  '<img src="/editor-image.svg" alt="Folio editor example">',
  '<p>Use the toolbar to insert an image by URL. Selecting an image pre-fills its current source.</p>',
].join('')

export default function EditorImageDemo() {
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
      <EditorImage />
      <EditorToolbar>
        <EditorImageToolbar />
      </EditorToolbar>
      <EditorContent className="min-h-40" />
    </Editor>
  )
}
