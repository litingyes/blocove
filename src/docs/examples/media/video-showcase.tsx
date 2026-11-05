import { Button } from '@/components/ui/button'
import { mediaDemoTracks, mediaSamples } from '@/docs/examples/media/content'
import { MediaDemoFrame } from '@/docs/examples/media/frame'
import { VideoShowcase } from '@/registry/blocove/blocks/video-showcase'

export default function VideoShowcaseDemo() {
  return (
    <MediaDemoFrame>
      <VideoShowcase
        description="The player stays a separate item, so the caption, the facts and the actions around it are yours to arrange."
        eyebrow="Release notes"
        meta={['00:08', 'Captions', 'November 2026']}
        poster={mediaSamples.poster}
        src={mediaSamples.video}
        title="What the media family ships"
        tracks={mediaDemoTracks}
        actions={(
          <Button size="sm" variant="outline">
            Copy link
          </Button>
        )}
      />
    </MediaDemoFrame>
  )
}
