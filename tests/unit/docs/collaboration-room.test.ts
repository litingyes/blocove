import { describe, expect, it, vi } from 'vitest'
import { createDemoRoom } from '@/docs/collab/room'

async function createPeers(room: string) {
  const ada = await createDemoRoom({
    room,
    user: { name: 'Ada Lovelace', color: '#2563eb' },
  })
  const alan = await createDemoRoom({
    room,
    user: { name: 'Alan Turing', color: '#059669' },
  })

  return { ada, alan }
}

describe('the in-page demo transport', () => {
  it('syncs document updates between two peers', async () => {
    const { ada, alan } = await createPeers('sync')

    ada.document.getText('probe').insert(0, 'shared text')

    await vi.waitFor(() => {
      expect(alan.document.getText('probe').toString()).toBe('shared text')
    })

    ada.destroy()
    alan.destroy()
  })

  it('syncs a peer that joins after the document was edited', async () => {
    const first = await createDemoRoom({
      room: 'late-joiner',
      user: { name: 'Ada Lovelace', color: '#2563eb' },
    })

    first.document.getText('probe').insert(0, 'written before')
    const late = await createDemoRoom({
      room: 'late-joiner',
      user: { name: 'Alan Turing', color: '#059669' },
    })

    await vi.waitFor(() => {
      expect(late.document.getText('probe').toString()).toBe('written before')
    })

    first.destroy()
    late.destroy()
  })

  it('shares the awareness records so the cursors and avatars can render', async () => {
    const { ada, alan } = await createPeers('awareness')

    await vi.waitFor(() => {
      for (const peer of [ada, alan]) {
        const names = [
          ...peer.provider.awareness!.getStates().values(),
        ]
          .map(state => (state.user as { name?: string }).name)

        expect(names).toContain('Ada Lovelace')
        expect(names).toContain('Alan Turing')
      }
    })

    expect(alan.provider.status).toBe('connected')

    ada.destroy()
    alan.destroy()
  })

  it('removes the departed peer from the awareness', async () => {
    const { ada, alan } = await createPeers('departure')

    await vi.waitFor(() => {
      expect(alan.provider.awareness!.getStates().size).toBe(2)
    })

    ada.destroy()

    await vi.waitFor(() => {
      const names = [
        ...alan.provider.awareness!.getStates().values(),
      ]
        .map(state => (state.user as { name?: string }).name)

      expect(names).not.toContain('Ada Lovelace')
    })

    alan.destroy()
  })
})
