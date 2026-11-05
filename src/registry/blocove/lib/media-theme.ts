import type { CSSProperties } from 'react'

/**
 * Named aspect ratios for the video surfaces: `video` (16:9), `classic` (4:3),
 * `square` (1:1), `portrait` (9:16), `wide` (21:9) and `auto` (the media's own
 * intrinsic size).
 */
export type MediaAspectRatio
  = | 'video'
    | 'classic'
    | 'square'
    | 'portrait'
    | 'wide'
    | 'auto'

/**
 * The parts of the Video.js skins that are safe to style. They are published as
 * the `--media-*` custom properties, so everything else inside a packaged skin
 * stays private.
 */
export interface MediaThemeOptions {
  /** Slider fills, highlighted controls and primary actions. */
  accentColor?: string
  /** Text and icons drawn on the accent color. */
  accentTextColor?: string
  /** The hairline around the player. */
  borderColor?: string
  /** The player corner radius. */
  borderRadius?: string
  /** The player interface font stack. */
  fontFamily?: string
  /** How the media and poster fill the player. */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  /** Where the media and poster sit when they do not fill the player. */
  objectPosition?: string
  /** Base size for skin spacing, icons and text. */
  scaleUnit?: string
}

const aspectRatioValues: Record<MediaAspectRatio, string | undefined> = {
  video: '16 / 9',
  classic: '4 / 3',
  square: '1 / 1',
  portrait: '9 / 16',
  wide: '21 / 9',
  auto: undefined,
}

/**
 * Inline styles that set the skin's aspect ratio. `auto` returns nothing, so the
 * media keeps its intrinsic size.
 */
export function mediaAspectRatioStyle(
  ratio: MediaAspectRatio = 'video',
): CSSProperties | undefined {
  const value = aspectRatioValues[ratio]

  return value
    ? { aspectRatio: value }
    : undefined
}

/**
 * The Blocove defaults for a packaged Video.js skin: shadcn/ui tokens for the
 * radius, hairline, font and scale, with every setting overridable.
 *
 * The accent color is only set when it is passed, because the skins already
 * resolve a contrasting default (`light-dark()` for audio, white over video).
 */
export function mediaThemeStyle(options: MediaThemeOptions = {}): CSSProperties {
  const style: Record<string, string> = {
    '--media-border-radius': options.borderRadius ?? 'var(--radius, 0.625rem)',
    '--media-border-color': options.borderColor ?? 'var(--border, transparent)',
    '--media-font-family': options.fontFamily ?? 'var(--font-sans, inherit)',
    '--media-scale-unit': options.scaleUnit ?? '1rem',
  }

  if (options.accentColor) {
    style['--media-accent-color'] = options.accentColor
  }

  if (options.accentTextColor) {
    style['--media-accent-text-color'] = options.accentTextColor
  }

  if (options.objectFit) {
    style['--media-object-fit'] = options.objectFit
  }

  if (options.objectPosition) {
    style['--media-object-position'] = options.objectPosition
  }

  return style as CSSProperties
}
