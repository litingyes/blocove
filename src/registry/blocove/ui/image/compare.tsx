import type { ImageTransform } from '@/components/blocove/image/image'
import { cn } from 'cn'
import { MoveHorizontalIcon } from 'lucide-react'
import { useState } from 'react'
import { Image } from '@/components/blocove/image/image'

export interface ImageCompareSide {
  /** The source of this side. */
  src: string
  /** Alternative text of this side. */
  alt: string
}

export interface ImageCompareProps {
  /** The image revealed on the left. */
  before: ImageCompareSide
  /** The image revealed on the right. */
  after: ImageCompareSide
  /** Label under the left edge. */
  beforeLabel?: string
  /** Label under the right edge. */
  afterLabel?: string
  /** The split position on first render, from 0 to 100. */
  defaultPosition?: number
  /** Aspect ratio of the stage. */
  aspectRatio?: number | string
  /** Widths both images request. */
  widths?: readonly number[]
  /** Turns a source and a width into the URL that serves it. */
  transform?: ImageTransform
  /** Layout sizes, shared by both images. */
  sizes?: string
  /** Accessible name of the range input. */
  rangeLabel?: string
  /** Extra classes for the figure. */
  className?: string
}

function clampPosition(value: number): number {
  if (!Number.isFinite(value)) {
    return 50
  }

  return Math.min(Math.max(value, 0), 100)
}

/**
 * A before/after comparison: the two images share one layout-stable stage, the
 * left one is clipped at the split, and a real range input drives the split, so
 * the control works with a mouse, a keyboard and a screen reader.
 */
export function ImageCompare({
  before,
  after,
  beforeLabel = 'Before',
  afterLabel = 'After',
  defaultPosition = 50,
  aspectRatio = '16 / 9',
  widths,
  transform,
  sizes,
  rangeLabel = 'Comparison position',
  className,
}: ImageCompareProps) {
  const [position, setPosition] = useState(() => clampPosition(defaultPosition))

  return (
    <figure
      data-slot="image-compare"
      className={cn('flex w-full flex-col gap-2', className)}
    >
      <div
        className="relative w-full overflow-hidden rounded-lg border bg-muted"
        style={{ aspectRatio }}
      >
        <div
          data-slot="image-compare-before"
          className="absolute inset-0 z-10"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <Image
            alt={before.alt}
            src={before.src}
            transform={transform}
            widths={widths}
            sizes={sizes}
            containerClassName="h-full w-full"
          />
        </div>

        <div className="absolute inset-0">
          <Image
            alt={after.alt}
            src={after.src}
            transform={transform}
            widths={widths}
            sizes={sizes}
            containerClassName="h-full w-full"
          />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 z-20 w-px -translate-x-1/2 bg-background shadow-[0_0_0_1px_var(--color-border)]"
          style={{ left: `${position}%` }}
        >
          <span className="absolute top-1/2 left-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm">
            <MoveHorizontalIcon className="size-4" />
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{beforeLabel}</span>
        <span>{afterLabel}</span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={position}
        aria-label={rangeLabel}
        aria-valuetext={`${position}%`}
        onChange={event => setPosition(clampPosition(Number(event.target.value)))}
        className="w-full cursor-ew-resize accent-foreground"
      />
    </figure>
  )
}
