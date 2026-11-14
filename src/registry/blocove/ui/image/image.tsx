import type { CSSProperties, ImgHTMLAttributes, ReactNode } from 'react'
import type { ImageFocalPoint, ImageTransform } from '@/lib/blocove/image-pipeline'
import { cn } from 'cn'
import { useEffect, useRef, useState } from 'react'
import {
  buildImageSrcSet,
  focalPointPosition,
  placeholderBackground,
} from '@/lib/blocove/image-pipeline'

export type { ImageFocalPoint, ImageTransform }

/** One `<source>` of an art-directed picture. */
export interface ImageSource {
  /** The srcset the source selects between. */
  srcSet: string
  /** Media condition the source applies to. */
  media?: string
  /** MIME type the source serves. */
  type?: string
}

export interface ImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  | 'src'
  | 'alt'
  | 'width'
  | 'height'
  | 'srcSet'
  | 'sizes'
  | 'loading'
  | 'decoding'
  | 'fetchPriority'
> {
  /** The image URL, used as the fallback candidate of the srcset. */
  src: string
  /** Alternative text. Required: the component never renders a decorative image by accident. */
  alt: string
  /** Intrinsic width, forwarded to the element and used for the aspect ratio. */
  width?: number
  /** Intrinsic height, forwarded to the element and used for the aspect ratio. */
  height?: number
  /** Aspect ratio of the reserved box, for example `16 / 9`. Defaults to width / height. */
  aspectRatio?: number | string
  /** Widths the srcset requests. Requires `transform` to be useful. */
  widths?: readonly number[]
  /** Turns a source and a width into the URL that serves it. */
  transform?: ImageTransform
  /** An explicit srcset; it wins over `widths`. */
  srcSet?: string
  /** The layout sizes the browser picks a srcset candidate from. */
  sizes?: string
  /** Art-direction sources; when given the image renders inside a `<picture>`. */
  sources?: readonly ImageSource[]
  /**
   * Marks the image as the largest contentful element: eager loading, synchronous
   * decoding and a high fetch priority.
   */
  priority?: boolean
  /** Where the image sits when it does not fill its box. */
  focalPoint?: ImageFocalPoint
  /** How the image fills its box. */
  objectFit?: CSSProperties['objectFit']
  /** A CSS color, or an image URL drawn behind the image while it loads. */
  placeholder?: string
  /** Rendered instead of a broken image when the source fails. */
  fallback?: ReactNode
  /** Extra classes for the box that reserves the space and paints the placeholder. */
  containerClassName?: string
  /** Extra classes for the `<img>` element itself. */
  className?: string
}

type ImageStatus = 'loading' | 'loaded' | 'error'

/**
 * A responsive image with a layout-stable box, srcset support, a focal point, a
 * placeholder that fades into the picture and a fallback for broken sources.
 * It is a plain `<img>` (or `<picture>`), so it composes with any framework and
 * can be swapped for a framework image component without changing the API.
 */
export function Image({
  src,
  alt,
  width,
  height,
  aspectRatio,
  widths,
  transform,
  srcSet,
  sizes,
  sources,
  priority = false,
  focalPoint,
  objectFit,
  placeholder,
  fallback,
  containerClassName,
  className,
  style,
  onLoad,
  onError,
  ...props
}: ImageProps) {
  const [status, setStatus] = useState<ImageStatus>('loading')
  const imageRef = useRef<HTMLImageElement>(null)

  // A cached image can finish before React attaches onLoad, and a hydrated
  // server render never fires one. The element itself is the source of truth.
  useEffect(() => {
    const image = imageRef.current

    if (!image) {
      return
    }

    if (image.complete && image.naturalWidth > 0) {
      setStatus('loaded')
      return
    }

    setStatus('loading')
  }, [src])

  const resolvedAspectRatio = aspectRatio
    ?? (width && height
      ? `${width} / ${height}`
      : undefined)

  const resolvedSrcSet = srcSet
    ?? (widths?.length
      ? buildImageSrcSet(src, { widths, transform })
      : undefined)

  const element = (
    <img
      {...props}
      ref={imageRef}
      alt={alt}
      className={cn(
        'relative z-10 h-full w-full transition-opacity duration-300 motion-reduce:transition-none',
        status === 'loaded'
          ? 'opacity-100'
          : 'opacity-0',
        className,
      )}
      data-state={status}
      decoding={priority
        ? 'sync'
        : 'async'}
      fetchPriority={priority
        ? 'high'
        : 'auto'}
      height={height}
      loading={priority
        ? 'eager'
        : 'lazy'}
      onError={(event) => {
        setStatus('error')
        onError?.(event)
      }}
      onLoad={(event) => {
        setStatus('loaded')
        onLoad?.(event)
      }}
      sizes={sizes}
      src={src}
      srcSet={resolvedSrcSet}
      style={{
        objectFit: objectFit ?? 'cover',
        objectPosition: focalPointPosition(focalPoint),
        ...style,
      }}
      width={width}
    />
  )

  return (
    <span
      data-slot="image"
      data-state={status}
      className={cn('relative block overflow-hidden', containerClassName)}
      style={{
        ...(resolvedAspectRatio
          ? { aspectRatio: resolvedAspectRatio }
          : {}),
        ...placeholderBackground(placeholder),
      }}
    >
      {status === 'error'
        ? fallback ?? (
          <span
            aria-hidden="true"
            className="block h-full w-full bg-muted"
            data-slot="image-fallback"
          />
        )
        : sources?.length
          ? (
              <picture className="contents">
                {sources.map(source => (
                  <source
                    key={`${source.media ?? 'all'}-${source.type ?? 'any'}-${source.srcSet}`}
                    media={source.media}
                    srcSet={source.srcSet}
                    type={source.type}
                  />
                ))}
                {element}
              </picture>
            )
          : element}
    </span>
  )
}
