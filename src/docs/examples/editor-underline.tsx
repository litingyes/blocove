import { useState } from 'react'
import {
  Editor,
  EditorBubbleMenu,
  EditorContent,
  EditorToolbar,
} from '@/registry/folio/ui/editor'
import { EditorHardBreak } from '@/registry/folio/ui/editor-hard-break'
import { EditorParagraph } from '@/registry/folio/ui/editor-paragraph'
import { EditorText } from '@/registry/folio/ui/editor-text'
import {
  EditorUnderline,
  EditorUnderlineToolbar,
} from '@/registry/folio/ui/editor-underline'

const initialContent = [
  '<p>This paragraph contains <u>underlined text</u> next to regular text.</p>',
  '<p>Select a word and use the toolbar or the bubble menu to toggle the mark.</p>',
].join('')

export default function EditorUnderlineDemo() {
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
      <EditorUnderline />
      <EditorToolbar>
        <EditorUnderlineToolbar />
      </EditorToolbar>
      <EditorBubbleMenu>
        <EditorUnderlineToolbar />
      </EditorBubbleMenu>
      <EditorContent className="min-h-40" />
    </Editor>
  )
}
