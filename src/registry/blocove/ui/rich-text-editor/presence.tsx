import type { CollaborationProvider, CollaborationUser } from '@/components/blocove/rich-text-editor/collaboration'
import { cn } from 'cn'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

/** The initials shown when a collaborator has no avatar image. */
export function initialsOf(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('')

  return initials || '?'
}

interface PresenceEntry {
  clientId: number
  user: CollaborationUser
}

/**
 * The collaborators currently present, read from the provider's awareness. The
 * state map is external to React, so the entries are copied into state and the
 * subscription keeps them current.
 */
function useCollaborationEntries(provider: CollaborationProvider) {
  const [entries, setEntries] = useState<PresenceEntry[]>([])

  useEffect(() => {
    const awareness = provider.awareness

    if (!awareness) {
      // eslint-disable-next-line react/set-state-in-effect -- Awareness is an external store; its snapshot enters React state once the provider exposes one.
      setEntries([])
      return
    }

    const sync = () => {
      const next: PresenceEntry[] = []

      for (const [clientId, state] of awareness.getStates()) {
        const candidate = state.user

        if (
          candidate
          && typeof candidate === 'object'
          && typeof (candidate as CollaborationUser).name === 'string'
        ) {
          next.push({
            clientId,
            user: candidate as CollaborationUser,
          })
        }
      }

      // eslint-disable-next-line react/set-state-in-effect -- the store lives outside React; the subscription is the only way to mirror it.
      setEntries(next)
    }

    sync()
    awareness.on('change', sync)
    awareness.on('update', sync)

    return () => {
      awareness.off('change', sync)
      awareness.off('update', sync)
    }
  }, [provider])

  return entries
}

export interface EditorPresenceProps {
  /** The connected provider. Its awareness lists the online collaborators. */
  provider: CollaborationProvider
  /** How many avatars to render before the overflow counter. Defaults to 4. */
  max?: number
  className?: string
}

/**
 * The avatar stack of the collaborators currently in the document. It stays
 * empty until a first peer advertises itself through awareness.
 */
export function EditorPresence({
  provider,
  max = 4,
  className,
}: EditorPresenceProps) {
  const entries = useCollaborationEntries(provider)

  if (entries.length === 0) {
    return null
  }

  const visible = entries.slice(0, max)
  const overflow = entries.length - visible.length

  return (
    <div
      data-slot="editor-presence"
      className={cn('flex items-center gap-2', className)}
    >
      <div className="flex items-center -space-x-2">
        {visible.map(({ clientId, user }) => (
          <Avatar
            key={clientId}
            size="sm"
            title={user.name}
            className="ring-2 ring-background"
          >
            {user.avatar
              ? <AvatarImage src={user.avatar} alt={user.name} />
              : null}
            <AvatarFallback
              style={{
                backgroundColor: user.color ?? undefined,
                color: user.color ? '#fff' : undefined,
              }}
            >
              {initialsOf(user.name)}
            </AvatarFallback>
          </Avatar>
        ))}
        {overflow > 0
          ? (
              <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground ring-2 ring-background">
                +
                {overflow}
              </span>
            )
          : null}
      </div>
      <span className="text-xs text-muted-foreground">
        {entries.length === 1
          ? '1 online'
          : `${entries.length} online`}
      </span>
    </div>
  )
}

const statusLabels: Record<string, string> = {
  connected: 'Live',
  connecting: 'Connecting…',
  disconnected: 'Offline',
}

const statusDots: Record<string, string> = {
  connected: 'bg-emerald-500',
  connecting: 'bg-amber-500',
  disconnected: 'bg-muted-foreground',
}

export interface EditorCollaborationStatusProps {
  /** The provider whose connection state is shown. */
  provider: CollaborationProvider
  className?: string
}

/**
 * A compact connection indicator. It reads the initial status from the provider
 * and follows its `status` events, so a demo degrades to "Offline" instead of
 * pretending the document is shared.
 */
export function EditorCollaborationStatus({
  provider,
  className,
}: EditorCollaborationStatusProps) {
  const [status, setStatus] = useState(() => provider.status ?? 'connecting')

  useEffect(() => {
    if (!provider.on || !provider.off) {
      return
    }

    const handleStatus = (payload: { status?: string }) => {
      setStatus(payload.status ?? 'disconnected')
    }

    // A provider method, so it must be called on the provider: Hocuspocus reads
    // its listener registry from `this`.
    provider.on('status', handleStatus)

    return () => provider.off?.('status', handleStatus)
  }, [provider])

  return (
    <span
      data-slot="editor-collaboration-status"
      data-status={status}
      className={cn(
        'inline-flex items-center gap-1.5 text-xs text-muted-foreground',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'size-2 rounded-full',
          statusDots[status] ?? statusDots.disconnected,
        )}
      />
      {statusLabels[status] ?? status}
    </span>
  )
}
