import { useState } from 'react'
import {
  Editor,
  EditorBubbleMenu,
  EditorContent,
  EditorToolbar,
} from '@/registry/blocove/ui/editor'
import { EditorBold, EditorBoldToolbar } from '@/registry/blocove/ui/editor-bold'
import { EditorHardBreak } from '@/registry/blocove/ui/editor-hard-break'
import { EditorParagraph } from '@/registry/blocove/ui/editor-paragraph'
import { EditorText } from '@/registry/blocove/ui/editor-text'

const initialContent = [
  '<p>This paragraph contains <strong>bold text</strong> next to regular text.</p>',
  '<p>Select a word and use the toolbar or the bubble menu to toggle the mark.</p>',
].join('')

export default function EditorBoldDemo() {
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
      <EditorBold />
      <EditorToolbar>
        <EditorBoldToolbar />
      </EditorToolbar>
      <EditorBubbleMenu>
        <EditorBoldToolbar />
      </EditorBubbleMenu>
      <EditorContent className="min-h-40" />
    </Editor>
  )
}
