import { cn } from 'cn'
import { PlayIcon } from 'lucide-react'
import { useState } from 'react'
import { VideoMedia, VideoPlayer } from '@/components/blocove/media/video'
import { ScrollArea } from '@/components/ui/scroll-area'

/** One entry in the playlist. */
export interface VideoPlaylistItem {
  /** Stable identifier, used as the React key and the selection value. */
  id: string
  /** Episode title. */
  title: string
  /** The video source. */
  src: string
  /** The poster shown before playback. */
  poster?: string
  /** A human readable duration, for example `12:40`. */
  duration?: string
  /** A short description shown under the player for the active entry. */
  description?: string
}

export interface VideoPlaylistProps {
  /** The entries, played in order. */
  items: VideoPlaylistItem[]
  /** The entry selected on first render. Defaults to the first one. */
  defaultId?: string
  className?: string
}

/**
 * A video with a playlist: the player on the left, the episodes on the right.
 * Selecting an episode swaps the media and the title; the player itself is
 * never recreated, only the media element it plays.
 */
export function VideoPlaylist({
  items,
  defaultId,
  className,
}: VideoPlaylistProps) {
  const [activeId, setActiveId] = useState(defaultId ?? items[0]?.id)
  const active = items.find(item => item.id === activeId) ?? items[0]

  if (!active) {
    return null
  }

  return (
    <div
      data-slot="video-playlist"
      className={cn(
        'grid w-full gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-3">
        <VideoPlayer title={active.title} poster={active.poster}>
          <VideoMedia key={active.id} src={active.src} />
        </VideoPlayer>

        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold tracking-tight">
            {active.title}
          </h3>
          {active.description
            ? (
                <p className="text-sm text-muted-foreground">
                  {active.description}
                </p>
              )
            : null}
        </div>
      </div>

      <ScrollArea className="max-h-80 rounded-lg border">
        <ul aria-label="Playlist" className="flex flex-col gap-1 p-1">
          {items.map((item, index) => {
            const isActive = item.id === active.id

            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-current={isActive ? 'true' : undefined}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-md px-2.5 py-2 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50',
                    isActive && 'bg-muted',
                  )}
                  onClick={() => setActiveId(item.id)}
                >
                  <span className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium">
                      {item.title}
                    </span>
                    {item.duration
                      ? (
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {item.duration}
                          </span>
                        )
                      : null}
                  </span>

                  {isActive
                    ? <PlayIcon className="mt-0.5 size-4 shrink-0" />
                    : null}
                </button>
              </li>
            )
          })}
        </ul>
      </ScrollArea>
    </div>
  )
}
