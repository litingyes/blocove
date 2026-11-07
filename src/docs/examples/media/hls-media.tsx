import { mediaDemoTracks, mediaSamples } from '@/docs/examples/media/content'
import { MediaDemoFrame } from '@/docs/examples/media/frame'
import { AudioPlayer } from '@/registry/blocove/ui/media/audio'
import { HlsAudioMedia } from '@/registry/blocove/ui/media/hls-audio'
import { HlsVideoMedia } from '@/registry/blocove/ui/media/hls-video'
import { VideoPlayer } from '@/registry/blocove/ui/media/video'

export default function HlsMediaDemo() {
  return (
    <MediaDemoFrame>
      <VideoPlayer
        title="Adaptive stream"
        poster={mediaSamples.poster}
      >
        <HlsVideoMedia src={mediaSamples.hls} tracks={mediaDemoTracks} />
      </VideoPlayer>
      <AudioPlayer
        title="Composable media, one manifest at a time"
        poster={mediaSamples.cover}
      >
        <HlsAudioMedia src={mediaSamples.hlsAudio} />
      </AudioPlayer>
    </MediaDemoFrame>
  )
}
