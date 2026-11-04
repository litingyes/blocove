import { useState } from 'react'
import {
  Editor,
  EditorContent,
  EditorToolbar,
} from '@/registry/blocove/ui/editor'
import { EditorHardBreak } from '@/registry/blocove/ui/editor-hard-break'
import {
  EditorHeading,
  EditorHeadingToolbar,
} from '@/registry/blocove/ui/editor-heading'
import { EditorParagraph } from '@/registry/blocove/ui/editor-paragraph'
import { EditorText } from '@/registry/blocove/ui/editor-text'

const initialContent = [
  '<h1>Heading 1</h1>',
  '<h2>Heading 2</h2>',
  '<h3>Heading 3</h3>',
  '<p>Headings anchor the document and are styled by typeset. Place the caret in any block and pick a level from the toolbar.</p>',
].join('')

export default function EditorHeadingDemo() {
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
      <EditorHeading />
      <EditorToolbar>
        <EditorHeadingToolbar />
      </EditorToolbar>
      <EditorContent className="min-h-40" />
    </Editor>
  )
}
