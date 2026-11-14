import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RichTextEditorCollaborationBlock } from '@/registry/blocove/blocks/rich-text-editor-collaboration-block'
import { createFakeProvider } from '../../helpers/collaboration'

function renderBlock(options: {
  editable?: boolean
  provider?: ReturnType<typeof createFakeProvider>['provider']
  document?: ReturnType<typeof createFakeProvider>['document']
} = {}) {
  const fake = createFakeProvider()
  const provider = options.provider ?? fake.provider
  const document = options.document ?? fake.document

  const rendered = render(
    <RichTextEditorCollaborationBlock
      document={document}
      provider={provider}
      user={{ name: 'Ada Lovelace', color: '#2563eb' }}
      editable={options.editable}
    />,
  )

  return {
    ...rendered,
    ...fake,
    provider,
    document,
  }
}

describe('richTextEditorCollaborationBlock', () => {
  it('composes the shared document, the toolbar and the status bar', async () => {
    const fake = createFakeProvider()

    // The caret publishes the local user; the second entry is the remote peer.
    fake.awareness.states.set(2, {
      user: { name: 'Alan Turing', color: '#059669' },
    })

    const { container } = render(
      <RichTextEditorCollaborationBlock
        document={fake.document}
        provider={fake.provider}
        user={{ name: 'Ada Lovelace', color: '#2563eb' }}
      />,
    )
    const destroy = fake.destroy

    await waitFor(() => {
      expect(container.querySelector('.ProseMirror')).not.toBeNull()
    })

    expect(screen.getByRole('textbox', { name: 'Rich text editor' })).toBeTruthy()
    expect(screen.getByRole('toolbar', { name: 'Formatting' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Bold' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Italic' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Link' })).toBeTruthy()
    expect(container.textContent).toContain('Live')
    await waitFor(() => {
      expect(container.textContent).toContain('2 online')
    })
    expect(container.querySelector('[data-slot="editor-character-count"]')).not.toBeNull()

    destroy()
  })

  it('shows the shared-document placeholder while it is empty', async () => {
    const { container, destroy } = renderBlock()

    await waitFor(() => {
      expect(container.querySelector('.ProseMirror')).not.toBeNull()
    })

    const paragraph = container.querySelector('.ProseMirror p')

    expect(paragraph?.getAttribute('data-placeholder')).toBe(
      'Start writing together…',
    )

    destroy()
  })

  it('follows the editable prop', async () => {
    const { container, destroy } = renderBlock({ editable: false })

    await waitFor(() => {
      expect(container.querySelector('.ProseMirror')).not.toBeNull()
    })

    expect(
      container.querySelector('.ProseMirror')?.getAttribute('contenteditable'),
    ).toBe('false')

    destroy()
  })

  it('renders the collaboration extension', async () => {
    const { container, destroy } = renderBlock()

    await waitFor(() => {
      expect(container.querySelector('.ProseMirror')).not.toBeNull()
    })

    // The caret extension is mounted too; a missing collaboration extension
    // would make the caret throw while the editor is created.
    expect(container.querySelector('[data-slot="editor-collaboration-status"]')).not.toBeNull()

    destroy()
  })
})
