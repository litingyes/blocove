import type { DocsPage } from '@/docs/types'
import AudioPlayerDemo from '@/docs/examples/media/audio-player'
import { mediaSamples } from '@/docs/examples/media/content'
import { audioPlayerUsage } from '@/docs/snippets/media'

export const docsPage: DocsPage = {
  item: 'audio-player',
  examples: [
    {
      title: 'Default',
      component: AudioPlayerDemo,
      code: audioPlayerUsage({
        title: 'Composable media, one item at a time',
        poster: mediaSamples.cover,
        src: mediaSamples.audio,
      }),
    },
  ],
  note: 'The audio skin adapts its palette to the inherited `color-scheme`, so the same block follows a light or dark page. Pass `poster` to show cover art behind the interface, and keep the episode title and facts in your own layout: the interface only shows what it needs.',
  api: [
    {
      name: 'AudioPlayer',
      description:
        'The audio-only preset and its skin. It reports the title and the cover art and adapts to the page color scheme; the media is composed inside it.',
      rows: [
        { prop: 'title', type: 'string | null', default: '-' },
        { prop: 'poster', type: 'string | null', default: '-' },
        { prop: 'accentColor', type: 'string', default: 'Skin default' },
        { prop: 'className', type: 'string', default: '-' },
        { prop: 'style', type: 'CSSProperties', default: '-' },
        { prop: 'children', type: 'ReactNode', default: 'Required' },
      ],
    },
    {
      name: 'AudioMedia',
      description:
        'The native `<audio>` element, with text tracks and a metadata-only preload. Replace it when the source needs another media engine.',
      rows: [
        { prop: 'src', type: 'string', default: '-' },
        { prop: 'tracks', type: 'MediaTrack[]', default: '-' },
        { prop: 'preload', type: '\'none\' | \'metadata\' | \'auto\'', default: '\'metadata\'' },
        {
          prop: '...props',
          type: 'AudioHTMLAttributes<HTMLAudioElement>',
          default: '-',
        },
      ],
    },
  ],
}
