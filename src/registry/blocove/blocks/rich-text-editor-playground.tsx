import type { ReactNode } from 'react'
import { cn } from 'cn'
import { useState } from 'react'
import {
  EditorFocus,
  EditorGapcursor,
  EditorTrailingNode,
} from '@/components/blocove/rich-text-editor/behavior'
import { EditorBlockquote, EditorBlockquoteToolbar } from '@/components/blocove/rich-text-editor/blockquote'
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
import { EditorDragHandle } from '@/components/blocove/rich-text-editor/drag-handle'
import {
  Editor,
  EditorBubbleMenu,
  EditorCharacterCount,
  EditorContent,
  EditorFloatingMenu,
  EditorToolbar,
} from '@/components/blocove/rich-text-editor/editor'
import { EditorEmoji, EditorEmojiToolbar } from '@/components/blocove/rich-text-editor/emoji'
import { EditorFileHandler } from '@/components/blocove/rich-text-editor/file-handler'
import {
  EditorFindAndReplace,
  EditorFindAndReplaceToolbar,
} from '@/components/blocove/rich-text-editor/find-and-replace'
import { EditorHardBreak } from '@/components/blocove/rich-text-editor/hard-break'
import {
  EditorHeading,
  EditorHeadingToolbar,
} from '@/components/blocove/rich-text-editor/heading'
import {
  EditorHighlight,
  EditorHighlightToolbar,
} from '@/components/blocove/rich-text-editor/highlight'
import { EditorImage, EditorImageToolbar } from '@/components/blocove/rich-text-editor/image'
import {
  EditorInvisibleCharacters,
  EditorInvisibleCharactersToolbar,
} from '@/components/blocove/rich-text-editor/invisible-characters'
import { EditorItalic, EditorItalicToolbar } from '@/components/blocove/rich-text-editor/italic'
import { EditorLink, EditorLinkToolbar } from '@/components/blocove/rich-text-editor/link'
import {
  EditorBulletList,
  EditorListToolbar,
  EditorOrderedList,
  EditorTaskList,
} from '@/components/blocove/rich-text-editor/list'
import {
  EditorMathematics,
  EditorMathematicsToolbar,
} from '@/components/blocove/rich-text-editor/mathematics'
import { EditorMention } from '@/components/blocove/rich-text-editor/mention'
import { EditorParagraph } from '@/components/blocove/rich-text-editor/paragraph'
import { EditorRuby, EditorRubyToolbar } from '@/components/blocove/rich-text-editor/ruby'
import { EditorStrike, EditorStrikeToolbar } from '@/components/blocove/rich-text-editor/strike'
import {
  EditorSubscript,
  EditorSubscriptToolbar,
} from '@/components/blocove/rich-text-editor/subscript'
import {
  EditorSuperscript,
  EditorSuperscriptToolbar,
} from '@/components/blocove/rich-text-editor/superscript'
import { EditorTable, EditorTableToolbar } from '@/components/blocove/rich-text-editor/table'
import { EditorText } from '@/components/blocove/rich-text-editor/text'
import {
  EditorBackgroundColor,
  EditorColor,
  EditorFontFamily,
  EditorFontSize,
  EditorLineHeight,
  EditorTextStyle,
  EditorTextStyleToolbar,
} from '@/components/blocove/rich-text-editor/text-style'
import { EditorTypography } from '@/components/blocove/rich-text-editor/typography'
import {
  EditorUnderline,
  EditorUnderlineToolbar,
} from '@/components/blocove/rich-text-editor/underline'

/**
 * A complete editor: every node, every mark, every control. The image is an
 * inline SVG so the default document is self-contained.
 *
 * The unique id extension stays out of this block on purpose: it writes an
 * attribute to every block on load, which a controlled editor would echo back
 * through `onChange` before the first edit. Install it as its own item when a
 * document needs stable block ids.
 */
const defaultContent = [
  '<h2>Composable rich text editor</h2>',
  '<p>Blocove ships the editor as small Tiptap components. This block composes every node and mark into one editor; the shell, the nodes and the marks stay separate registry items you can install on their own.</p>',
  '<p>This document shows <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s>, <code>inline code</code>, <mark>highlight</mark>, H<sub>2</sub>O, E = mc<sup>2</sup>, a <ruby>漢字<rt>かんじ</rt></ruby> annotation and a <a href="https://ui.shadcn.com/docs/typeset">link</a>.</p>',
  '<p>Hard breaks keep two lines inside one block.<br>Press Shift + Enter to add one.</p>',
  '<blockquote><p>Blockquotes set a passage apart from the body of the document.</p></blockquote>',
  '<ul><li><p>Unordered item</p></li><li><p>Another item</p></li></ul>',
  '<ol><li><p>First step</p></li><li><p>Second step</p></li></ol>',
  '<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>Shipped the component</p></li><li data-type="taskItem" data-checked="false"><p>Write the docs</p></li></ul>',
  '<h3>Code block</h3>',
  '<pre><code>const editor = createEditor({ extensions: [Text, Paragraph, Heading] })</code></pre>',
  '<h3>Details</h3>',
  '<details open><summary>What is Tiptap?</summary><div data-type="detailsContent"><p>Tiptap is a headless editor framework built on ProseMirror. Blocove wraps its extensions as composable components.</p></div></details>',
  '<h3>Image</h3>',
  '<p>Images are block nodes in the document.</p>',
  '<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMTgwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjE4MCIgcng9IjEyIiBmaWxsPSIjZTVlNWU1Ii8+PHRleHQgeD0iMjAwIiB5PSI5OCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM3MzczNzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkltYWdlIG5vZGU8L3RleHQ+PC9zdmc+" alt="Image node example">',
  '<h3>Table</h3>',
  '<table><tbody><tr><th>Item</th><th>Type</th></tr><tr><td>rich-text-editor</td><td>registry:ui</td></tr><tr><td>rich-text-editor-playground</td><td>registry:block</td></tr></tbody></table>',
  '<h3>Emoji, math and mentions</h3>',
  '<p>Inline nodes flow with the text: <span data-type="emoji" data-name="sparkles"></span>, <span data-type="inline-math" data-latex="E = mc^2"></span> and <span data-type="mention" data-id="ada" data-label="Ada Lovelace"></span>.</p>',
  '<div data-type="block-math" data-latex="\\sum_{i=1}^{n} x_i = X"></div>',
  '<p>The character count below the editor updates as you type, and the input rules turn "--" into an em dash.</p>',
].join('')

const defaultUsers = [
  { id: 'ada', label: 'Ada Lovelace' },
  { id: 'alan', label: 'Alan Turing' },
  { id: 'grace', label: 'Grace Hopper' },
]

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

function ToolbarGroup({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {children}
    </div>
  )
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
      <EditorBlockquote />
      <EditorBulletList />
      <EditorOrderedList />
      <EditorTaskList />
      <EditorEmoji />
      <EditorMathematics />
      <EditorMention users={defaultUsers} />

      <EditorBold />
      <EditorItalic />
      <EditorUnderline />
      <EditorStrike />
      <EditorCode />
      <EditorLink />
      <EditorHighlight />
      <EditorRuby />
      <EditorSubscript />
      <EditorSuperscript />
      <EditorTextStyle />
      <EditorColor />
      <EditorBackgroundColor />
      <EditorFontFamily />
      <EditorFontSize />
      <EditorLineHeight />

      <EditorFocus />
      <EditorTrailingNode />
      <EditorGapcursor />
      <EditorTypography />
      <EditorInvisibleCharacters />
      <EditorFindAndReplace />
      <EditorFileHandler />

      <EditorDragHandle />

      <EditorToolbar>
        <ToolbarGroup>
          <EditorHeadingToolbar />
        </ToolbarGroup>
        <ToolbarGroup>
          <EditorBlockquoteToolbar />
          <EditorListToolbar />
        </ToolbarGroup>
        <ToolbarGroup>
          <EditorBoldToolbar />
          <EditorItalicToolbar />
          <EditorUnderlineToolbar />
          <EditorStrikeToolbar />
          <EditorCodeToolbar />
          <EditorHighlightToolbar />
          <EditorSubscriptToolbar />
          <EditorSuperscriptToolbar />
          <EditorRubyToolbar />
          <EditorLinkToolbar />
        </ToolbarGroup>
        <ToolbarGroup>
          <EditorTextStyleToolbar />
        </ToolbarGroup>
        <ToolbarGroup>
          <EditorEmojiToolbar />
          <EditorMathematicsToolbar />
          <EditorImageToolbar />
          <EditorTableToolbar />
          <EditorDetailsToolbar />
          <EditorCodeBlockToolbar />
        </ToolbarGroup>
        <ToolbarGroup>
          <EditorInvisibleCharactersToolbar />
          <EditorFindAndReplaceToolbar />
        </ToolbarGroup>
      </EditorToolbar>

      <EditorFloatingMenu>
        <EditorBlockquoteToolbar />
        <EditorListToolbar />
        <EditorEmojiToolbar />
      </EditorFloatingMenu>

      <EditorBubbleMenu>
        <EditorBoldToolbar />
        <EditorItalicToolbar />
        <EditorUnderlineToolbar />
        <EditorStrikeToolbar />
        <EditorCodeToolbar />
        <EditorHighlightToolbar />
        <EditorSubscriptToolbar />
        <EditorSuperscriptToolbar />
        <EditorLinkToolbar />
      </EditorBubbleMenu>

      <EditorContent className="min-h-64" />

      <EditorCharacterCount format="both" />
    </Editor>
  )
}
