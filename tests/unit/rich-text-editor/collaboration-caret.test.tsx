import { describe, expect, it } from 'vitest'
import {
  EditorCollaboration,
} from '@/components/blocove/rich-text-editor/collaboration'
import {
  EditorCollaborationCaret,
  renderCollaborationCaret,
  renderCollaborationSelection,
} from '@/components/blocove/rich-text-editor/collaboration-caret'
import { createFakeProvider } from '../../helpers/collaboration'
import { renderRichTextEditor } from '../../helpers/render-rich-text-editor'

describe('editorCollaborationCaret', () => {
  it('registers the caret extension next to collaboration', async () => {
    const { provider, document } = createFakeProvider()
    const { editor } = await renderRichTextEditor({
      content: '<p>Shared</p>',
      extensions: (
        <>
          <EditorCollaboration document={document} />
          <EditorCollaborationCaret
            provider={provider}
            user={{ name: 'Ada Lovelace', color: '#2563eb' }}
          />
        </>
      ),
    })

    expect(
      editor.extensionManager.extensions.some(
        extension => extension.name === 'collaborationCaret',
      ),
    ).toBe(true)
  })

  it('publishes the local user and the remote users through awareness', async () => {
    const { provider, awareness, document } = createFakeProvider()
    const { editor } = await renderRichTextEditor({
      content: '<p>Shared</p>',
      extensions: (
        <>
          <EditorCollaboration document={document} />
          <EditorCollaborationCaret
            provider={provider}
            user={{ name: 'Ada Lovelace', color: '#2563eb' }}
          />
        </>
      ),
    })

    awareness.states.set(99, {
      user: { name: 'Alan Turing', color: '#059669' },
      cursor: { anchor: 1, head: 1 },
    })
    awareness.emit('update', [
      {
        added: [99],
        updated: [],
        removed: [],
      },
      'remote',
    ])

    const users = (editor.storage.collaborationCaret as {
      users: { clientId: number }[]
    }).users

    expect(users).toHaveLength(2)
    expect(
      (awareness.getLocalState() as { user?: { name?: string } }).user?.name,
    ).toBe('Ada Lovelace')
    expect(users.some(user => user.clientId === 99)).toBe(true)
  })

  it('requires the provider and its awareness', () => {
    expect(() =>
      EditorCollaborationCaret.extension(
        {} as { provider: never, user: never },
      ),
    ).toThrow(/requires the provider/)

    expect(() =>
      EditorCollaborationCaret.extension({
        provider: { awareness: null },
        user: { name: 'Ada' },
      } as never),
    ).toThrow(/requires awareness/)
  })
})

describe('renderCollaborationCaret', () => {
  it('draws a caret with the collaborator colour and name', () => {
    const caret = renderCollaborationCaret({ name: 'Ada', color: '#123456' })

    expect(caret.textContent).toBe('Ada')
    expect(caret.style.borderLeft).toContain('2px solid')
    expect(caret.style.borderLeft).toContain('#123456')
    expect(caret.querySelector('.collaboration-carets__label')).not.toBeNull()
  })

  it('falls back to an anonymous label and the default colour', () => {
    const caret = renderCollaborationCaret({ name: '   ' })
    const label = caret.firstElementChild as HTMLElement

    expect(caret.textContent).toBe('Anonymous')
    expect(caret.style.borderLeft).toContain('#3b82f6')
    expect(label.style.backgroundColor).not.toBe('')
  })
})

describe('renderCollaborationSelection', () => {
  it('uses the collaborator colour at low opacity', () => {
    const selection = renderCollaborationSelection({
      name: 'Ada',
      color: '#123456',
    })

    expect(selection).toEqual({
      'nodeName': 'span',
      'class': 'collaboration-carets__selection',
      'style': 'background-color: #12345633',
      'data-user': 'Ada',
    })
  })

  it('falls back for a missing name and colour', () => {
    const selection = renderCollaborationSelection({})

    expect(selection.style).toContain('#3b82f633')
    expect(selection['data-user']).toBe('Anonymous')
  })
})
