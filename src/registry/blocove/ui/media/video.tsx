import type { VideoSkinProps } from '@videojs/react/video'
import type { CSSProperties, ReactNode, VideoHTMLAttributes } from 'react'
import type { MediaTrack } from '@/components/blocove/media/tracks'
import type { MediaAspectRatio, MediaThemeOptions } from '@/lib/blocove/media-theme'
import {
  Video as VideoJsMedia,
  VideoPlayer as VideoJsPlayer,
  VideoSkin as VideoJsSkin,
} from '@videojs/react/video'
import { cn } from 'cn'
import { MediaTracks } from '@/components/blocove/media/tracks'
import { mediaAspectRatioStyle, mediaThemeStyle } from '@/lib/blocove/media-theme'
import '@videojs/react/video/skin.css'

export interface VideoMediaProps extends VideoHTMLAttributes<HTMLVideoElement> {
  /** Text tracks rendered inside the element. */
  tracks?: MediaTrack[]
}

/**
 * The native `<video>` element every video item plays through. It registers
 * itself as the player's media on mount, so another media element can take its
 * place without changing the shell.
 */
export function VideoMedia({
  children,
  playsInline = true,
  preload = 'metadata',
  tracks,
  ...props
}: VideoMediaProps) {
  return (
    <VideoJsMedia playsInline={playsInline} preload={preload} {...props}>
      {tracks
        ? <MediaTracks tracks={tracks} />
        : null}
      {children}
    </VideoJsMedia>
  )
}

export interface VideoPlayerProps {
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
  renderPoster?: VideoSkinProps['renderPoster']
  className?: string
  style?: CSSProperties
  /** The media: `<VideoMedia>` or another media element for the same player. */
  children: ReactNode
}

/**
 * An on-demand video player: the Video.js video preset and its skin, themed
 * with the shadcn/ui tokens you already have. Compose the media inside it.
 */
export function VideoPlayer({
  title,
  poster,
  aspectRatio = 'video',
  accentColor,
  objectFit,
  objectPosition,
  renderPoster,
  className,
  style,
  children,
}: VideoPlayerProps) {
  return (
    <VideoJsPlayer title={title} poster={poster}>
      <VideoJsSkin
        className={cn('w-full', className)}
        style={{
          ...mediaThemeStyle({ accentColor, objectFit, objectPosition }),
          ...mediaAspectRatioStyle(aspectRatio),
          ...style,
        }}
        renderPoster={renderPoster}
      >
        {children}
      </VideoJsSkin>
    </VideoJsPlayer>
  )
}
