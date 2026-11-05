import type { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { EditorView as CodeMirrorView } from '@codemirror/view'
import { act, render, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  CodeEditor,
  CodeEditorContent,
  CodeEditorStatusBar,
  CodeEditorToolbar,
  useCodeEditor,
} from '@/components/blocove/code-editor/editor'
import { renderCodeEditor } from '../../helpers/render-code-editor'

function CodeEditorShell({
  value,
  editable,
  readOnly,
  lineWrapping,
  onChange,
  onReady,
}: {
  value?: string
  editable?: boolean
  readOnly?: boolean
  lineWrapping?: boolean
  onChange?: (value: string) => void
  onReady?: (view: EditorView) => void
}) {
  return (
    <CodeEditor
      value={value}
      editable={editable}
      readOnly={readOnly}
      lineWrapping={lineWrapping}
      onChange={onChange}
      onReady={onReady}
    >
      <CodeEditorToolbar />
      <CodeEditorContent />
      <CodeEditorStatusBar />
    </CodeEditor>
  )
}

describe('codeEditor content', () => {
  it('mounts the CodeMirror surface and exposes the view through onReady', async () => {
    const onReady = vi.fn()
    const { container, view, doc } = await renderCodeEditor({
      content: 'const answer = 42',
      onReady,
    })

    expect(container.querySelector('.cm-editor')).not.toBeNull()
    expect(container.querySelector('.cm-content')).not.toBeNull()
    expect(doc()).toBe('const answer = 42')
    expect(onReady).toHaveBeenCalledWith(view)
  })

  it('emits onChange once for a document change', async () => {
    const onChange = vi.fn()
    const { view } = await renderCodeEditor({
      content: 'const answer = 42',
      onChange,
    })

    act(() => {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: 'const answer = 43',
        },
      })
    })

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(1)
    })
    expect(onChange).toHaveBeenCalledWith('const answer = 43')
  })

  it('does not emit onChange for selection-only changes', async () => {
    const onChange = vi.fn()
    const { view } = await renderCodeEditor({
      content: 'const answer = 42',
      onChange,
    })

    act(() => {
      view.dispatch({
        selection: { anchor: 5 },
      })
    })

    await new Promise(resolve => setTimeout(resolve, 0))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('replaces the document when the controlled value changes', async () => {
    const onChange = vi.fn()
    const onReady = vi.fn()

    const { container, rerender } = render(
      <CodeEditorShell
        value="const first = 1"
        onChange={onChange}
        onReady={onReady}
      />,
    )

    await waitFor(() => {
      expect(onReady).toHaveBeenCalled()
    })
    expect(container.querySelector('.cm-content')?.textContent).toContain('const first = 1')

    rerender(
      <CodeEditorShell
        value="const second = 2"
        onChange={onChange}
        onReady={onReady}
      />,
    )

    await waitFor(() => {
      expect(container.querySelector('.cm-content')?.textContent).toContain('const second = 2')
    })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('marks the surface read-only without making it editable', async () => {
    const { view, container } = await renderCodeEditor({
      content: 'const answer = 42',
      readOnly: true,
    })

    expect(view.state.readOnly).toBe(true)
    expect(view.state.facet(CodeMirrorView.editable)).toBe(false)
    expect(container.querySelector('.cm-content')?.getAttribute('contenteditable')).toBe('false')
  })

  it('keeps the document when only the editable flag changes', async () => {
    const onReady = vi.fn()
    const onChange = vi.fn()

    const { rerender } = render(
      <CodeEditorShell
        value="const answer = 42"
        editable={false}
        onChange={onChange}
        onReady={onReady}
      />,
    )

    await waitFor(() => {
      expect(onReady).toHaveBeenCalled()
    })

    rerender(
      <CodeEditorShell
        value="const answer = 42"
        editable
        onChange={onChange}
        onReady={onReady}
      />,
    )

    await waitFor(() => {
      const view = onReady.mock.calls.at(-1)![0] as EditorView
      expect(view.state.facet(CodeMirrorView.editable)).toBe(true)
    })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('applies the line wrapping prop to the content surface', async () => {
    const { container } = await renderCodeEditor({
      content: 'const answer = 42',
      lineWrapping: true,
    })

    expect(container.querySelector('.cm-content')?.className).toContain('cm-lineWrapping')
  })

  it('renders the chrome around the surface', async () => {
    const { container } = await renderCodeEditor({
      content: 'const answer = 42',
    })

    expect(container.querySelector('[data-slot="code-editor-toolbar"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="code-editor-status"]')).not.toBeNull()
  })

  it('throws when the editor hooks are used outside the provider', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const Probe = () => {
      useCodeEditor()

      return null
    }

    expect(() => render(<Probe />)).toThrow(/must be used inside <CodeEditor>/)
    error.mockRestore()
  })

  it('exposes the read-only and language state to the status bar', async () => {
    const { container } = await renderCodeEditor({
      content: 'const answer = 42',
      readOnly: true,
      language: 'tsx',
    })

    const status = container.querySelector('[data-slot="code-editor-status"]')?.textContent

    expect(status).toContain('Read only')
    // The language is rendered in the document's case and uppercased by CSS.
    expect(status).toContain('tsx')
  })

  it('keeps the document in sync with the history state', async () => {
    const { view, doc } = await renderCodeEditor({ content: 'const answer = 42' })

    act(() => {
      view.dispatch({
        changes: { from: 0, to: 5, insert: 'let' },
      })
    })

    await waitFor(() => {
      expect(doc()).toBe('let answer = 42')
    })
    expect(view.state.facet(EditorState.readOnly)).toBe(false)
  })
})
