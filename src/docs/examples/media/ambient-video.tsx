import { mediaSamples } from '@/docs/examples/media/content'
import { MediaDemoFrame } from '@/docs/examples/media/frame'
import { AmbientVideo } from '@/registry/blocove/ui/media/ambient-video'

export default function AmbientVideoDemo() {
  return (
    <MediaDemoFrame>
      <AmbientVideo
        src={mediaSamples.video}
        poster={mediaSamples.poster}
        className="overflow-hidden rounded-xl border"
      />
    </MediaDemoFrame>
  )
}
