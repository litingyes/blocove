import type { EditorView } from '@codemirror/view'
import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { useState } from 'react'
import {
  CodeEditor,
  CodeEditorContent,
  CodeEditorStatusBar,
  CodeEditorToolbar,
} from '@/components/blocove/code-editor/editor'

export interface RenderCodeEditorOptions {
  /** Initial document. */
  content?: string
  /** Language shared by the extension declarations and the status bar. */
  language?: string
  /** Extension declarations, in registration order. */
  extensions?: ReactNode
  /** Render the toolbar. */
  toolbar?: boolean
  /** Controls rendered inside the toolbar. */
  toolbarActions?: ReactNode
  /** Render the status bar. */
  statusBar?: boolean
  readOnly?: boolean
  editable?: boolean
  lineWrapping?: boolean
  onLineWrappingChange?: (lineWrapping: boolean) => void
  placeholder?: string
  autoFocus?: boolean
  onChange?: (value: string) => void
  onReady?: (view: EditorView) => void
}

export interface RenderedCodeEditor {
  view: EditorView
  container: HTMLElement
  /** Serialized document, read from the editor state. */
  doc: () => string
  unmount: () => void
}

function CodeEditorTestFrame({
  content,
  language,
  extensions,
  toolbar,
  toolbarActions,
  statusBar,
  readOnly,
  editable,
  lineWrapping,
  onLineWrappingChange,
  placeholder,
  autoFocus,
  onChange,
  onReady,
}: RenderCodeEditorOptions) {
  const [value, setValue] = useState(content ?? '')

  return (
    <CodeEditor
      value={value}
      onChange={(next) => {
        setValue(next)
        onChange?.(next)
      }}
      onReady={onReady}
      language={language}
      placeholder={placeholder}
      editable={editable}
      readOnly={readOnly}
      lineWrapping={lineWrapping}
      onLineWrappingChange={onLineWrappingChange}
      autoFocus={autoFocus}
    >
      {extensions}
      {toolbar === false
        ? null
        : <CodeEditorToolbar>{toolbarActions}</CodeEditorToolbar>}
      <CodeEditorContent />
      {statusBar === false
        ? null
        : <CodeEditorStatusBar />}
    </CodeEditor>
  )
}

/**
 * Renders the code editor shell the docs use, with the controlled document wired
 * up, and resolves once the CodeMirror view exists.
 */
export async function renderCodeEditor(
  options: RenderCodeEditorOptions = {},
): Promise<RenderedCodeEditor> {
  let resolveView!: (view: EditorView) => void
  const viewReady = new Promise<EditorView>((resolve) => {
    resolveView = resolve
  })

  const { container, unmount } = render(
    <CodeEditorTestFrame
      {...options}
      onReady={(view) => {
        resolveView(view)
        options.onReady?.(view)
      }}
    />,
  )

  const view = await viewReady

  return {
    view,
    container,
    doc: () => view.state.doc.toString(),
    unmount,
  }
}
