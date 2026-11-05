import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderCodeEditor } from '../../helpers/render-code-editor'

describe('codeEditorToolbar', () => {
  it('enables undo and redo from the history depth', async () => {
    const { view, doc } = await renderCodeEditor({ content: 'const answer = 42' })

    expect((screen.getByRole('button', { name: 'Undo' }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: 'Redo' }) as HTMLButtonElement).disabled).toBe(true)

    act(() => {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: 'const answer = 43' },
      })
    })

    await waitFor(() => {
      expect((screen.getByRole('button', { name: 'Undo' }) as HTMLButtonElement).disabled).toBe(false)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => {
      expect(doc()).toBe('const answer = 42')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))

    await waitFor(() => {
      expect(doc()).toBe('const answer = 43')
    })
  })

  it('copies the document and confirms the copy briefly', async () => {
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined)
    const { doc } = await renderCodeEditor({ content: 'const answer = 42' })

    vi.useFakeTimers()

    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }))

    expect(writeText).toHaveBeenCalledWith(doc())
    expect(screen.getByRole('button', { name: 'Copied' })).not.toBeNull()

    act(() => {
      vi.advanceTimersByTime(1600)
    })

    expect(screen.getByRole('button', { name: 'Copy code' })).not.toBeNull()
    vi.useRealTimers()
  })

  it('toggles soft wrapping and reports the change', async () => {
    const onLineWrappingChange = vi.fn()
    const { container } = await renderCodeEditor({
      content: 'const answer = 42',
      onLineWrappingChange,
    })

    const toggle = screen.getByRole('button', { name: 'Soft wrap' })
    expect(toggle.getAttribute('aria-pressed')).not.toBe('true')

    fireEvent.click(toggle)

    await waitFor(() => {
      expect(onLineWrappingChange).toHaveBeenCalledWith(true)
    })
    expect(screen.getByRole('button', { name: 'Soft wrap' }).getAttribute('aria-pressed')).toBe('true')
    expect(container.querySelector('.cm-content')?.className).toContain('cm-lineWrapping')

    fireEvent.click(screen.getByRole('button', { name: 'Soft wrap' }))

    await waitFor(() => {
      expect(onLineWrappingChange).toHaveBeenLastCalledWith(false)
    })
  })
})

describe('codeEditorStatusBar', () => {
  it('tracks the cursor position and selection length', async () => {
    const { view, container } = await renderCodeEditor({ content: 'one\ntwo' })
    const status = () => container.querySelector('[data-slot="code-editor-status"]')?.textContent

    expect(status()).toContain('Ln 1, Col 1')

    act(() => {
      view.dispatch({
        selection: { anchor: 5 },
      })
    })

    await waitFor(() => {
      expect(status()).toContain('Ln 2, Col 2')
    })

    act(() => {
      view.dispatch({
        selection: { anchor: 0, head: 5 },
      })
    })

    await waitFor(() => {
      expect(status()).toContain('5 selected')
    })
  })

  it('shows the language shared by the editor root', async () => {
    const { container } = await renderCodeEditor({ content: 'const a = 1', language: 'tsx' })

    expect(
      container.querySelector('[data-slot="code-editor-status"]')?.textContent,
    ).toContain('tsx')
  })

  it('hides the status bar when asked', async () => {
    const { container } = await renderCodeEditor({
      content: 'const a = 1',
      statusBar: false,
    })

    expect(container.querySelector('[data-slot="code-editor-status"]')).toBeNull()
  })
})
