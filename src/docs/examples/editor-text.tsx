import { useState } from 'react'
import {
  Editor,
  EditorContent,
  EditorToolbar,
} from '@/registry/blocove/ui/editor'
import { EditorHardBreak } from '@/registry/blocove/ui/editor-hard-break'
import { EditorParagraph } from '@/registry/blocove/ui/editor-paragraph'
import { EditorText } from '@/registry/blocove/ui/editor-text'

const initialContent = [
  '<p>Text is the leaf node every editor document is built from. Marks and inline content live inside it.</p>',
  '<p>Blocove keeps extensions explicit: register the text node, then add only the nodes and marks you compose.</p>',
  '<p>This demo wires the text node next to paragraphs and hard breaks. The toolbar still works because the base editor owns history and alignment.</p>',
].join('')

export default function EditorTextDemo() {
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
      <EditorToolbar />
      <EditorContent className="min-h-40" />
    </Editor>
  )
}
