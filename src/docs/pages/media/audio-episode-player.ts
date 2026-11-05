import type { DocsPage } from '@/docs/types'
import AudioEpisodePlayerDemo from '@/docs/examples/media/audio-episode-player'
import { getRegistrySource } from '@/lib/registry-source'

export const docsPage: DocsPage = {
  item: 'audio-episode-player',
  examples: [
    {
      title: 'Audio Episode Player',
      component: AudioEpisodePlayerDemo,
      code: getRegistrySource('blocks/audio-episode-player.tsx') ?? '',
    },
  ],
  usage: [
    {
      title: 'Use the block',
      code: `import { AudioEpisodePlayer } from "@/components/blocove/audio-episode-player"

export function LatestEpisode() {
  return (
    <AudioEpisodePlayer
      episode={12}
      title="Composable media, one item at a time"
      show="The Blocove Podcast"
      cover="/episode-cover.jpg"
      src="/episode.m4a"
      duration="42 min"
      publishedAt="November 2026"
      description="A short summary of what the episode covers."
    />
  )
}`,
    },
  ],
  api: [
    {
      name: 'AudioEpisodePlayer',
      description:
        'A podcast episode: cover art, title, show and facts in the header, the audio player below, then the description and the actions. The cover doubles as the player poster.',
      rows: [
        { prop: 'src', type: 'string', default: 'Required' },
        { prop: 'title', type: 'string', default: 'Required' },
        { prop: 'show', type: 'string', default: '-' },
        { prop: 'cover', type: 'string', default: '-' },
        { prop: 'episode', type: 'number', default: '-' },
        { prop: 'description', type: 'string', default: '-' },
        { prop: 'duration', type: 'string', default: '-' },
        { prop: 'publishedAt', type: 'string', default: '-' },
        { prop: 'actions', type: 'ReactNode', default: '-' },
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  note: 'The header renders the facts the player interface does not show, so keep `duration` and `publishedAt` as preformatted strings from your data. The actions are your own buttons: subscribe, share or download.',
}
