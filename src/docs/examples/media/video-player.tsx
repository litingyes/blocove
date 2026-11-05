import { mediaDemoTracks, mediaSamples } from '@/docs/examples/media/content'
import { MediaDemoFrame } from '@/docs/examples/media/frame'
import { VideoMedia, VideoPlayer } from '@/registry/blocove/ui/media/video'

export default function VideoPlayerDemo() {
  return (
    <MediaDemoFrame>
      <VideoPlayer
        title="Composable media components"
        poster={mediaSamples.poster}
      >
        <VideoMedia src={mediaSamples.video} tracks={mediaDemoTracks} />
      </VideoPlayer>
    </MediaDemoFrame>
  )
}
