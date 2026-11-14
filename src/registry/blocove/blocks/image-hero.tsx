import type { ReactNode } from 'react'
import type { ImageTransform } from '@/components/blocove/image/image'
import { cn } from 'cn'
import { Image } from '@/components/blocove/image/image'
import { Badge } from '@/components/ui/badge'

export interface ImageHeroProps {
  /** The image source. */
  src: string
  /** Alternative text for the image. */
  alt: string
  /** The headline drawn over the image. */
  title: string
  /** A small label above the headline, for example the series or the mission. */
  eyebrow?: string
  /** Supporting copy under the headline. */
  description?: string
  /** Calls to action rendered under the copy, usually buttons or links. */
  actions?: ReactNode
  /** Whether the image is the largest contentful element. Defaults to true. */
  priority?: boolean
  /** Aspect ratio of the section. */
  aspectRatio?: number | string
  /** Widths the image requests. */
  widths?: readonly number[]
  /** Turns a source and a width into the URL that serves it. */
  transform?: ImageTransform
  /** Layout sizes of the image. */
  sizes?: string
  /** Extra classes for the section. */
  className?: string
}

/**
 * A hero with a photograph behind it: the image is the surface, a gradient keeps
 * the copy legible, and the eyebrow, headline, description and actions sit in
 * the lower left corner. The image is a priority image by default, because a
 * hero usually owns the largest contentful paint.
 */
export function ImageHero({
  src,
  alt,
  title,
  eyebrow,
  description,
  actions,
  priority = true,
  aspectRatio = '16 / 9',
  widths,
  transform,
  sizes = '100vw',
  className,
}: ImageHeroProps) {
  return (
    <section
      data-slot="image-hero"
      className={cn(
        'relative isolate flex w-full overflow-hidden rounded-xl bg-muted text-white',
        className,
      )}
      style={{ aspectRatio }}
    >
      <div className="absolute inset-0 -z-10">
        <Image
          alt={alt}
          priority={priority}
          sizes={sizes}
          src={src}
          transform={transform}
          widths={widths}
          className="h-full w-full"
          containerClassName="h-full w-full"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/35 to-black/10"
      />

      <div className="mt-auto flex max-w-xl flex-col gap-3 p-6 sm:p-10">
        {eyebrow
          ? (
              <Badge variant="secondary" className="w-fit">
                {eyebrow}
              </Badge>
            )
          : null}
        <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </h2>
        {description
          ? (
              <p className="max-w-lg text-sm text-white/80 sm:text-base">
                {description}
              </p>
            )
          : null}
        {actions
          ? (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {actions}
              </div>
            )
          : null}
      </div>
    </section>
  )
}
