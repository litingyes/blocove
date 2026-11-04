import { useState } from 'react'
import {
  Editor,
  EditorBubbleMenu,
  EditorCharacterCount,
  EditorContent,
  EditorToolbar,
} from '@/registry/folio/ui/editor'
import { EditorBold, EditorBoldToolbar } from '@/registry/folio/ui/editor-bold'
import { EditorCode, EditorCodeToolbar } from '@/registry/folio/ui/editor-code'
import {
  EditorCodeBlock,
  EditorCodeBlockToolbar,
} from '@/registry/folio/ui/editor-code-block'
import {
  EditorHardBreak,
} from '@/registry/folio/ui/editor-hard-break'
import {
  EditorHeading,
  EditorHeadingToolbar,
} from '@/registry/folio/ui/editor-heading'
import {
  EditorItalic,
  EditorItalicToolbar,
} from '@/registry/folio/ui/editor-italic'
import { EditorLink, EditorLinkToolbar } from '@/registry/folio/ui/editor-link'
import {
  EditorParagraph,
} from '@/registry/folio/ui/editor-paragraph'
import {
  EditorStrike,
  EditorStrikeToolbar,
} from '@/registry/folio/ui/editor-strike'
import { EditorText } from '@/registry/folio/ui/editor-text'
import {
  EditorUnderline,
  EditorUnderlineToolbar,
} from '@/registry/folio/ui/editor-underline'

const initialContent = [
  '<h2>Composable by design</h2>',
  '<p>Folio ships the editor as small Tiptap components. Compose the ones you need and keep the rest out of your bundle.</p>',
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
