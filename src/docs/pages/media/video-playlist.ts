import type { DocsPage } from '@/docs/types'
import VideoPlaylistDemo from '@/docs/examples/media/video-playlist'
import { getRegistrySource } from '@/lib/registry-source'

export const docsPage: DocsPage = {
  item: 'video-playlist',
  examples: [
    {
      title: 'Video Playlist',
      component: VideoPlaylistDemo,
      code: getRegistrySource('blocks/video-playlist.tsx') ?? '',
    },
  ],
  usage: [
    {
      title: 'Use the block',
      code: `import { VideoPlaylist } from "@/components/blocove/video-playlist"

const episodes = [
  { id: "one", title: "Composing the shell", src: "/one.mp4", duration: "12:40" },
  { id: "two", title: "Swapping the media", src: "/two.mp4", duration: "08:15" },
]

export function CoursePlayer() {
  return <VideoPlaylist items={episodes} defaultId="one" />
}`,
    },
  ],
  api: [
    {
      name: 'VideoPlaylist',
      description:
        'The player next to the episode list. Selecting an entry swaps the media element and the title without recreating the player, so the interface keeps its state.',
      rows: [
        { prop: 'items', type: 'VideoPlaylistItem[]', default: 'Required' },
        { prop: 'defaultId', type: 'string', default: 'First item' },
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
    {
      name: 'VideoPlaylistItem',
      description:
        'One playlist entry. The duration is a preformatted string, so it matches how your data already shows it.',
      rows: [
        { prop: 'id', type: 'string', default: 'Required' },
        { prop: 'title', type: 'string', default: 'Required' },
        { prop: 'src', type: 'string', default: 'Required' },
        { prop: 'poster', type: 'string', default: '-' },
        { prop: 'duration', type: 'string', default: '-' },
        { prop: 'description', type: 'string', default: '-' },
      ],
    },
  ],
  note: 'The demo reuses two sample clips for three episodes, so selecting an entry visibly swaps the media as well as the title. The list scrolls on its own and the grid collapses to one column below the `lg` breakpoint.',
}
