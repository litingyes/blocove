import { useState } from 'react'
import {
  Editor,
  EditorBubbleMenu,
  EditorContent,
  EditorToolbar,
} from '@/registry/blocove/ui/editor'
import { EditorHardBreak } from '@/registry/blocove/ui/editor-hard-break'
import { EditorParagraph } from '@/registry/blocove/ui/editor-paragraph'
import {
  EditorStrike,
  EditorStrikeToolbar,
} from '@/registry/blocove/ui/editor-strike'
import { EditorText } from '@/registry/blocove/ui/editor-text'

const initialContent = [
  '<p>This paragraph contains <s>struck text</s> next to regular text.</p>',
  '<p>Select a word and use the toolbar or the bubble menu to toggle the mark.</p>',
].join('')

export default function EditorStrikeDemo() {
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
      <EditorStrike />
      <EditorToolbar>
        <EditorStrikeToolbar />
      </EditorToolbar>
      <EditorBubbleMenu>
        <EditorStrikeToolbar />
      </EditorBubbleMenu>
      <EditorContent className="min-h-40" />
    </Editor>
  )
}
