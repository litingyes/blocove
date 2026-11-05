import type { Editor as TiptapEditor } from '@tiptap/react'
import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { useState } from 'react'
import {
  Editor,
  EditorBubbleMenu,
  EditorCharacterCount,
  EditorContent,
  EditorToolbar,
} from '@/components/blocove/rich-text-editor/editor'
import { EditorHardBreak } from '@/components/blocove/rich-text-editor/hard-break'
import { EditorParagraph } from '@/components/blocove/rich-text-editor/paragraph'
import { EditorText } from '@/components/blocove/rich-text-editor/text'

export interface RenderRichTextEditorOptions {
  /** Initial HTML document. */
  content?: string
  /** Include the text, paragraph and hard break nodes (default true). */
  basicNodes?: boolean
  /** Extra extension declarations appended after the basic nodes. */
  extensions?: ReactNode
  /** Toolbar controls; `false` omits the toolbar. */
  toolbar?: ReactNode | false
  /** Bubble menu controls; the bubble menu is omitted when not provided. */
  bubble?: ReactNode
  /** Render the character counter in the given format. */
  characterCount?: 'characters' | 'words' | 'both'
  characterLimit?: number
  editable?: boolean
  placeholder?: string
  autoFocus?: boolean
  /** Disable the shadcn/typeset classes on the editable surface. */
  typeset?: boolean
  onChange?: (html: string) => void
  onReady?: (editor: TiptapEditor) => void
}

export interface RenderedRichTextEditor {
  editor: TiptapEditor
  container: HTMLElement
  /** Serialized document HTML, read from the editor instance. */
  html: () => string
  unmount: () => void
}

function RichTextEditorTestFrame({
  content,
  basicNodes,
  extensions,
  toolbar,
  bubble,
  characterCount,
  characterLimit,
  editable,
  placeholder,
  autoFocus,
  typeset,
  onChange,
  onReady,
}: Required<Pick<RenderRichTextEditorOptions, 'content'>> & RenderRichTextEditorOptions) {
  const [value, setValue] = useState(content)

  return (
    <Editor
      value={value}
      onChange={(html) => {
        setValue(html)
        onChange?.(html)
      }}
      onReady={onReady}
      placeholder={placeholder}
      editable={editable}
      autoFocus={autoFocus}
      characterLimit={characterLimit}
    >
      {basicNodes === false
        ? null
        : (
            <>
              <EditorText />
              <EditorParagraph />
              <EditorHardBreak />
            </>
          )}
      {extensions}
      {toolbar === false
        ? null
        : <EditorToolbar>{toolbar}</EditorToolbar>}
      {bubble
        ? <EditorBubbleMenu>{bubble}</EditorBubbleMenu>
        : null}
      <EditorContent typeset={typeset} />
      {characterCount
        ? <EditorCharacterCount format={characterCount} />
        : null}
    </Editor>
  )
}

/**
 * Renders the rich text editor shell the docs use, with the controlled value
 * wired up, and resolves once the Tiptap editor instance exists.
 */
export async function renderRichTextEditor(
  options: RenderRichTextEditorOptions = {},
): Promise<RenderedRichTextEditor> {
  let resolveEditor!: (editor: TiptapEditor) => void
  const editorReady = new Promise<TiptapEditor>((resolve) => {
    resolveEditor = resolve
  })

  const { container, unmount } = render(
    <RichTextEditorTestFrame
      content={options.content ?? '<p>Hello world</p>'}
      {...options}
      onReady={(editor) => {
        resolveEditor(editor)
        options.onReady?.(editor)
      }}
    />,
  )

  const editor = await editorReady

  return {
    editor,
    container,
    html: () => editor.getHTML(),
    unmount,
  }
}
