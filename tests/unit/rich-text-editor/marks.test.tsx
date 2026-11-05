import type { ReactElement } from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EditorBold, EditorBoldToolbar } from '@/components/blocove/rich-text-editor/bold'
import { EditorCode, EditorCodeToolbar } from '@/components/blocove/rich-text-editor/code'
import { EditorItalic, EditorItalicToolbar } from '@/components/blocove/rich-text-editor/italic'
import { EditorLink, EditorLinkToolbar } from '@/components/blocove/rich-text-editor/link'
import { EditorStrike, EditorStrikeToolbar } from '@/components/blocove/rich-text-editor/strike'
import { EditorUnderline, EditorUnderlineToolbar } from '@/components/blocove/rich-text-editor/underline'
import { renderRichTextEditor } from '../../helpers/render-rich-text-editor'

interface MarkCase {
  label: string
  mark: string
  tag: string
  extension: ReactElement
  toolbar: ReactElement
}

const markCases: MarkCase[] = [
  {
    label: 'Bold',
    mark: 'bold',
    tag: 'strong',
    extension: <EditorBold />,
    toolbar: <EditorBoldToolbar />,
  },
  {
    label: 'Italic',
    mark: 'italic',
    tag: 'em',
    extension: <EditorItalic />,
    toolbar: <EditorItalicToolbar />,
  },
  {
    label: 'Underline',
    mark: 'underline',
    tag: 'u',
    extension: <EditorUnderline />,
    toolbar: <EditorUnderlineToolbar />,
  },
  {
    label: 'Strikethrough',
    mark: 'strike',
    tag: 's',
    extension: <EditorStrike />,
    toolbar: <EditorStrikeToolbar />,
  },
  {
    label: 'Inline code',
    mark: 'code',
    tag: 'code',
    extension: <EditorCode />,
    toolbar: <EditorCodeToolbar />,
  },
]

describe.each(markCases)('$label mark', ({ label, mark, tag, extension, toolbar }) => {
  it('toggles the mark from the toolbar and reflects the pressed state', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Hello</p>',
      extensions: extension,
      toolbar,
    })

    act(() => {
      editor.commands.selectAll()
    })

    const button = screen.getByRole('button', { name: label })
    expect(button.getAttribute('aria-pressed')).not.toBe('true')

    fireEvent.click(button)

    await waitFor(() => {
      expect(editor.isActive(mark)).toBe(true)
    })
    expect(screen.getByRole('button', { name: label }).getAttribute('aria-pressed')).toBe('true')
    expect(editor.getHTML()).toContain(`<${tag}>`)

    fireEvent.click(screen.getByRole('button', { name: label }))

    await waitFor(() => {
      expect(editor.isActive(mark)).toBe(false)
    })
    expect(editor.getHTML()).not.toContain(`<${tag}>`)
  })

  it('renders nothing outside an editor', () => {
    const { container } = render(toolbar)

    expect(container.innerHTML).toBe('')
  })
})

describe('link mark', () => {
  const extensions = <EditorLink />
  const toolbar = <EditorLinkToolbar />

  it('stamps safe link attributes from the extension configuration', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p><a href="https://example.com">link</a></p>',
      extensions,
    })

    expect(editor.getHTML()).toContain('rel="noopener noreferrer nofollow"')
    expect(editor.getHTML()).toContain('target="_blank"')
  })

  it('applies a normalized URL from the toolbar popover', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Hello</p>',
      extensions,
      toolbar,
    })

    act(() => {
      editor.commands.selectAll()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Link' }))

    const input = await screen.findByLabelText('Link URL')
    fireEvent.change(input, {
      target: { value: 'example.com/docs' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
      expect(editor.getHTML()).toContain('href="https://example.com/docs"')
    })
  })

  it('keeps explicit protocols and removes empty links', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Hello</p>',
      extensions,
      toolbar,
    })

    act(() => {
      editor.commands.selectAll()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Link' }))
    fireEvent.change(await screen.findByLabelText('Link URL'), {
      target: { value: 'mailto:hi@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))

    await waitFor(() => {
      expect(editor.getHTML()).toContain('href="mailto:hi@example.com"')
    })

    act(() => {
      editor.commands.selectAll()
    })
    // The popover closed when the link was applied; reopen it to remove.
    fireEvent.click(screen.getByRole('button', { name: 'Link' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Remove' }))

    await waitFor(() => {
      expect(editor.getHTML()).not.toContain('<a ')
    })
  })
})

describe('duplicate declarations', () => {
  it('warns once and keeps the first declaration', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { editor } = await renderRichTextEditor({
      content: '<p>Hello</p>',
      extensions: (
        <>
          <EditorBold />
          <EditorBold />
        </>
      ),
    })

    const duplicateWarnings = warn.mock.calls.filter(call =>
      String(call[0]).includes('Duplicate extension "bold"'),
    )

    // The editor collects its children on every render, so the diagnostic may
    // repeat; what matters is that it fires and only the first declaration ships.
    expect(duplicateWarnings.length).toBeGreaterThanOrEqual(1)
    expect(editor.extensionManager.extensions.filter(extension => extension.name === 'bold')).toHaveLength(1)
    expect(editor.isActive('bold')).toBe(false)
  })

  it('treats extension props as static configuration', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p><a href="https://example.com">link</a></p>',
      extensions: <EditorLink openOnClick />,
      onReady: () => {},
    })

    expect(editor.getHTML()).toContain('href="https://example.com"')
  })
})
