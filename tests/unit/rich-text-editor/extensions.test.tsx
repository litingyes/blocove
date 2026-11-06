import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EditorDragHandle } from '@/components/blocove/rich-text-editor/drag-handle'
import { EditorFileHandler, readFileAsDataUrl } from '@/components/blocove/rich-text-editor/file-handler'
import {
  EditorFindAndReplace,
  EditorFindAndReplaceToolbar,
} from '@/components/blocove/rich-text-editor/find-and-replace'
import { renderRichTextEditor } from '../../helpers/render-rich-text-editor'

describe('drag handle', () => {
  it('renders nothing when the editor is read only', async () => {
    const { container } = await renderRichTextEditor({
      editable: false,
      extensions: <EditorDragHandle />,
      toolbar: false,
    })

    expect(container.querySelector('[data-slot="editor-drag-handle"]')).toBeNull()
  })

  it('renders inside an editable editor without throwing', async () => {
    const { container } = await renderRichTextEditor({
      content: '<p>Block</p>',
      extensions: <EditorDragHandle />,
      toolbar: false,
    })

    expect(container.querySelector('[data-slot="editor"]')).not.toBeNull()
  })
})

describe('file handler', () => {
  it('registers the extension', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Files</p>',
      extensions: <EditorFileHandler />,
      toolbar: false,
    })

    expect(
      editor.extensionManager.extensions.some(extension => extension.name === 'fileHandler'),
    ).toBe(true)
  })

  it('reads a file into a data url by default', async () => {
    const file = new File(['blockove'], 'logo.svg', { type: 'image/svg+xml' })
    const source = await readFileAsDataUrl(file)

    expect(source.startsWith('data:image/svg+xml')).toBe(true)
  })

  it('accepts an upload callback that returns the url', async () => {
    const onFile = vi.fn(() => 'https://example.com/logo.png')
    const { editor } = await renderRichTextEditor({
      content: '<p>Files</p>',
      extensions: <EditorFileHandler onFile={onFile} />,
      toolbar: false,
    })

    expect(
      editor.extensionManager.extensions.some(extension => extension.name === 'fileHandler'),
    ).toBe(true)
  })
})

describe('find and replace', () => {
  it('counts the matches while the search field changes', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>editor and editor</p>',
      extensions: <EditorFindAndReplace searchDebounceMs={0} />,
      toolbar: <EditorFindAndReplaceToolbar />,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Find and replace' }))

    const input = await screen.findByLabelText('Find')
    fireEvent.change(input, {
      target: { value: 'editor' },
    })

    await waitFor(() => {
      expect(editor.storage.findAndReplace.searchTerm).toBe('editor')
    })
    expect(editor.storage.findAndReplace.results).toHaveLength(2)
  })

  it('waits for the input method to commit before searching', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>你好 world</p>',
      extensions: <EditorFindAndReplace searchDebounceMs={0} />,
      toolbar: <EditorFindAndReplaceToolbar />,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Find and replace' }))

    const input = await screen.findByLabelText('Find')

    fireEvent.compositionStart(input)
    fireEvent.change(input, {
      target: { value: '你' },
    })

    // Composing must not search, otherwise the highlights move under the caret.
    expect(editor.storage.findAndReplace.searchTerm).toBe('')
    expect(editor.getHTML()).toContain('你好 world')

    fireEvent.compositionEnd(input)

    await waitFor(() => {
      expect(editor.storage.findAndReplace.searchTerm).toBe('你')
    })
  })

  it('replaces every match from the toolbar', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>editor and editor</p>',
      extensions: <EditorFindAndReplace searchDebounceMs={0} />,
      toolbar: <EditorFindAndReplaceToolbar />,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Find and replace' }))
    fireEvent.change(await screen.findByLabelText('Find'), {
      target: { value: 'editor' },
    })
    fireEvent.change(await screen.findByLabelText('Replace with'), {
      target: { value: 'writer' },
    })

    await waitFor(() => {
      expect(editor.storage.findAndReplace.results).toHaveLength(2)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Replace all' }))

    await waitFor(() => {
      expect(editor.getHTML()).toContain('writer and writer')
    })
    expect(editor.getHTML()).not.toContain('editor')
  })
})
