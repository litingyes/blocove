import type { LiveVideoSkinProps } from '@videojs/react/live-video'
import type { CSSProperties, ReactNode } from 'react'
import type { MediaAspectRatio, MediaThemeOptions } from '@/lib/blocove/media-theme'
import { I18nProvider } from '@videojs/react'
import {
  LiveAudioPlayer as LiveAudioJsPlayer,
  LiveAudioSkin as LiveAudioJsSkin,
} from '@videojs/react/live-audio'
import {
  LiveVideoPlayer as LiveVideoJsPlayer,
  LiveVideoSkin as LiveVideoJsSkin,
} from '@videojs/react/live-video'
import { cn } from 'cn'
import { mediaAspectRatioStyle, mediaThemeStyle } from '@/lib/blocove/media-theme'
import '@videojs/react/live-audio/skin.css'
import '@videojs/react/live-video/skin.css'

export interface LiveVideoPlayerProps {
  /** Title the player reports, shown by the interface; overrides the media's. */
  title?: string | null
  /** Poster the player reports, shown before playback; overrides the media's. */
  poster?: string | null
  /** The player's aspect ratio. */
  aspectRatio?: MediaAspectRatio
  /** Brand color for slider fills, highlighted controls and primary actions. */
  accentColor?: string
  /** How the video and poster fill the player. */
  objectFit?: MediaThemeOptions['objectFit']
  /** Where the video and poster sit when they do not fill the player. */
  objectPosition?: string
  /** Replaces the poster image the skin draws. */
  renderPoster?: LiveVideoSkinProps['renderPoster']
  /** BCP 47 language tag for the player labels, for example `en` or `zh-CN`. */
  locale?: string
  className?: string
  style?: CSSProperties
  /** The media: `<HlsVideoMedia>` or another video element for the same player. */
  children: ReactNode
}

/**
 * A live video player: the Video.js live video preset and its skin, which swaps
 * the time controls for a live button that seeks back to the edge. The media
 * element stays a separate item, so an HLS stream and a progressive file play
 * through the same interface.
 */
export function LiveVideoPlayer({
  title,
  poster,
  aspectRatio = 'video',
  accentColor,
  objectFit,
  objectPosition,
  renderPoster,
  locale,
  className,
  style,
  children,
}: LiveVideoPlayerProps) {
  const skin = (
    <LiveVideoJsSkin
      className={cn('w-full', className)}
      style={{
        ...mediaThemeStyle({ accentColor, objectFit, objectPosition }),
        ...mediaAspectRatioStyle(aspectRatio),
        ...style,
      }}
      renderPoster={renderPoster}
    >
      {children}
    </LiveVideoJsSkin>
  )

  return (
    <LiveVideoJsPlayer title={title} poster={poster}>
      {locale
        ? <I18nProvider locale={locale}>{skin}</I18nProvider>
        : skin}
    </LiveVideoJsPlayer>
  )
}

export interface LiveAudioPlayerProps {
  /** Title the player reports for the current stream or episode. */
  title?: string | null
  /** Cover art the player reports, drawn by the skin behind the interface. */
  poster?: string | null
  /** Brand color for slider fills, highlighted controls and primary actions. */
  accentColor?: string
  /** BCP 47 language tag for the player labels, for example `en` or `zh-CN`. */
  locale?: string
  className?: string
  style?: CSSProperties
  /** The media: `<HlsAudioMedia>` or another audio element for the same player. */
  children: ReactNode
}

/**
 * A live audio player: the Video.js live audio preset and its skin, for streams,
 * radio and live episodes. The skin follows the inherited `color-scheme`, so it
 * adapts to light and dark pages.
 */
export function LiveAudioPlayer({
  title,
  poster,
  accentColor,
  locale,
  className,
  style,
  children,
}: LiveAudioPlayerProps) {
  const skin = (
    <LiveAudioJsSkin
      className={cn('w-full', className)}
      style={{
        ...mediaThemeStyle({ accentColor }),
        ...style,
      }}
    >
      {children}
    </LiveAudioJsSkin>
  )

  return (
    <LiveAudioJsPlayer title={title} poster={poster}>
      {locale
        ? <I18nProvider locale={locale}>{skin}</I18nProvider>
        : skin}
    </LiveAudioJsPlayer>
  )
}
