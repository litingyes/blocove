import type { HlsAudioProps } from '@videojs/react/media/hls-audio'
import type { MediaTrack } from '@/components/blocove/media/tracks'
import { HlsAudio as HlsAudioJsMedia } from '@videojs/react/media/hls-audio'
import { MediaTracks } from '@/components/blocove/media/tracks'

export interface HlsAudioMediaProps extends HlsAudioProps {
  /** Text tracks rendered inside the element. */
  tracks?: MediaTrack[]
}

/**
 * The adaptive HLS `<audio>` element. It plays the audio rendition of a stream
 * through the same audio shell as a progressive file, so an episode can move
 * from a static download to a manifest without touching the interface.
 */
export function HlsAudioMedia({
  children,
  preload = 'metadata',
  tracks,
  ...props
}: HlsAudioMediaProps) {
  return (
    <HlsAudioJsMedia preload={preload} {...props}>
      {tracks
        ? <MediaTracks tracks={tracks} />
        : null}
      {children}
    </HlsAudioJsMedia>
  )
}
