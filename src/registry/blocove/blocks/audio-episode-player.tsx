import type { ReactNode } from 'react'
import { cn } from 'cn'
import { AudioMedia, AudioPlayer } from '@/components/blocove/media/audio'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export interface AudioEpisodePlayerProps {
  /** The episode audio source. */
  src: string
  /** The episode title, shown in the header and reported to the player. */
  title: string
  /** The show or author the episode belongs to. */
  show?: string
  /** Square cover art; it also becomes the player poster. */
  cover?: string
  /** Episode number, rendered as a badge. */
  episode?: number
  /** A short summary below the player. */
  description?: string
  /** A human readable duration, for example `42 min`. */
  duration?: string
  /** A human readable publish date. */
  publishedAt?: string
  /** Extra actions rendered below the player, usually buttons. */
  actions?: ReactNode
  className?: string
}

/**
 * An episode player: cover art, title, show and facts in the header, the audio
 * player below and the episode actions at the bottom. Built for podcast and
 * audiobook episode lists.
 */
export function AudioEpisodePlayer({
  src,
  title,
  show,
  cover,
  episode,
  description,
  duration,
  publishedAt,
  actions,
  className,
}: AudioEpisodePlayerProps) {
  const hasFacts = Boolean(episode) || Boolean(publishedAt) || Boolean(duration)

  return (
    <article
      data-slot="audio-episode-player"
      className={cn(
        'flex w-full max-w-2xl flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground sm:p-5',
        className,
      )}
    >
      <div className="flex items-center gap-4">
        {cover
          ? (
              <img
                alt=""
                className="size-16 shrink-0 rounded-lg object-cover sm:size-20"
                height={160}
                loading="lazy"
                src={cover}
                width={160}
              />
            )
          : null}

        <div className="flex min-w-0 flex-col gap-1.5">
          {hasFacts
            ? (
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {episode
                    ? <Badge variant="secondary">{`Ep. ${episode}`}</Badge>
                    : null}
                  {publishedAt
                    ? <span>{publishedAt}</span>
                    : null}
                  {duration
                    ? (
                        <span className="tabular-nums">
                          {duration}
                        </span>
                      )
                    : null}
                </div>
              )
            : null}

          <h3 className="truncate text-base font-semibold tracking-tight">
            {title}
          </h3>

          {show
            ? (
                <p className="truncate text-sm text-muted-foreground">
                  {show}
                </p>
              )
            : null}
        </div>
      </div>

      <AudioPlayer title={title} poster={cover}>
        <AudioMedia src={src} />
      </AudioPlayer>

      {description
        ? (
            <>
              <Separator />
              <p className="text-sm text-muted-foreground">{description}</p>
            </>
          )
        : null}

      {actions
        ? (
            <div className="flex flex-wrap items-center gap-2">
              {actions}
            </div>
          )
        : null}
    </article>
  )
}
