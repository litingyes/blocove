import type { ComponentProps } from 'react'
import { EditorView } from '@codemirror/view'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CodeEditorBlock } from '@/registry/blocove/blocks/code-editor-block'

async function renderBlock(
  props: Partial<ComponentProps<typeof CodeEditorBlock>> = {},
) {
  const onChange = vi.fn()
  const { container, unmount } = render(
    <CodeEditorBlock onChange={onChange} {...props} />,
  )

  await waitFor(() => {
    expect(container.querySelector('.cm-editor')).not.toBeNull()
  })

  const view = EditorView.findFromDOM(container.querySelector<HTMLElement>('.cm-editor')!)!

  return { container, onChange, unmount, view }
}

describe('codeEditorBlock', () => {
  it('mounts the CodeMirror surface with the composed chrome', async () => {
    const { container, view } = await renderBlock()

    expect(container.querySelector('.cm-editor')).not.toBeNull()
    expect(container.querySelector('.cm-lineNumbers')).not.toBeNull()
    expect(container.querySelector('[data-slot="code-editor-toolbar"]')).not.toBeNull()
    expect(container.querySelector('[data-slot="code-editor-status"]')).not.toBeNull()
    expect(view.state.doc.toString()).toContain('pickSample')
  })

  it('emits the new document when a transaction changes it', async () => {
    const { onChange, view } = await renderBlock({
      defaultValue: 'const answer = 42',
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

  it('accepts a custom document and language', async () => {
    const { container, view } = await renderBlock({
      defaultValue: 'const custom = true',
      language: 'typescript',
    })

    expect(view.state.doc.toString()).toBe('const custom = true')
    expect(
      container.querySelector('[data-slot="code-editor-status"]')?.textContent,
    ).toContain('typescript')
  })

  it('forwards the className to the editor root', async () => {
    const { container } = await renderBlock({ className: 'max-w-xl' })

    const root = container.querySelector('[data-slot="code-editor"]')

    expect(root?.className).toContain('h-80')
    expect(root?.className).toContain('max-w-xl')
  })

  it('keeps the read-only document unchanged', async () => {
    const { container, onChange, view } = await renderBlock({
      defaultValue: 'const answer = 42',
      readOnly: true,
    })
    const content = container.querySelector<HTMLElement>('.cm-content')!

    expect(view.state.readOnly).toBe(true)
    expect(content.getAttribute('contenteditable')).toBe('false')
    expect(content.getAttribute('aria-readonly')).toBe('true')

    fireEvent.click(content)
    fireEvent.keyDown(content, { key: 'End' })
    fireEvent.keyDown(content, { key: 'a' })
    fireEvent.input(content)

    await waitFor(() => {
      expect(onChange).not.toHaveBeenCalled()
    })
    expect(view.state.doc.toString()).toBe('const answer = 42')
  })
})
