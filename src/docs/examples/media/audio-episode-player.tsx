import { Button } from '@/components/ui/button'
import { audioEpisodeDemo } from '@/docs/examples/media/content'
import { MediaDemoFrame } from '@/docs/examples/media/frame'
import { AudioEpisodePlayer } from '@/registry/blocove/blocks/audio-episode-player'

export default function AudioEpisodePlayerDemo() {
  return (
    <MediaDemoFrame>
      <AudioEpisodePlayer
        cover={audioEpisodeDemo.cover}
        description={audioEpisodeDemo.description}
        duration={audioEpisodeDemo.duration}
        episode={audioEpisodeDemo.episode}
        publishedAt={audioEpisodeDemo.publishedAt}
        show={audioEpisodeDemo.show}
        src={audioEpisodeDemo.src}
        title={audioEpisodeDemo.title}
        actions={(
          <>
            <Button size="sm" variant="outline">
              Subscribe
            </Button>
            <Button size="sm" variant="ghost">
              Share
            </Button>
          </>
        )}
      />
    </MediaDemoFrame>
  )
}
