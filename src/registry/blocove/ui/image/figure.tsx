import type { ReactNode } from 'react'
import type { ImageProps } from '@/components/blocove/image/image'
import { cn } from 'cn'
import { Image } from '@/components/blocove/image/image'

export interface ImageFigureProps extends Omit<ImageProps, 'className' | 'containerClassName'> {
  /** Classes for the figure. */
  className?: string
  /** Classes for the image itself. */
  imageClassName?: string
  /** The caption rendered under the image. */
  caption?: ReactNode
  /** The attribution rendered opposite the caption. */
  credit?: ReactNode
}

/**
 * An image with an editorial caption. The figure keeps the caption and the
 * credit on one baseline, and the image keeps every `Image` behaviour: reserved
 * space, srcset, focal point, placeholder and fallback.
 */
export function ImageFigure({
  className,
  imageClassName,
  caption,
  credit,
  ...imageProps
}: ImageFigureProps) {
  return (
    <figure
      data-slot="image-figure"
      className={cn('flex w-full flex-col gap-2', className)}
    >
      <Image {...imageProps} className={imageClassName} />

      {caption || credit
        ? (
            <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {caption
                ? <span>{caption}</span>
                : <span />}
              {credit
                ? <span className="text-muted-foreground/80">{credit}</span>
                : null}
            </figcaption>
          )
        : null}
    </figure>
  )
}
