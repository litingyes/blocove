import type { CollaborationProvider } from '@/components/blocove/rich-text-editor/collaboration'
import { Awareness } from 'y-protocols/awareness'
import * as Y from 'yjs'

export interface FakeCollaborationProvider {
  provider: CollaborationProvider
  awareness: Awareness
  document: Y.Doc
  /** Push a `status` event, like a websocket provider would. */
  emitStatus: (status: string) => void
  /** How many status listeners are currently attached. */
  listenerCount: () => number
  /** Stop the awareness timers the instance started. */
  destroy: () => void
}

/**
 * A provider stand-in for the unit tests: it carries a real awareness instance
 * and a real Yjs document, but no transport. It mirrors the slice of a
 * Hocuspocus provider the items read.
 */
export function createFakeProvider(options: {
  withAwareness?: boolean
  status?: string
} = {}): FakeCollaborationProvider {
  const document = new Y.Doc()
  const awareness = new Awareness(document)
  const listeners = new Set<(payload: { status: string }) => void>()
  const withAwareness = options.withAwareness ?? true

  return {
    document,
    awareness,
    provider: {
      awareness: withAwareness ? awareness : null,
      status: options.status ?? 'connected',
      on: (_event, handler) => {
        listeners.add(handler)
      },
      off: (_event, handler) => {
        listeners.delete(handler)
      },
    },
    emitStatus(status: string) {
      for (const listener of listeners) {
        listener({ status })
      }
    },
    listenerCount: () => listeners.size,
    destroy() {
      document.destroy()
      awareness.destroy()
    },
  }
}
