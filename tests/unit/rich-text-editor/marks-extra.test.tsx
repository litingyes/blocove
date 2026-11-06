import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EditorHighlight, EditorHighlightToolbar } from '@/components/blocove/rich-text-editor/highlight'
import { EditorRuby, EditorRubyToolbar } from '@/components/blocove/rich-text-editor/ruby'
import { EditorSubscript, EditorSubscriptToolbar } from '@/components/blocove/rich-text-editor/subscript'
import { EditorSuperscript, EditorSuperscriptToolbar } from '@/components/blocove/rich-text-editor/superscript'
import { renderRichTextEditor } from '../../helpers/render-rich-text-editor'

describe('highlight mark', () => {
  it('toggles the mark from the toolbar', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Hello</p>',
      extensions: <EditorHighlight />,
      toolbar: <EditorHighlightToolbar />,
    })

    act(() => {
      editor.commands.selectAll()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Highlight' }))

    await waitFor(() => {
      expect(editor.isActive('highlight')).toBe(true)
    })
    expect(editor.getHTML()).toContain('<mark>')

    fireEvent.click(screen.getByRole('button', { name: 'Highlight' }))

    await waitFor(() => {
      expect(editor.isActive('highlight')).toBe(false)
    })
    expect(editor.getHTML()).not.toContain('<mark>')
  })

  it('renders nothing outside an editor', () => {
    const { container } = render(<EditorHighlightToolbar />)

    expect(container.innerHTML).toBe('')
  })
})

describe('ruby mark', () => {
  it('applies an annotation from the toolbar popover', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>漢字</p>',
      extensions: <EditorRuby />,
      toolbar: <EditorRubyToolbar />,
    })

    act(() => {
      editor.commands.selectAll()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Ruby' }))
    fireEvent.change(await screen.findByLabelText('Ruby annotation'), {
      target: { value: 'かんじ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
      expect(editor.isActive('rubyText')).toBe(true)
    })
    expect(editor.getHTML()).toContain('<ruby')
    expect(editor.getHTML()).toContain('<rt')
  })

  it('clears the annotation when the input is empty', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p><ruby><rb>漢字</rb><rt>かんじ</rt></ruby></p>',
      extensions: <EditorRuby />,
      toolbar: <EditorRubyToolbar />,
    })

    act(() => {
      editor.commands.selectAll()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Ruby' }))
    fireEvent.change(await screen.findByLabelText('Ruby annotation'), {
      target: { value: '  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
      expect(editor.isActive('rubyText')).toBe(false)
    })
    expect(editor.getHTML()).not.toContain('<ruby')
  })

  it('removes the annotation from the toolbar popover', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p><ruby><rb>漢字</rb><rt>かんじ</rt></ruby></p>',
      extensions: <EditorRuby />,
      toolbar: <EditorRubyToolbar />,
    })

    expect(editor.getHTML()).toContain('<ruby')

    act(() => {
      editor.commands.selectAll()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Ruby' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Remove' }))

    await waitFor(() => {
      expect(editor.isActive('rubyText')).toBe(false)
    })
    expect(editor.getHTML()).not.toContain('<ruby')
  })

  it('renders nothing outside an editor', () => {
    const { container } = render(<EditorRubyToolbar />)

    expect(container.innerHTML).toBe('')
  })
})

describe('subscript mark', () => {
  it('toggles the mark from the toolbar', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>H2O</p>',
      extensions: <EditorSubscript />,
      toolbar: <EditorSubscriptToolbar />,
    })

    act(() => {
      editor.commands.selectAll()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Subscript' }))

    await waitFor(() => {
      expect(editor.isActive('subscript')).toBe(true)
    })
    expect(editor.getHTML()).toContain('<sub>')

    fireEvent.click(screen.getByRole('button', { name: 'Subscript' }))

    await waitFor(() => {
      expect(editor.isActive('subscript')).toBe(false)
    })
    expect(editor.getHTML()).not.toContain('<sub>')
  })

  it('renders nothing outside an editor', () => {
    const { container } = render(<EditorSubscriptToolbar />)

    expect(container.innerHTML).toBe('')
  })
})

describe('superscript mark', () => {
  it('toggles the mark from the toolbar', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>mc2</p>',
      extensions: <EditorSuperscript />,
      toolbar: <EditorSuperscriptToolbar />,
    })

    act(() => {
      editor.commands.selectAll()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Superscript' }))

    await waitFor(() => {
      expect(editor.isActive('superscript')).toBe(true)
    })
    expect(editor.getHTML()).toContain('<sup>')

    fireEvent.click(screen.getByRole('button', { name: 'Superscript' }))

    await waitFor(() => {
      expect(editor.isActive('superscript')).toBe(false)
    })
    expect(editor.getHTML()).not.toContain('<sup>')
  })

  it('renders nothing outside an editor', () => {
    const { container } = render(<EditorSuperscriptToolbar />)

    expect(container.innerHTML).toBe('')
  })
})
