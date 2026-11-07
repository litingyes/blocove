import type { HlsVideoProps } from '@videojs/react/media/hls-video'
import type { MediaTrack } from '@/components/blocove/media/tracks'
import { HlsVideo as HlsVideoJsMedia } from '@videojs/react/media/hls-video'
import { MediaTracks } from '@/components/blocove/media/tracks'

export interface HlsVideoMediaProps extends HlsVideoProps {
  /** Text tracks rendered inside the element. */
  tracks?: MediaTrack[]
}

/**
 * The adaptive HLS `<video>` element. It registers itself as the player's media
 * on mount like the progressive element does, so the same shells play a
 * manifest: the skin, the controls and the settings menu do not change when the
 * source becomes a stream, and the quality menu fills itself from the
 * renditions the manifest declares.
 */
export function HlsVideoMedia({
  children,
  playsInline = true,
  preload = 'metadata',
  tracks,
  ...props
}: HlsVideoMediaProps) {
  return (
    <HlsVideoJsMedia playsInline={playsInline} preload={preload} {...props}>
      {tracks
        ? <MediaTracks tracks={tracks} />
        : null}
      {children}
    </HlsVideoJsMedia>
  )
}
