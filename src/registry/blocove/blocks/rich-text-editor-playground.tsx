import { cn } from 'cn'
import { useState } from 'react'
import { EditorBold, EditorBoldToolbar } from '@/components/blocove/rich-text-editor/bold'
import { EditorCode, EditorCodeToolbar } from '@/components/blocove/rich-text-editor/code'
import {
  EditorCodeBlock,
  EditorCodeBlockToolbar,
} from '@/components/blocove/rich-text-editor/code-block'
import {
  EditorDetails,
  EditorDetailsToolbar,
} from '@/components/blocove/rich-text-editor/details'
import {
  Editor,
  EditorBubbleMenu,
  EditorCharacterCount,
  EditorContent,
  EditorToolbar,
} from '@/components/blocove/rich-text-editor/editor'
import { EditorHardBreak } from '@/components/blocove/rich-text-editor/hard-break'
import {
  EditorHeading,
  EditorHeadingToolbar,
} from '@/components/blocove/rich-text-editor/heading'
import { EditorImage, EditorImageToolbar } from '@/components/blocove/rich-text-editor/image'
import { EditorItalic, EditorItalicToolbar } from '@/components/blocove/rich-text-editor/italic'
import { EditorLink, EditorLinkToolbar } from '@/components/blocove/rich-text-editor/link'
import { EditorParagraph } from '@/components/blocove/rich-text-editor/paragraph'
import { EditorStrike, EditorStrikeToolbar } from '@/components/blocove/rich-text-editor/strike'
import { EditorTable, EditorTableToolbar } from '@/components/blocove/rich-text-editor/table'
import { EditorText } from '@/components/blocove/rich-text-editor/text'
import {
  EditorUnderline,
  EditorUnderlineToolbar,
} from '@/components/blocove/rich-text-editor/underline'

/**
 * A complete editor: every node, every mark, the toolbar, the bubble menu and
 * the character count. The image is an inline SVG so the default document is
 * self-contained.
 */
const defaultContent = [
  '<h2>Composable rich text editor</h2>',
  '<p>Blocove ships the editor as small Tiptap components. This block composes every node and mark into one editor; the shell, the nodes and the marks stay separate registry items you can install on their own.</p>',
  '<p>This document shows <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s>, <code>inline code</code> and a <a href="https://ui.shadcn.com/docs/typeset">link</a>.</p>',
  '<p>Hard breaks keep two lines inside one block.<br>Press Shift + Enter to add one.</p>',
  '<h3>Code block</h3>',
  '<pre><code>const editor = createEditor({ extensions: [Text, Paragraph, Heading] })</code></pre>',
  '<h3>Details</h3>',
  '<details open><summary>What is Tiptap?</summary><div data-type="detailsContent"><p>Tiptap is a headless editor framework built on ProseMirror. Blocove wraps its extensions as composable components.</p></div></details>',
  '<h3>Image</h3>',
  '<p>Images are block nodes in the document.</p>',
  '<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMTgwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjE4MCIgcng9IjEyIiBmaWxsPSIjZTVlNWU1Ii8+PHRleHQgeD0iMjAwIiB5PSI5OCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM3MzczNzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIG5vZGU8L3RleHQ+PC9zdmc+" alt="Image node example">',
  '<h3>Table</h3>',
  '<table><tbody><tr><th>Item</th><th>Type</th></tr><tr><td>rich-text-editor</td><td>registry:ui</td></tr><tr><td>rich-text-editor-playground</td><td>registry:block</td></tr></tbody></table>',
  '<p>The character count below the editor updates as you type.</p>',
].join('')

export interface RichTextEditorPlaygroundProps {
  /** Initial HTML document. Replace it with the content your app edits. */
  defaultValue?: string
  /** Placeholder shown while the document is empty. */
  placeholder?: string
  /** Maximum character count, enforced by the character count extension. */
  characterLimit?: number
  /** Called with the new HTML whenever the document changes. */
  onChange?: (html: string) => void
  className?: string
}

/**
 * A ready-to-use rich text editor with the full Blocove extension set.
 */
export function RichTextEditorPlayground({
  defaultValue = defaultContent,
  placeholder = 'Start writing…',
  characterLimit,
  onChange,
  className,
}: RichTextEditorPlaygroundProps) {
  const [value, setValue] = useState(defaultValue)

  return (
    <Editor
      value={value}
      onChange={(html) => {
        setValue(html)
        onChange?.(html)
      }}
      placeholder={placeholder}
      characterLimit={characterLimit}
      className={cn('w-full max-w-3xl', className)}
    >
      <EditorText />
      <EditorParagraph />
      <EditorHardBreak />
      <EditorHeading />
      <EditorCodeBlock />
      <EditorDetails />
      <EditorImage allowBase64 />
      <EditorTable />
      <EditorBold />
      <EditorItalic />
      <EditorUnderline />
      <EditorStrike />
      <EditorCode />
      <EditorLink />

      <EditorToolbar>
        <EditorHeadingToolbar />
        <EditorBoldToolbar />
        <EditorItalicToolbar />
        <EditorUnderlineToolbar />
        <EditorStrikeToolbar />
        <EditorCodeToolbar />
        <EditorCodeBlockToolbar />
        <EditorLinkToolbar />
        <EditorDetailsToolbar />
        <EditorImageToolbar />
        <EditorTableToolbar />
      </EditorToolbar>

      <EditorBubbleMenu>
        <EditorBoldToolbar />
        <EditorItalicToolbar />
        <EditorUnderlineToolbar />
        <EditorStrikeToolbar />
        <EditorCodeToolbar />
        <EditorLinkToolbar />
      </EditorBubbleMenu>

      <EditorContent className="min-h-64" />

      <EditorCharacterCount format="both" />
    </Editor>
  )
}
