import { mediaSamples } from '@/docs/examples/media/content'
import { MediaDemoFrame } from '@/docs/examples/media/frame'
import { HlsAudioMedia } from '@/registry/blocove/ui/media/hls-audio'
import { HlsVideoMedia } from '@/registry/blocove/ui/media/hls-video'
import {
  LiveAudioPlayer,
  LiveVideoPlayer,
} from '@/registry/blocove/ui/media/live'

export default function LivePlayerDemo() {
  return (
    <MediaDemoFrame>
      <LiveVideoPlayer
        title="Live from the edge"
        poster={mediaSamples.poster}
      >
        <HlsVideoMedia
          src={mediaSamples.live}
          streamType="live"
        />
      </LiveVideoPlayer>
      <LiveAudioPlayer
        title="Houston, We Have a Podcast"
        poster={mediaSamples.cover}
      >
        <HlsAudioMedia src={mediaSamples.liveAudio} />
      </LiveAudioPlayer>
    </MediaDemoFrame>
  )
}
