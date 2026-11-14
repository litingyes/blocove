import type { CollaborationProvider } from '@/components/blocove/rich-text-editor/collaboration'
import { act, render, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  EditorCollaborationStatus,
  EditorPresence,
  initialsOf,
} from '@/components/blocove/rich-text-editor/presence'
import { createFakeProvider } from '../../helpers/collaboration'

function seedUsers(
  awareness: ReturnType<typeof createFakeProvider>['awareness'],
  users: { name: string, color?: string }[],
) {
  users.forEach((user, index) => {
    awareness.states.set(index + 1, { user })
  })
}

describe('initialsOf', () => {
  it('takes the first letter of the first two words', () => {
    expect(initialsOf('Ada Lovelace')).toBe('AL')
    expect(initialsOf('Grace Brewster Hopper')).toBe('GB')
  })

  it('handles a single word and an empty name', () => {
    expect(initialsOf('Ada')).toBe('A')
    expect(initialsOf('   ')).toBe('?')
  })
})

describe('editorPresence', () => {
  it('lists the collaborators advertised through awareness', () => {
    const { awareness, provider, destroy } = createFakeProvider()
    seedUsers(awareness, [
      { name: 'Ada Lovelace', color: '#2563eb' },
      { name: 'Alan Turing', color: '#059669' },
    ])

    const { container } = render(<EditorPresence provider={provider} />)

    expect(container.querySelectorAll('[data-slot="avatar"]')).toHaveLength(2)
    expect(container.textContent).toContain('2 online')
    expect(container.textContent).toContain('AL')
    expect(container.textContent).toContain('AT')

    destroy()
  })

  it('renders nothing without a single collaborator', () => {
    const { provider, destroy } = createFakeProvider()
    const { container } = render(<EditorPresence provider={provider} />)

    expect(container.querySelector('[data-slot="editor-presence"]')).toBeNull()

    destroy()
  })

  it('ignores awareness entries that carry no user record', () => {
    const { awareness, provider, destroy } = createFakeProvider()
    awareness.states.set(1, {
      cursor: { anchor: 0, head: 0 },
    })
    awareness.states.set(2, {
      user: { name: 42 },
    })

    const { container } = render(<EditorPresence provider={provider} />)

    expect(container.querySelector('[data-slot="editor-presence"]')).toBeNull()

    destroy()
  })

  it('caps the avatar stack and counts the overflow', () => {
    const { awareness, provider, destroy } = createFakeProvider()
    seedUsers(awareness, [
      { name: 'Ada Lovelace' },
      { name: 'Alan Turing' },
      { name: 'Grace Hopper' },
      { name: 'Katherine Johnson' },
      { name: 'Margaret Hamilton' },
    ])

    const { container } = render(<EditorPresence provider={provider} max={2} />)

    expect(container.querySelectorAll('[data-slot="avatar"]')).toHaveLength(2)
    expect(container.textContent).toContain('+3')
    expect(container.textContent).toContain('5 online')

    destroy()
  })

  it('follows awareness changes and detaches on unmount', async () => {
    const { awareness, provider, destroy } = createFakeProvider()
    const removeListener = vi.spyOn(awareness, 'off')
    const { container, unmount } = render(<EditorPresence provider={provider} />)

    awareness.states.set(7, {
      user: { name: 'Ada Lovelace' },
    })

    act(() => {
      awareness.emit('change', [
        {
          added: [7],
          updated: [],
          removed: [],
        },
        'test',
      ])
    })

    await waitFor(() => {
      expect(container.textContent).toContain('1 online')
    })

    unmount()

    expect(removeListener).toHaveBeenCalledWith('change', expect.any(Function))
    expect(removeListener).toHaveBeenCalledWith('update', expect.any(Function))

    destroy()
  })

  it('renders nothing when the provider has no awareness yet', () => {
    const { provider, destroy } = createFakeProvider({ withAwareness: false })
    const { container } = render(<EditorPresence provider={provider} />)

    expect(container.querySelector('[data-slot="editor-presence"]')).toBeNull()

    destroy()
  })

  it('keeps the avatar fallback for a user without an image', () => {
    const { awareness, provider, destroy } = createFakeProvider()
    seedUsers(awareness, [
      { name: 'Ada Lovelace', color: '#2563eb' },
    ])

    const { container } = render(<EditorPresence provider={provider} />)

    expect(container.querySelector('[data-slot="avatar-fallback"]')?.textContent).toBe('AL')

    destroy()
  })
})

describe('editorCollaborationStatus', () => {
  it('starts from the provider status and follows its events', async () => {
    const { provider, emitStatus, destroy, listenerCount } = createFakeProvider()
    const { container } = render(<EditorCollaborationStatus provider={provider} />)

    expect(container.textContent).toContain('Live')

    act(() => emitStatus('connecting'))

    await waitFor(() => {
      expect(container.textContent).toContain('Connecting…')
    })

    act(() => emitStatus('disconnected'))

    await waitFor(() => {
      expect(container.textContent).toContain('Offline')
    })

    expect(listenerCount()).toBe(1)

    destroy()
  })

  it('detaches the status listener on unmount', () => {
    const { provider, destroy, listenerCount } = createFakeProvider()
    const { unmount } = render(<EditorCollaborationStatus provider={provider} />)

    expect(listenerCount()).toBe(1)

    unmount()

    expect(listenerCount()).toBe(0)

    destroy()
  })

  it('falls back to the raw status label, then to offline', async () => {
    let handler: ((payload: { status?: string }) => void) | undefined
    const provider: CollaborationProvider = {
      awareness: null,
      status: 'syncing',
      on: (_event, listener) => {
        handler = listener
      },
      off: () => {},
    }
    const { container } = render(<EditorCollaborationStatus provider={provider} />)

    expect(container.textContent).toContain('syncing')

    act(() => handler?.({}))

    await waitFor(() => {
      expect(container.textContent).toContain('Offline')
    })
  })

  it('stays static when the provider cannot report a status', () => {
    const provider: CollaborationProvider = { awareness: null, status: 'connecting' }
    const { container } = render(<EditorCollaborationStatus provider={provider} />)

    expect(container.textContent).toContain('Connecting…')
  })

  it('treats a missing event hook as a static provider', () => {
    const provider: CollaborationProvider = { awareness: null, status: 'connected' }
    const { container } = render(<EditorCollaborationStatus provider={provider} />)

    expect(container.textContent).toContain('Live')
  })
})
