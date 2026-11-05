import { mediaSamples } from '@/docs/examples/media/content'
import { MediaDemoFrame } from '@/docs/examples/media/frame'
import { AudioMedia, AudioPlayer } from '@/registry/blocove/ui/media/audio'

export default function AudioPlayerDemo() {
  return (
    <MediaDemoFrame>
      <AudioPlayer
        title="Composable media, one item at a time"
        poster={mediaSamples.cover}
      >
        <AudioMedia src={mediaSamples.audio} />
      </AudioPlayer>
    </MediaDemoFrame>
  )
}
