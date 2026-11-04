import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  Editor,
  EditorBubbleMenu,
  EditorCharacterCount,
  EditorContent,
  EditorToolbar,
} from '@/registry/blocove/ui/rich-text-editor/editor'
import { EditorHardBreak } from '@/registry/blocove/ui/rich-text-editor/hard-break'
import { EditorParagraph } from '@/registry/blocove/ui/rich-text-editor/paragraph'
import { EditorText } from '@/registry/blocove/ui/rich-text-editor/text'

export interface RichTextEditorDemoFrameProps {
  /** Initial HTML document. */
  content: string
  /** Extra extension declarations, appended after the basic nodes. */
  extensions?: ReactNode
  /** Toolbar controls. Defaults to the toolbar without extra controls. */
  toolbar?: ReactNode | false
  /** Bubble menu controls. The bubble menu is omitted when not provided. */
  bubble?: ReactNode
  /** Render the character counter. */
  characterCount?: 'characters' | 'words' | 'both'
}

/**
 * Shared preview shell for the rich text editor demos: the basic nodes, the
 * controlled state and the standard layout. Item demos only add their own
 * extension, toolbar control and bubble menu control.
 */
export function RichTextEditorDemoFrame({
  content,
  extensions,
  toolbar,
  bubble,
  characterCount,
}: RichTextEditorDemoFrameProps) {
  const [value, setValue] = useState(content)

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
      {extensions}

      {toolbar === false
        ? null
        : <EditorToolbar>{toolbar}</EditorToolbar>}

      {bubble
        ? <EditorBubbleMenu>{bubble}</EditorBubbleMenu>
        : null}

      <EditorContent className="min-h-40" />

      {characterCount
        ? <EditorCharacterCount format={characterCount} />
        : null}
    </Editor>
  )
}
