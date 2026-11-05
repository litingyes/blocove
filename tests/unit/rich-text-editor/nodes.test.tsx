import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EditorCodeBlock, EditorCodeBlockToolbar } from '@/components/blocove/rich-text-editor/code-block'
import { EditorDetails, EditorDetailsToolbar } from '@/components/blocove/rich-text-editor/details'
import { EditorHardBreak } from '@/components/blocove/rich-text-editor/hard-break'
import { EditorHeading, EditorHeadingToolbar } from '@/components/blocove/rich-text-editor/heading'
import { EditorImage, EditorImageToolbar } from '@/components/blocove/rich-text-editor/image'
import { EditorParagraph } from '@/components/blocove/rich-text-editor/paragraph'
import { EditorTable, EditorTableToolbar } from '@/components/blocove/rich-text-editor/table'
import { EditorText } from '@/components/blocove/rich-text-editor/text'
import { selectBaseUiOption } from '../../helpers/interactions'
import { renderRichTextEditor } from '../../helpers/render-rich-text-editor'

describe('heading node', () => {
  it('registers the heading schema without a toolbar', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<h2>Title</h2><p>Body</p>',
      extensions: <EditorHeading />,
      toolbar: false,
    })

    expect(editor.getHTML()).toContain('<h2>Title</h2>')
  })

  it('switches the block type from the toolbar selector', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Text</p>',
      extensions: <EditorHeading />,
      toolbar: <EditorHeadingToolbar />,
    })

    fireEvent.click(screen.getByRole('combobox', { name: 'Block type' }))
    selectBaseUiOption('Heading 2')

    await waitFor(() => {
      expect(editor.isActive('heading', { level: 2 })).toBe(true)
    })
    expect(editor.getHTML()).toContain('<h2>Text</h2>')

    fireEvent.click(screen.getByRole('combobox', { name: 'Block type' }))
    selectBaseUiOption('Paragraph')

    await waitFor(() => {
      expect(editor.isActive('paragraph')).toBe(true)
    })
  })
})

describe('code block node', () => {
  it('toggles a preformatted block from the toolbar', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>const value = 1</p>',
      extensions: <EditorCodeBlock />,
      toolbar: <EditorCodeBlockToolbar />,
    })

    act(() => {
      editor.commands.selectAll()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Code block' }))

    await waitFor(() => {
      expect(editor.isActive('codeBlock')).toBe(true)
    })
    expect(editor.getHTML()).toContain('<pre><code>')
  })
})

describe('details node', () => {
  it('wraps the current block in a details node', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Summary</p>',
      extensions: <EditorDetails />,
      toolbar: <EditorDetailsToolbar />,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Details' }))

    await waitFor(() => {
      expect(editor.isActive('details')).toBe(true)
    })
    expect(editor.getHTML()).toContain('<details')
  })
})

describe('image node', () => {
  it('inserts an image with a normalized URL from the toolbar', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Image:</p>',
      extensions: <EditorImage />,
      toolbar: <EditorImageToolbar />,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Image' }))
    fireEvent.change(await screen.findByLabelText('Image URL'), {
      target: { value: 'example.com/picture.png' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Insert image' }))

    await waitFor(() => {
      expect(editor.getHTML()).toContain('<img')
    })
    expect(editor.getHTML()).toContain('src="https://example.com/picture.png"')
  })

  it('upgrades protocol-relative URLs to https', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Image:</p>',
      extensions: <EditorImage />,
      toolbar: <EditorImageToolbar />,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Image' }))
    fireEvent.change(await screen.findByLabelText('Image URL'), {
      target: { value: '//cdn.example.com/picture.png' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Insert image' }))

    await waitFor(() => {
      expect(editor.getHTML()).toContain('src="https://cdn.example.com/picture.png"')
    })
  })
})

describe('table node', () => {
  it('inserts a 3x3 table with a header row and edits it from the toolbar', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Table:</p>',
      extensions: <EditorTable />,
      toolbar: <EditorTableToolbar />,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Table' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Insert 3×3 table' }))

    await waitFor(() => {
      expect(editor.isActive('table')).toBe(true)
    })

    const inserted = editor.getHTML()
    expect(inserted.match(/<tr>/g)).toHaveLength(3)
    expect(inserted.match(/<th/g)).toHaveLength(3)
    expect(inserted.match(/<td/g)).toHaveLength(6)

    fireEvent.click(screen.getByRole('button', { name: 'Table' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Row below' }))
    await waitFor(() => {
      expect(editor.getHTML().match(/<tr>/g)).toHaveLength(4)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Table' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Column right' }))
    await waitFor(() => {
      expect(editor.getHTML().match(/<th/g)).toHaveLength(4)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Table' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Delete table' }))
    await waitFor(() => {
      expect(editor.getHTML()).not.toContain('<table')
    })
  })

  it('disables table commands outside a table', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Text</p>',
      extensions: <EditorTable />,
      toolbar: <EditorTableToolbar />,
    })

    expect(editor.isActive('table')).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: 'Table' }))

    expect((await screen.findByRole('button', { name: 'Row below' }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: 'Insert 3×3 table' }) as HTMLButtonElement).disabled).toBe(false)
  })
})

describe('hard break node', () => {
  it('inserts a line break inside the paragraph', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>First</p>',
      basicNodes: false,
      extensions: (
        <>
          <EditorText />
          <EditorParagraph />
          <EditorHardBreak />
        </>
      ),
      toolbar: false,
    })

    act(() => {
      editor.commands.setTextSelection(editor.state.doc.content.size - 1)
      editor.commands.setHardBreak()
    })

    expect(editor.getHTML()).toContain('<br>')
  })
})

describe('base nodes', () => {
  it('renders text through paragraphs', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Plain</p>',
      basicNodes: false,
      extensions: (
        <>
          <EditorText />
          <EditorParagraph />
        </>
      ),
      toolbar: false,
    })

    expect(editor.getHTML()).toBe('<p>Plain</p>')
  })
})
