import { useState } from 'react'
import {
  Editor,
  EditorBubbleMenu,
  EditorContent,
  EditorToolbar,
} from '@/registry/folio/ui/editor'
import { EditorHardBreak } from '@/registry/folio/ui/editor-hard-break'
import { EditorLink, EditorLinkToolbar } from '@/registry/folio/ui/editor-link'
import { EditorParagraph } from '@/registry/folio/ui/editor-paragraph'
import { EditorText } from '@/registry/folio/ui/editor-text'

const initialContent = [
  '<p>This paragraph contains a <a href="https://ui.shadcn.com">link</a> next to regular text.</p>',
  '<p>Select a word and use the toolbar to add, replace or remove its URL.</p>',
].join('')

export default function EditorLinkDemo() {
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
      <EditorLink />
      <EditorToolbar>
        <EditorLinkToolbar />
      </EditorToolbar>
      <EditorBubbleMenu>
        <EditorLinkToolbar />
      </EditorBubbleMenu>
      <EditorContent className="min-h-40" />
    </Editor>
  )
}
