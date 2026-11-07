import type { AudioHTMLAttributes, CSSProperties, ReactNode } from 'react'
import type { MediaTrack } from '@/components/blocove/media/tracks'
import { I18nProvider } from '@videojs/react'
import {
  Audio as AudioJsMedia,
  AudioPlayer as AudioJsPlayer,
  AudioSkin as AudioJsSkin,
} from '@videojs/react/audio'
import { cn } from 'cn'
import { MediaTracks } from '@/components/blocove/media/tracks'
import { mediaThemeStyle } from '@/lib/blocove/media-theme'
import '@videojs/react/audio/skin.css'

export interface AudioMediaProps extends AudioHTMLAttributes<HTMLAudioElement> {
  /** Text tracks rendered inside the element. */
  tracks?: MediaTrack[]
}

/**
 * The native `<audio>` element the audio item plays through, with text tracks
 * and a metadata-only preload.
 */
export function AudioMedia({
  children,
  preload = 'metadata',
  tracks,
  ...props
}: AudioMediaProps) {
  return (
    <AudioJsMedia preload={preload} {...props}>
      {tracks
        ? <MediaTracks tracks={tracks} />
        : null}
      {children}
    </AudioJsMedia>
  )
}

export interface AudioPlayerProps {
  /** Title the player reports for the current episode or track. */
  title?: string | null
  /** Cover art the player reports, drawn by the skin behind the interface. */
  poster?: string | null
  /** Brand color for slider fills, highlighted controls and primary actions. */
  accentColor?: string
  /** BCP 47 language tag for the player labels, for example `en` or `zh-CN`. */
  locale?: string
  className?: string
  style?: CSSProperties
  /** The media: `<AudioMedia>` or another audio element for the same player. */
  children: ReactNode
}

/**
 * An audio player: the Video.js audio preset and its skin, themed with the
 * shadcn/ui tokens you already have. The skin follows the inherited
 * `color-scheme`, so it adapts to light and dark pages.
 */
export function AudioPlayer({
  title,
  poster,
  accentColor,
  locale,
  className,
  style,
  children,
}: AudioPlayerProps) {
  const skin = (
    <AudioJsSkin
      className={cn('w-full', className)}
      style={{
        ...mediaThemeStyle({ accentColor }),
        ...style,
      }}
    >
      {children}
    </AudioJsSkin>
  )

  return (
    <AudioJsPlayer title={title} poster={poster}>
      {locale
        ? <I18nProvider locale={locale}>{skin}</I18nProvider>
        : skin}
    </AudioJsPlayer>
  )
}
