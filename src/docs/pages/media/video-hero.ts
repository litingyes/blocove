import type { DocsPage } from '@/docs/types'
import VideoHeroDemo from '@/docs/examples/media/video-hero'
import { getRegistrySource } from '@/lib/registry-source'

export const docsPage: DocsPage = {
  item: 'video-hero',
  examples: [
    {
      title: 'Video Hero',
      component: VideoHeroDemo,
      // The block is a single file, so the code panel shows exactly what the
      // CLI installs instead of a generated snippet.
      code: getRegistrySource('blocks/video-hero.tsx') ?? '',
    },
  ],
  usage: [
    {
      title: 'Use the block',
      code: `import { VideoHero } from "@/components/blocove/video-hero"

export function LandingHero() {
  return (
    <VideoHero
      eyebrow="Blocove media"
      title="Audio and video, built from small composable items"
      description="Install the items you compose, in your own shadcn/ui project."
      src="/hero.mp4"
      poster="/hero-poster.jpg"
      actions={<Button>Get started</Button>}
    />
  )
}`,
    },
  ],
  api: [
    {
      name: 'VideoHero',
      description:
        'A hero section with an ambient, looping video behind a dark gradient. The video is decorative; the headline carries the meaning. Installs the ambient video item and the badge it uses.',
      rows: [
        { prop: 'src', type: 'string', default: 'Required' },
        { prop: 'poster', type: 'string', default: '-' },
        { prop: 'eyebrow', type: 'string', default: '-' },
        { prop: 'title', type: 'string', default: 'Required' },
        { prop: 'description', type: 'string', default: '-' },
        { prop: 'actions', type: 'ReactNode', default: '-' },
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  note: 'Use a short, loopable clip: the preset mutes and loops it, so there is no audio to plan for. Keep the headline a real heading in your page outline, and let the actions be the buttons of your own design system.',
}
