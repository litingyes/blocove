import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RichTextEditorPlayground } from '@/registry/blocove/blocks/rich-text-editor-playground'

async function renderPlayground(
  props: Partial<React.ComponentProps<typeof RichTextEditorPlayground>> = {},
) {
  const onChange = vi.fn()
  const { container, unmount } = render(
    <RichTextEditorPlayground onChange={onChange} {...props} />,
  )

  await waitFor(() => {
    expect(container.querySelector('.ProseMirror')).not.toBeNull()
  })

  return { container, onChange, unmount }
}

describe('richTextEditorPlayground', () => {
  it('renders the built-in document with every node family', async () => {
    const { container } = await renderPlayground()
    const surface = container.querySelector('.ProseMirror')!

    expect(surface.textContent).toContain('Composable rich text editor')
    expect(surface.querySelector('h2')).not.toBeNull()
    expect(surface.querySelector('h3')).not.toBeNull()
    expect(surface.querySelector('strong')).not.toBeNull()
    expect(surface.querySelector('em')).not.toBeNull()
    expect(surface.querySelector('u')).not.toBeNull()
    expect(surface.querySelector('s')).not.toBeNull()
    expect(surface.querySelector('code')).not.toBeNull()
    expect(surface.querySelector('a[href="https://ui.shadcn.com/docs/typeset"]')).not.toBeNull()
    expect(surface.querySelector('br')).not.toBeNull()
    expect(surface.querySelector('pre > code')).not.toBeNull()
    // The details node renders through a React node view, not a native element.
    expect(surface.querySelector('[data-type="details"]')).not.toBeNull()
    expect(surface.querySelector('img')).not.toBeNull()
    expect(surface.querySelector('table')).not.toBeNull()
    expect(surface.querySelectorAll('th')).toHaveLength(2)
  })

  it('shows the character and word count', async () => {
    const { container } = await renderPlayground()

    const counter = container.querySelector('[data-slot="editor-character-count"]')?.textContent

    expect(counter).toMatch(/\d+ characters/)
    expect(counter).toMatch(/\d+ words/)
  })

  it('emits the updated HTML when a toolbar command edits the document', async () => {
    const { onChange } = await renderPlayground()

    fireEvent.click(screen.getByRole('button', { name: 'Table' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Insert 3×3 table' }))

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled()
    })

    expect(onChange.mock.calls.at(-1)?.[0]).toContain('<table')
  })

  it('accepts a custom document and placeholder', async () => {
    const { container } = await renderPlayground({
      defaultValue: '<p>Custom document</p>',
      placeholder: 'Write here…',
    })

    expect(container.querySelector('.ProseMirror')?.textContent).toContain('Custom document')
  })

  it('renders the placeholder for an empty custom document', async () => {
    const { container } = await renderPlayground({ defaultValue: '' })

    await waitFor(() => {
      const paragraph = container.querySelector('.ProseMirror p')
      expect(paragraph?.getAttribute('data-placeholder')).toBe('Start writing…')
    })
  })

  it('forwards the className to the editor root', async () => {
    const { container } = await renderPlayground({ className: 'max-w-xl' })

    expect(container.querySelector('[data-slot="editor"]')?.className).toContain('max-w-xl')
  })
})
