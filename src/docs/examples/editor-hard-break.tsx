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
  '<p>Hard breaks keep two lines inside the same block.<br>Press Shift + Enter at the end of a line to insert one.</p>',
  '<p>Use hard breaks for addresses, lyrics and short lines.<br>Each line keeps the paragraph attributes, including alignment.</p>',
].join('')

export default function EditorHardBreakDemo() {
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
