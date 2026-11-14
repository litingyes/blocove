export interface ImageFocalPoint {
  /** Horizontal focal point, in percent. */
  x: number
  /** Vertical focal point, in percent. */
  y: number
}

/**
 * Turns a source and a width into the URL that serves that width. The component
 * stays framework agnostic: pass a Cloudflare, imgix, Next or Vercel transform,
 * or leave it as the identity for images that need no resizing.
 */
export type ImageTransform = (src: string, width: number) => string

/** The widths the components request when the caller gives none. */
export const defaultImageWidths: readonly number[] = [320, 480, 640, 960]

/** The transform for sources that already serve the same file at every size. */
export function identityImageTransform(src: string, _width: number): string {
  return src
}

/**
 * Sorts, rounds and de-duplicates the requested widths, and falls back to
 * {@link defaultImageWidths} when nothing usable is left.
 */
export function normalizeImageWidths(widths?: readonly number[]): number[] {
  if (!widths?.length) {
    return [...defaultImageWidths]
  }

  const usable = widths
    .filter(width => Number.isFinite(width) && width > 0)
    .map(width => Math.round(width))

  const unique = [
    ...new Set(usable),
  ].sort((a, b) => a - b)

  return unique.length > 0
    ? unique
    : [...defaultImageWidths]
}

/**
 * Builds the `srcSet` string for one source: one candidate per normalized width,
 * each URL produced by the caller's transform.
 */
export function buildImageSrcSet(
  src: string,
  { widths, transform = identityImageTransform }: {
    widths?: readonly number[]
    transform?: ImageTransform
  } = {},
): string {
  return normalizeImageWidths(widths)
    .map(width => `${transform(src, width)} ${width}w`)
    .join(', ')
}

/** The `object-position` value a focal point maps to, if one is set. */
export function focalPointPosition(focalPoint?: ImageFocalPoint): string | undefined {
  return focalPoint
    ? `${focalPoint.x}% ${focalPoint.y}%`
    : undefined
}

/**
 * The background a placeholder paints behind the image. A path, an HTTP URL or a
 * data URI is treated as a low-quality image and drawn cover/center; any other
 * string is a CSS color.
 */
export function placeholderBackground(placeholder?: string): {
  backgroundColor?: string
  backgroundImage?: string
} {
  if (!placeholder) {
    return {}
  }

  const isImage = placeholder.startsWith('/')
    || placeholder.startsWith('http')
    || placeholder.startsWith('data:')

  return isImage
    ? { backgroundImage: `url("${placeholder}")` }
    : { backgroundColor: placeholder }
}
