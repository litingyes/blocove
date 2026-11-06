import type { Extensions } from '@tiptap/core'
import type { Editor as TiptapEditor } from '@tiptap/react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Extension } from '@tiptap/core'
import { describe, expect, it, vi } from 'vitest'
import {
  Editor,
  EditorContent,
  EditorToolbar,
} from '@/components/blocove/rich-text-editor/editor'
import { EditorParagraph } from '@/components/blocove/rich-text-editor/paragraph'
import { EditorText } from '@/components/blocove/rich-text-editor/text'
import { renderRichTextEditor } from '../../helpers/render-rich-text-editor'

function EditorShell({
  value,
  defaultValue,
  editable,
  placeholder,
  history,
  extensions,
  onChange,
  onReady,
}: {
  value?: string
  defaultValue?: string
  editable?: boolean
  placeholder?: string
  history?: boolean
  extensions?: Extensions
  onChange?: (html: string) => void
  onReady?: (editor: TiptapEditor) => void
}) {
  return (
    <Editor
      value={value}
      defaultValue={defaultValue}
      editable={editable}
      placeholder={placeholder}
      history={history}
      extensions={extensions}
      onChange={onChange}
      onReady={onReady}
    >
      <EditorText />
      <EditorParagraph />
      <EditorContent />
    </Editor>
  )
}

function hasExtension(editor: TiptapEditor, name: string) {
  return editor.extensionManager.extensions.some(extension => extension.name === name)
}

async function renderShellEditor(props: Parameters<typeof EditorShell>[0] = {}) {
  let resolveEditor!: (editor: TiptapEditor) => void
  const editorCreated = new Promise<TiptapEditor>((resolve) => {
    resolveEditor = resolve
  })

  render(<EditorShell {...props} onReady={editor => resolveEditor(editor)} />)

  return editorCreated
}

describe('editor content', () => {
  it('renders the initial document and calls onReady with the editor', async () => {
    const onReady = vi.fn()
    const { container, editor, html } = await renderRichTextEditor({
      content: '<p>Hello world</p>',
      onReady,
    })

    expect(container.querySelector('.ProseMirror')?.innerHTML).toContain('Hello world')
    expect(html()).toContain('<p>Hello world</p>')
    expect(onReady).toHaveBeenCalledWith(editor)
  })

  it('renders an uncontrolled defaultValue without a value prop', async () => {
    let resolveEditor!: (editor: TiptapEditor) => void
    const editorCreated = new Promise<TiptapEditor>((resolve) => {
      resolveEditor = resolve
    })
    const { container } = render(
      <EditorShell
        defaultValue="<p>Uncontrolled</p>"
        onReady={editor => resolveEditor(editor)}
      />,
    )

    await editorCreated

    expect(container.querySelector('.ProseMirror')?.innerHTML).toContain('Uncontrolled')
  })

  it('emits the serialized HTML once per edit', async () => {
    const onChange = vi.fn()
    const { editor } = await renderRichTextEditor({
      content: '<p>Start</p>',
      onChange,
    })

    act(() => {
      editor.commands.insertContent(' more')
    })

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledTimes(1)
    })
    expect(onChange.mock.calls[0][0]).toContain('more')
  })

  it('does not echo controlled value updates back through onChange', async () => {
    const onChange = vi.fn()
    const onReady = vi.fn()

    const { container, rerender } = render(
      <EditorShell
        value="<p>One</p>"
        onChange={onChange}
        onReady={onReady}
      />,
    )

    await waitFor(() => {
      expect(onReady).toHaveBeenCalled()
    })
    expect(container.querySelector('.ProseMirror')?.innerHTML).toContain('One')

    rerender(
      <EditorShell
        value="<p>Two</p>"
        onChange={onChange}
        onReady={onReady}
      />,
    )

    await waitFor(() => {
      expect(container.querySelector('.ProseMirror')?.innerHTML).toContain('Two')
    })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('applies the placeholder only while the document is empty', async () => {
    const { container, editor } = await renderRichTextEditor({
      content: '',
      placeholder: 'Type something…',
    })

    // Tiptap decorates the empty textblock with the placeholder attribute and
    // the empty node/editor classes.
    const paragraph = container.querySelector('.ProseMirror p')
    expect(paragraph?.getAttribute('data-placeholder')).toBe('Type something…')
    expect(paragraph?.className).toContain('is-editor-empty')

    act(() => {
      editor.commands.insertContent('filled')
    })

    const filled = container.querySelector('.ProseMirror p')
    expect(filled?.getAttribute('data-placeholder')).toBeNull()
    expect(filled?.className).not.toContain('is-editor-empty')
  })

  it('follows the editable prop', async () => {
    const onReady = vi.fn()

    const { container, rerender } = render(
      <EditorShell
        value="<p>Read only</p>"
        editable={false}
        onReady={onReady}
      />,
    )

    await waitFor(() => {
      expect(onReady).toHaveBeenCalled()
    })
    expect(onReady.mock.calls[0][0].isEditable).toBe(false)
    expect(container.querySelector('.ProseMirror')?.getAttribute('contenteditable')).toBe('false')

    rerender(
      <EditorShell
        value="<p>Read only</p>"
        editable
        onReady={onReady}
      />,
    )

    await waitFor(() => {
      expect(container.querySelector('.ProseMirror')?.getAttribute('contenteditable')).toBe('true')
    })
  })
})

describe('editor history', () => {
  it('registers undo and redo by default', async () => {
    const editor = await renderShellEditor({ value: '<p>History</p>' })

    expect(hasExtension(editor, 'undoRedo')).toBe(true)
  })

  it('omits undo and redo when history is false', async () => {
    const editor = await renderShellEditor({ value: '<p>No history</p>', history: false })

    expect(hasExtension(editor, 'undoRedo')).toBe(false)
  })

  it('omits undo and redo when a collaboration extension is declared', async () => {
    const collaboration = Extension.create({ name: 'collaboration' })
    const editor = await renderShellEditor({
      value: '<p>Collaborative</p>',
      extensions: [collaboration],
    })

    expect(hasExtension(editor, 'undoRedo')).toBe(false)
  })

  it('keeps undo and redo when history is explicitly enabled next to collaboration', async () => {
    const collaboration = Extension.create({ name: 'collaboration' })
    const editor = await renderShellEditor({
      value: '<p>Explicit</p>',
      history: true,
      extensions: [collaboration],
    })

    expect(hasExtension(editor, 'undoRedo')).toBe(true)
  })
})

describe('editor character count', () => {
  it('shows characters, words and the character limit', async () => {
    const { container } = await renderRichTextEditor({
      content: '<p>Hello world</p>',
      characterCount: 'both',
      characterLimit: 20,
    })

    const counter = container.querySelector('[data-slot="editor-character-count"]')

    expect(counter?.textContent).toContain('11 characters')
    expect(counter?.textContent).toContain('2 words')
  })

  it('renders the limit next to the character count', async () => {
    const { container } = await renderRichTextEditor({
      content: '<p>Hi</p>',
      characterCount: 'characters',
      characterLimit: 10,
    })

    expect(
      container.querySelector('[data-slot="editor-character-count"]')?.textContent,
    ).toContain('2 / 10 characters')
  })

  it('updates while the document changes', async () => {
    const { container, editor } = await renderRichTextEditor({
      content: '<p>Hi</p>',
      characterCount: 'characters',
    })

    expect(
      container.querySelector('[data-slot="editor-character-count"]')?.textContent,
    ).toContain('2 characters')

    act(() => {
      editor.commands.insertContent(' there')
    })

    await waitFor(() => {
      expect(
        container.querySelector('[data-slot="editor-character-count"]')?.textContent,
      ).toContain('8 characters')
    })
  })
})

describe('editor toolbar', () => {
  it('enables undo and redo from the history state', async () => {
    const { editor } = await renderRichTextEditor({ content: '<p>Start</p>' })

    const undo = screen.getByRole('button', { name: 'Undo' })
    const redo = screen.getByRole('button', { name: 'Redo' })

    expect((undo as HTMLButtonElement).disabled).toBe(true)
    expect((redo as HTMLButtonElement).disabled).toBe(true)

    act(() => {
      editor.commands.insertContent('!')
    })

    await waitFor(() => {
      expect((screen.getByRole('button', { name: 'Undo' }) as HTMLButtonElement).disabled).toBe(false)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => {
      expect(editor.getHTML()).not.toContain('Start!')
    })

    expect((screen.getByRole('button', { name: 'Redo' }) as HTMLButtonElement).disabled).toBe(false)
  })

  it('sets the text alignment from the toolbar', async () => {
    const { editor } = await renderRichTextEditor({ content: '<p>Aligned</p>' })

    fireEvent.click(screen.getByRole('button', { name: 'Align center' }))

    await waitFor(() => {
      expect(editor.isActive({ textAlign: 'center' })).toBe(true)
    })
    expect(editor.getHTML()).toContain('text-align: center')
  })

  it('clears formatting with the eraser action', async () => {
    const { editor } = await renderRichTextEditor({ content: '<p><strong>Bold</strong></p>' })

    act(() => {
      editor.commands.selectAll()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Clear formatting' }))

    await waitFor(() => {
      expect(editor.getHTML()).not.toContain('<strong>')
    })
  })

  it('renders a placeholder toolbar when used outside an editor', () => {
    const { container } = render(<EditorToolbar />)

    expect(container.querySelector('[role="toolbar"]')).not.toBeNull()
    expect(screen.queryByRole('button', { name: 'Undo' })).toBeNull()
  })
})

describe('editor content presentation', () => {
  it('applies the typeset classes by default', async () => {
    const { container } = await renderRichTextEditor({ content: '<p>Typeset</p>' })
    const wrapper = container.querySelector('[data-slot="editor-content"] > div')

    expect(wrapper?.className).toContain('typeset')
  })

  it('drops the typeset classes when typeset is disabled', async () => {
    const { container } = await renderRichTextEditor({
      content: '<p>Plain</p>',
      typeset: false,
    })
    const wrapper = container.querySelector('[data-slot="editor-content"] > div')

    expect(wrapper?.className).not.toContain('typeset')
  })
})
