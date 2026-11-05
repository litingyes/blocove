import type { ReactNode } from 'react'
import { cn } from 'cn'
import { AmbientVideo } from '@/components/blocove/media/ambient-video'
import { Badge } from '@/components/ui/badge'

export interface VideoHeroProps {
  /** The ambient video source. Keep it short and loopable. */
  src: string
  /** Image shown before the first frame is available. */
  poster?: string
  /** Small label above the headline, for example the section or campaign. */
  eyebrow?: string
  /** The headline drawn over the video. */
  title: string
  /** Supporting copy below the headline. */
  description?: string
  /** Calls to action, usually buttons. */
  actions?: ReactNode
  className?: string
}

/**
 * A hero section with ambient video: the clip loops behind a dark gradient so
 * the headline stays readable, and the content sits on top of it. The video is
 * decorative, so the headline carries the meaning.
 */
export function VideoHero({
  src,
  poster,
  eyebrow,
  title,
  description,
  actions,
  className,
}: VideoHeroProps) {
  return (
    <section
      data-slot="video-hero"
      className={cn(
        'relative isolate w-full overflow-hidden rounded-xl border bg-black',
        className,
      )}
    >
      <AmbientVideo
        src={src}
        poster={poster}
        aspectRatio="auto"
        className="absolute inset-0"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-black/85 via-black/45 to-black/10"
      />

      <div className="relative flex min-h-72 flex-col items-start justify-end gap-3 p-6 text-white sm:min-h-88 sm:p-10">
        {eyebrow
          ? (
              <Badge
                variant="secondary"
                className="border-white/20 bg-white/15 text-white"
              >
                {eyebrow}
              </Badge>
            )
          : null}

        <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </h2>

        {description
          ? (
              <p className="max-w-xl text-sm text-white/80 sm:text-base">
                {description}
              </p>
            )
          : null}

        {actions
          ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {actions}
              </div>
            )
          : null}
      </div>
    </section>
  )
}
