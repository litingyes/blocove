import { useState } from 'react'
import {
  Editor,
  EditorBubbleMenu,
  EditorContent,
  EditorToolbar,
} from '@/registry/folio/ui/editor'
import { EditorCode, EditorCodeToolbar } from '@/registry/folio/ui/editor-code'
import { EditorHardBreak } from '@/registry/folio/ui/editor-hard-break'
import { EditorParagraph } from '@/registry/folio/ui/editor-paragraph'
import { EditorText } from '@/registry/folio/ui/editor-text'

const initialContent = [
  '<p>This paragraph contains <code>inline code</code> next to regular text.</p>',
  '<p>Use the mark for identifiers, commands and short snippets. Code blocks are a separate node.</p>',
].join('')

export default function EditorCodeDemo() {
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
      <EditorCode />
      <EditorToolbar>
        <EditorCodeToolbar />
      </EditorToolbar>
      <EditorBubbleMenu>
        <EditorCodeToolbar />
      </EditorBubbleMenu>
      <EditorContent className="min-h-40" />
    </Editor>
  )
}
