import { useState } from 'react'
import {
  Editor,
  EditorContent,
  EditorToolbar,
} from '@/registry/folio/ui/editor'
import { EditorHardBreak } from '@/registry/folio/ui/editor-hard-break'
import { EditorParagraph } from '@/registry/folio/ui/editor-paragraph'
import { EditorText } from '@/registry/folio/ui/editor-text'

const initialContent = [
  '<p>Paragraphs are the default block. The node splits on Enter, merges on Backspace and owns the block attributes of the document.</p>',
  '<p>Every paragraph carries its own alignment. Place the caret in a block and use the alignment controls in the toolbar.</p>',
  '<p>Because the paragraph is declared as a component, you can pass HTML attributes such as a shared class for the reading rhythm.</p>',
].join('')

export default function EditorParagraphDemo() {
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
