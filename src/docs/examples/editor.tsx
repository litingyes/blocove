import { useState } from 'react'
import {
  Editor,
  EditorBubbleMenu,
  EditorCharacterCount,
  EditorContent,
  EditorToolbar,
} from '@/registry/blocove/ui/editor'
import { EditorBold, EditorBoldToolbar } from '@/registry/blocove/ui/editor-bold'
import { EditorCode, EditorCodeToolbar } from '@/registry/blocove/ui/editor-code'
import {
  EditorCodeBlock,
  EditorCodeBlockToolbar,
} from '@/registry/blocove/ui/editor-code-block'
import {
  EditorHardBreak,
} from '@/registry/blocove/ui/editor-hard-break'
import {
  EditorHeading,
  EditorHeadingToolbar,
} from '@/registry/blocove/ui/editor-heading'
import {
  EditorItalic,
  EditorItalicToolbar,
} from '@/registry/blocove/ui/editor-italic'
import { EditorLink, EditorLinkToolbar } from '@/registry/blocove/ui/editor-link'
import {
  EditorParagraph,
} from '@/registry/blocove/ui/editor-paragraph'
import {
  EditorStrike,
  EditorStrikeToolbar,
} from '@/registry/blocove/ui/editor-strike'
import { EditorText } from '@/registry/blocove/ui/editor-text'
import {
  EditorUnderline,
  EditorUnderlineToolbar,
} from '@/registry/blocove/ui/editor-underline'

const initialContent = [
  '<h2>Composable by design</h2>',
  '<p>Blocove ships the editor as small Tiptap components. Compose the ones you need and keep the rest out of your bundle.</p>',
  '<p>Try <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s>, <code>inline code</code> and a <a href="https://ui.shadcn.com/docs/typeset">link</a>.</p>',
  '<p>Select some text to open the bubble menu.</p>',
].join('')

export default function EditorDemo() {
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
      <EditorBold />
      <EditorItalic />
      <EditorUnderline />
      <EditorStrike />
      <EditorCode />
      <EditorLink />
      <EditorCodeBlock />

      <EditorToolbar>
        <EditorHeadingToolbar />
        <EditorBoldToolbar />
        <EditorItalicToolbar />
        <EditorUnderlineToolbar />
        <EditorStrikeToolbar />
        <EditorCodeToolbar />
        <EditorCodeBlockToolbar />
        <EditorLinkToolbar />
      </EditorToolbar>

      <EditorBubbleMenu>
        <EditorBoldToolbar />
        <EditorItalicToolbar />
        <EditorUnderlineToolbar />
        <EditorStrikeToolbar />
        <EditorCodeToolbar />
      </EditorBubbleMenu>

      <EditorContent className="min-h-40" />
      <EditorCharacterCount />
    </Editor>
  )
}
