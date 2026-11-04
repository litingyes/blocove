import { useState } from 'react'
import {
  Editor,
  EditorBubbleMenu,
  EditorContent,
  EditorToolbar,
} from '@/registry/folio/ui/editor'
import { EditorHardBreak } from '@/registry/folio/ui/editor-hard-break'
import {
  EditorItalic,
  EditorItalicToolbar,
} from '@/registry/folio/ui/editor-italic'
import { EditorParagraph } from '@/registry/folio/ui/editor-paragraph'
import { EditorText } from '@/registry/folio/ui/editor-text'

const initialContent = [
  '<p>This paragraph contains <em>italic text</em> next to regular text.</p>',
  '<p>Select a word and use the toolbar or the bubble menu to toggle the mark.</p>',
].join('')

export default function EditorItalicDemo() {
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
      <EditorItalic />
      <EditorToolbar>
        <EditorItalicToolbar />
      </EditorToolbar>
      <EditorBubbleMenu>
        <EditorItalicToolbar />
      </EditorBubbleMenu>
      <EditorContent className="min-h-40" />
    </Editor>
  )
}
