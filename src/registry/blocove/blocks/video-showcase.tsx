import type { ReactNode } from 'react'
import type { MediaTrack } from '@/components/blocove/media/tracks'
import { cn } from 'cn'
import { VideoMedia, VideoPlayer } from '@/components/blocove/media/video'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export interface VideoShowcaseProps {
  /** The video source. */
  src: string
  /** The poster shown before playback starts. */
  poster?: string
  /** The title, shown above the player and reported to its interface. */
  title: string
  /** Small label above the title, for example the series or category. */
  eyebrow?: string
  /** A short description below the title. */
  description?: string
  /** Small facts rendered as badges, for example a duration or a date. */
  meta?: string[]
  /** Text tracks rendered inside the media element. */
  tracks?: MediaTrack[]
  /** Extra actions rendered next to the meta row, usually buttons. */
  actions?: ReactNode
  className?: string
}

/**
 * A captioned video: the player, then the title, description and facts that
 * give it context. Use it for a video inside an article, a course or a
 * changelog entry.
 */
export function VideoShowcase({
  src,
  poster,
  title,
  eyebrow,
  description,
  meta,
  tracks,
  actions,
  className,
}: VideoShowcaseProps) {
  const hasFooter = Boolean(meta?.length) || Boolean(actions)
  const hasCaption = Boolean(eyebrow) || Boolean(description)

  return (
    <figure
      data-slot="video-showcase"
      className={cn('flex w-full max-w-2xl flex-col gap-4', className)}
    >
      <VideoPlayer title={title} poster={poster}>
        <VideoMedia src={src} tracks={tracks} />
      </VideoPlayer>

      {(hasCaption || hasFooter)
        ? (
            <figcaption className="flex flex-col gap-3">
              {hasCaption
                ? (
                    <div className="flex flex-col gap-1.5">
                      {eyebrow
                        ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{eyebrow}</Badge>
                            </div>
                          )
                        : null}
                      <h3 className="text-base font-semibold tracking-tight sm:text-lg">
                        {title}
                      </h3>
                      {description
                        ? (
                            <p className="text-sm text-muted-foreground">
                              {description}
                            </p>
                          )
                        : null}
                    </div>
                  )
                : null}

              {hasFooter
                ? (
                    <>
                      <Separator />
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {meta?.map(item => (
                            <Badge key={item} variant="outline">
                              {item}
                            </Badge>
                          ))}
                        </div>
                        {actions
                          ? (
                              <div className="flex items-center gap-2">
                                {actions}
                              </div>
                            )
                          : null}
                      </div>
                    </>
                  )
                : null}
            </figcaption>
          )
        : null}
    </figure>
  )
}
