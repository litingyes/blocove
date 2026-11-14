import type {
  CollaborationProvider,
  CollaborationUser,
} from '@/components/blocove/rich-text-editor/collaboration'
import {
  applyAwarenessUpdate,
  Awareness,
  encodeAwarenessUpdate,
} from 'y-protocols/awareness'
import * as Y from 'yjs'

/** A peer of the docs demo. The colour drives the cursor and the avatar. */
export interface DemoRoomUser extends CollaborationUser {
  name: string
  color: string
}

export interface DemoRoom {
  document: Y.Doc
  provider: CollaborationProvider
  destroy: () => void
}

type RoomMessage
  = | { type: 'sync-request' }
    | { type: 'sync-state', update: Uint8Array }
    | { type: 'update', update: Uint8Array }
    | { type: 'awareness', update: Uint8Array }

// Updates this tab applies from the wire carry this origin, so the listeners
// below do not echo them back and loop.
const remoteOrigin = 'blocove-docs:remote'

const roomPrefix = 'blocove-docs-'

/**
 * The zero-infrastructure transport used by the site: every tab on the same
 * origin joins the room through a BroadcastChannel. It runs the same Yjs
 * updates and awareness protocol a websocket provider does, so the demo is a
 * real collaboration, not a replay.
 */
function createBroadcastChannelRoom(
  room: string,
  user: DemoRoomUser,
): DemoRoom {
  const document = new Y.Doc()
  const awareness = new Awareness(document)

  const channel = new BroadcastChannel(`${roomPrefix}${room}`)

  const post = (message: RoomMessage) => channel.postMessage(message)

  const postAwareness = (clients: number[]) => {
    if (clients.length === 0) {
      return
    }

    post({
      type: 'awareness',
      update: encodeAwarenessUpdate(awareness, clients),
    })
  }

  channel.onmessage = (event: MessageEvent<RoomMessage>) => {
    const message = event.data

    switch (message.type) {
      case 'sync-request':
        post({
          type: 'sync-state',
          update: Y.encodeStateAsUpdate(document),
        })
        postAwareness([document.clientID])
        break
      case 'sync-state':
      case 'update':
        Y.applyUpdate(document, message.update, remoteOrigin)
        break
      case 'awareness':
        applyAwarenessUpdate(awareness, message.update, remoteOrigin)
        break
    }
  }

  const handleUpdate = (update: Uint8Array, origin: unknown) => {
    if (origin === remoteOrigin) {
      return
    }

    post({ type: 'update', update })
  }

  const handleAwareness = (
    changes: { added: number[], updated: number[], removed: number[] },
    origin: unknown,
  ) => {
    if (origin === remoteOrigin) {
      return
    }

    postAwareness([
      ...changes.added,
      ...changes.updated,
      ...changes.removed,
    ])
  }

  document.on('update', handleUpdate)
  awareness.on('update', handleAwareness)

  // Publish our own presence only once the listener above is attached, so the
  // first state reaches the peers too. A peer that was already in the room
  // learns about us here; a peer that joins later gets it from the answer to
  // its sync request.
  awareness.setLocalStateField('user', user)

  // Ask the peers that are already in the room for their state; they answer
  // with a sync-state and their awareness.
  post({ type: 'sync-request' })

  return {
    document,
    provider: {
      awareness,
      status: 'connected',
      on: () => {},
      off: () => {},
    },
    destroy() {
      // Marking the local state offline makes the peers drop the cursor and the
      // avatar before the channel closes.
      awareness.setLocalState(null)
      document.off('update', handleUpdate)
      awareness.off('update', handleAwareness)
      channel.close()
      document.destroy()
    },
  }
}

/**
 * The production transport used by the site when `VITE_COLLAB_URL` is set: a
 * real Hocuspocus server, the same one an app would deploy.
 *
 * The provider is imported on demand. The public site never sets the URL, so
 * the websocket client stays out of the docs bundle instead of shipping to
 * every visitor.
 */
async function createHocuspocusRoom(
  url: string,
  room: string,
  user: DemoRoomUser,
): Promise<DemoRoom> {
  const { HocuspocusProvider } = await import('@hocuspocus/provider')
  const document = new Y.Doc()
  const provider = new HocuspocusProvider({ url, name: room, document })
  provider.setAwarenessField('user', user)

  return {
    document,
    provider: provider as unknown as CollaborationProvider,
    destroy() {
      provider.destroy()
      document.destroy()
    },
  }
}

// Set it in `.env.local` or the deploy environment to demo against a real
// Hocuspocus server; without it the site syncs tabs through BroadcastChannel.
const collaborationServerUrl = import.meta.env.VITE_COLLAB_URL as string | undefined

export function createDemoRoom({
  room,
  user,
}: {
  room: string
  user: DemoRoomUser
}): Promise<DemoRoom> {
  const url = collaborationServerUrl?.trim()

  return url
    ? createHocuspocusRoom(url, `${roomPrefix}${room}`, user)
    : Promise.resolve(createBroadcastChannelRoom(room, user))
}
