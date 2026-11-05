import { act, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { renderCodeEditor } from '../helpers/render-code-editor'
import { renderRichTextEditor } from '../helpers/render-rich-text-editor'

it('happy-dom mounts the rich text editor', async () => {
  const onChange = vi.fn()
  const { editor, container, html } = await renderRichTextEditor({
    content: '<p>Hello world</p>',
    onChange,
  })

  expect(container.querySelector('.ProseMirror')).not.toBeNull()
  expect(html()).toContain('Hello world')

  act(() => {
    editor.commands.insertContent(' more')
  })

  await waitFor(() => {
    expect(onChange).toHaveBeenCalled()
  })
  expect(html()).toContain('more')
})

it('happy-dom mounts the code editor', async () => {
  const onChange = vi.fn()
  const { view, container, doc } = await renderCodeEditor({
    content: 'const answer = 42',
    onChange,
  })

  expect(container.querySelector('.cm-editor')).not.toBeNull()
  expect(doc()).toBe('const answer = 42')

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
    expect(onChange).toHaveBeenCalledWith('const answer = 43')
  })
})
