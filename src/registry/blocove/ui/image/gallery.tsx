import type { KeyboardEvent, ReactNode } from 'react'
import type { ImageTransform } from '@/components/blocove/image/image'
import { cn } from 'cn'
import { useRef, useState } from 'react'
import { Image } from '@/components/blocove/image/image'
import { ImageZoom } from '@/components/blocove/image/zoom'
import { Button } from '@/components/ui/button'

export interface ImageGalleryItem {
  /** The full-size source. */
  src: string
  /** Alternative text, also the thumbnail's accessible name. */
  alt: string
  /** The smaller source shown in the thumbnail grid; defaults to `src`. */
  thumbnailSrc?: string
  /** Caption rendered under the selected preview. */
  caption?: ReactNode
}

export interface ImageGalleryProps {
  /** The images, in reading order. */
  images: readonly ImageGalleryItem[]
  /** The image selected on first render. */
  defaultIndex?: number
  /** Thumbnail columns at the narrowest breakpoint. */
  columns?: 2 | 3 | 4
  /** Aspect ratio of the selected preview. */
  aspectRatio?: number | string
  /** Widths the selected preview requests. */
  widths?: readonly number[]
  /** Turns a source and a width into the URL that serves it. */
  transform?: ImageTransform
  /** Layout sizes for the selected preview. */
  sizes?: string
  /** Accessible name of the thumbnail group. */
  label?: string
  /** Extra classes for the gallery. */
  className?: string
}

const columnClasses: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

function clampIndex(index: number, length: number): number {
  if (!Number.isFinite(index) || length <= 0) {
    return 0
  }

  return Math.min(Math.max(Math.trunc(index), 0), length - 1)
}

/**
 * A selected image with a thumbnail grid. The preview keeps the zoom behaviour,
 * and the grid is a roving-focus group: arrow keys, Home and End move the
 * selection and the focus together, and the current thumbnail carries
 * `aria-current`.
 */
export function ImageGallery({
  images,
  defaultIndex = 0,
  columns = 3,
  aspectRatio,
  widths,
  transform,
  sizes,
  label = 'Image gallery',
  className,
}: ImageGalleryProps) {
  const [selected, setSelected] = useState(() => clampIndex(defaultIndex, images.length))
  const buttonRef = useRef<Array<HTMLElement | null>>([])

  if (images.length === 0) {
    return null
  }

  const active = clampIndex(selected, images.length)
  const current = images[active]

  function moveTo(index: number) {
    setSelected(index)
    buttonRef.current[index]?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // Move from the thumbnail the user is on, not from the selection: they can
    // tab to another thumbnail before pressing an arrow.
    const focusedButton = event.target instanceof HTMLElement
      ? event.target.closest('button')
      : null
    const focusedIndex = focusedButton
      ? buttonRef.current.indexOf(focusedButton)
      : -1
    const base = focusedIndex >= 0
      ? focusedIndex
      : active
    let next: number

    switch (event.key) {
      case 'ArrowRight':
        next = (base + 1) % images.length
        break
      case 'ArrowLeft':
        next = (base - 1 + images.length) % images.length
        break
      case 'ArrowDown':
        next = Math.min(base + columns, images.length - 1)
        break
      case 'ArrowUp':
        next = Math.max(base - columns, 0)
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = images.length - 1
        break
      default:
        return
    }

    event.preventDefault()
    moveTo(next)
  }

  return (
    <div
      data-slot="image-gallery"
      className={cn('flex w-full flex-col gap-3', className)}
    >
      <ImageZoom
        key={current.src}
        alt={current.alt}
        aspectRatio={aspectRatio}
        caption={current.caption}
        priority
        sizes={sizes}
        src={current.src}
        transform={transform}
        widths={widths}
      />

      {current.caption
        ? (
            <p className="text-sm text-muted-foreground">
              {current.caption}
            </p>
          )
        : null}

      <div
        role="group"
        aria-label={label}
        onKeyDown={handleKeyDown}
        className={cn('grid gap-2', columnClasses[columns])}
      >
        {images.map((image, index) => (
          <Button
            key={`${image.src}-${image.alt}`}
            ref={(node) => {
              buttonRef.current[index] = node
            }}
            type="button"
            variant="ghost"
            aria-current={index === active
              ? 'true'
              : undefined}
            aria-label={image.alt}
            tabIndex={index === active
              ? 0
              : -1}
            className={cn(
              'h-auto w-full overflow-hidden rounded-lg border p-0',
              index === active
                ? 'ring-2 ring-ring'
                : 'opacity-70 hover:opacity-100',
            )}
            onClick={() => setSelected(index)}
          >
            <Image
              alt=""
              src={image.thumbnailSrc ?? image.src}
              className="h-20 w-full"
              containerClassName="w-full"
            />
          </Button>
        ))}
      </div>
    </div>
  )
}
