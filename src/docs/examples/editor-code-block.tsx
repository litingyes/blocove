import { useState } from 'react'
import {
  Editor,
  EditorContent,
  EditorToolbar,
} from '@/registry/blocove/ui/editor'
import {
  EditorCodeBlock,
  EditorCodeBlockToolbar,
} from '@/registry/blocove/ui/editor-code-block'
import { EditorHardBreak } from '@/registry/blocove/ui/editor-hard-break'
import { EditorParagraph } from '@/registry/blocove/ui/editor-paragraph'
import { EditorText } from '@/registry/blocove/ui/editor-text'

const initialContent = [
  '<p>Code blocks keep preformatted content inside the document.</p>',
  '<pre><code>const editor = createEditor({ extensions: [Text, Paragraph] })</code></pre>',
  '<p>Place the caret in a paragraph and use the toolbar to toggle a code block.</p>',
].join('')

export default function EditorCodeBlockDemo() {
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
      <EditorCodeBlock />
      <EditorToolbar>
        <EditorCodeBlockToolbar />
      </EditorToolbar>
      <EditorContent className="min-h-40" />
    </Editor>
  )
}
