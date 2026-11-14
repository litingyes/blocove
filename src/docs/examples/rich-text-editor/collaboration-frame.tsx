import type { ReactNode } from 'react'
import type { DemoRoom, DemoRoomUser } from '@/docs/collab/room'
import { useEffect, useState } from 'react'
import { createDemoRoom } from '@/docs/collab/room'

const demoUsers: DemoRoomUser[] = [
  { name: 'Ada Lovelace', color: '#2563eb' },
  { name: 'Alan Turing', color: '#059669' },
]

export interface CollaborationPaneState {
  index: number
  user: DemoRoomUser
  document: DemoRoom['document']
  provider: DemoRoom['provider']
}

export interface CollaborationDemoProps {
  /** Renders the editor of one pane with that pane's room. */
  children: (pane: CollaborationPaneState) => ReactNode
}

/**
 * The shared preview of the collaboration pages: two peers side by side, each
 * with its own Yjs document and provider, joined to the same room. The editors
 * start empty because the shared document is the source of truth; typing in
 * either pane shows up in the other one.
 */
export function CollaborationDemo({ children }: CollaborationDemoProps) {
  const [rooms, setRooms] = useState<DemoRoom[] | null>(null)

  useEffect(() => {
    // The room and the providers only exist on the client: a Yjs document has
    // no server-side rendering story.
    let active = true
    let created: DemoRoom[] = []

    void Promise.all(
      demoUsers.map(user => createDemoRoom({ room: 'playground', user })),
    ).then((rooms) => {
      if (!active) {
        for (const room of rooms) {
          room.destroy()
        }

        return
      }

      created = rooms
      setRooms(rooms)
    })

    return () => {
      active = false

      for (const room of created) {
        room.destroy()
      }
    }
  }, [])

  if (!rooms) {
    return (
      <div className="grid w-full gap-4 md:grid-cols-2" aria-hidden>
        {demoUsers.map(user => (
          <div
            key={user.name}
            className="h-52 rounded-lg border border-dashed border-border"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid w-full gap-4 md:grid-cols-2">
      {rooms.map((room, index) => {
        const user = demoUsers[index]

        return (
          <div key={user.name} className="flex min-w-0 flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span
                aria-hidden
                className="size-2 rounded-full"
                style={{ backgroundColor: user.color }}
              />
              {user.name}
            </div>
            {children({
              index,
              user,
              document: room.document,
              provider: room.provider,
            })}
          </div>
        )
      })}
    </div>
  )
}
