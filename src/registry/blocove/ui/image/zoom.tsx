import type { ReactNode } from 'react'
import type { ImageTransform } from '@/components/blocove/image/image'
import { cn } from 'cn'
import { Maximize2Icon } from 'lucide-react'
import { Image } from '@/components/blocove/image/image'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export interface ImageZoomProps {
  /** The full-size source opened in the dialog. */
  src: string
  /** Alternative text, also used as the dialog title. */
  alt: string
  /** The smaller source shown in the trigger; defaults to `src`. */
  thumbnailSrc?: string
  /** Caption rendered under the large image. */
  caption?: ReactNode
  /** Aspect ratio of the trigger image. */
  aspectRatio?: number | string
  /** Intrinsic width of the trigger image. */
  width?: number
  /** Intrinsic height of the trigger image. */
  height?: number
  /** Whether the trigger image is a priority image. */
  priority?: boolean
  /** Layout sizes for the large image. */
  sizes?: string
  /** Widths the large image requests, for example for a CDN transform. */
  widths?: readonly number[]
  /** Turns a source and a width into the URL that serves it. */
  transform?: ImageTransform
  /** A CSS color or image URL drawn behind the trigger image while it loads. */
  placeholder?: string
  /** Accessible name of the trigger button. */
  zoomLabel?: string
  /** Extra classes for the trigger button. */
  triggerClassName?: string
  /** Extra classes for the dialog panel. */
  className?: string
}

/**
 * A thumbnail that opens its full-size source in a dialog. The dialog handles
 * Escape, the focus trap and returning focus to the trigger, so the item only
 * owns the composition.
 */
export function ImageZoom({
  src,
  alt,
  thumbnailSrc,
  caption,
  aspectRatio,
  width,
  height,
  priority = false,
  sizes = '100vw',
  widths,
  transform,
  placeholder,
  zoomLabel,
  triggerClassName,
  className,
}: ImageZoomProps) {
  return (
    <Dialog>
      <DialogTrigger
        data-slot="image-zoom"
        aria-label={zoomLabel ?? `Zoom image: ${alt}`}
        className={cn(
          'group relative block w-full overflow-hidden rounded-lg border bg-muted/30 text-left outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
          triggerClassName,
        )}
      >
        <Image
          alt={alt}
          aspectRatio={aspectRatio}
          height={height}
          placeholder={placeholder}
          src={thumbnailSrc ?? src}
          width={width}
          className="transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <span className="pointer-events-none absolute right-2 bottom-2 z-20 inline-flex items-center gap-1 rounded-md bg-background/85 px-2 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
          <Maximize2Icon className="size-3.5" />
          Zoom
        </span>
      </DialogTrigger>

      <DialogContent
        className={cn('max-w-4xl gap-2 p-2 sm:max-w-4xl', className)}
        showCloseButton
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <Image
          alt={alt}
          priority={priority}
          sizes={sizes}
          src={src}
          transform={transform}
          widths={widths}
          className="h-auto max-h-[80vh] w-full rounded-md bg-muted/30"
          objectFit="contain"
        />
        {caption
          ? (
              <p className="px-2 pb-1 text-sm text-muted-foreground">
                {caption}
              </p>
            )
          : null}
      </DialogContent>
    </Dialog>
  )
}
