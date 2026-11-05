import type { DocsPage } from '@/docs/types'
import VideoShowcaseDemo from '@/docs/examples/media/video-showcase'
import { getRegistrySource } from '@/lib/registry-source'

export const docsPage: DocsPage = {
  item: 'video-showcase',
  examples: [
    {
      title: 'Video Showcase',
      component: VideoShowcaseDemo,
      code: getRegistrySource('blocks/video-showcase.tsx') ?? '',
    },
  ],
  usage: [
    {
      title: 'Use the block',
      code: `import { VideoShowcase } from "@/components/blocove/video-showcase"

export function ReleaseVideo() {
  return (
    <VideoShowcase
      eyebrow="Release notes"
      title="What the media family ships"
      description="Five components and four blocks, installed one at a time."
      src="/release.mp4"
      poster="/release-poster.jpg"
      meta={["00:08", "Captions"]}
      tracks={[{ src: "/captions.vtt", label: "English", srcLang: "en", default: true }]}
    />
  )
}`,
    },
  ],
  api: [
    {
      name: 'VideoShowcase',
      description:
        'The player with a caption underneath it: a badge, the title, a description, then a divider and the facts and actions. Every part of the caption is optional.',
      rows: [
        { prop: 'src', type: 'string', default: 'Required' },
        { prop: 'poster', type: 'string', default: '-' },
        { prop: 'title', type: 'string', default: 'Required' },
        { prop: 'eyebrow', type: 'string', default: '-' },
        { prop: 'description', type: 'string', default: '-' },
        { prop: 'meta', type: 'string[]', default: '-' },
        { prop: 'tracks', type: 'MediaTrack[]', default: '-' },
        { prop: 'actions', type: 'ReactNode', default: '-' },
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  note: 'The block renders the shipped `VideoMedia` element, so captions go through the same `tracks` declarations as the player page. Replace that element when the source needs another media engine.',
}
