import { Button } from '@/components/ui/button'
import { mediaSamples } from '@/docs/examples/media/content'
import { VideoHero } from '@/registry/blocove/blocks/video-hero'

export default function VideoHeroDemo() {
  return (
    <VideoHero
      className="max-w-3xl"
      description="Every surface on this page is a registry item: the shell, the media, the playlist and the block itself. Install the ones you compose."
      eyebrow="Blocove media"
      poster={mediaSamples.poster}
      src={mediaSamples.video}
      title="Audio and video, built from small composable items"
      actions={(
        <>
          <Button>
            Get started
          </Button>
          <Button
            variant="ghost"
            className="border-white/25 text-white hover:bg-white/10 hover:text-white"
          >
            Read the docs
          </Button>
        </>
      )}
    />
  )
}
