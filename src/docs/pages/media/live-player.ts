import type { DocsPage } from '@/docs/types'
import { mediaSamples } from '@/docs/examples/media/content'
import LivePlayerDemo from '@/docs/examples/media/live-player'
import { livePlayerUsage } from '@/docs/snippets/media'

export const docsPage: DocsPage = {
  item: 'live-player',
  demoDeps: ['hls-media'],
  note: 'The live preset swaps the timeline for a live button that seeks back to the edge, and the DVR window the manifest declares decides how far back it can reach. It is still a shell: compose an adaptive media element inside it, and pin `streamType="live"` when you want the live layout from the first frame instead of waiting for the engine to parse the playlist. The audio preset follows the inherited `color-scheme`; pass `locale` to translate the labels through the Video.js i18n provider. The committed demo fixture is a short static stream that never grows, so the demo plays its window and then holds at the live edge.',
  examples: [
    {
      title: 'Default',
      component: LivePlayerDemo,
      code: livePlayerUsage({
        video: {
          title: 'Live from the edge',
          poster: mediaSamples.poster,
          src: mediaSamples.live,
          streamType: 'live',
        },
        audio: {
          title: 'Houston, We Have a Podcast',
          poster: mediaSamples.cover,
          src: mediaSamples.liveAudio,
        },
      }),
    },
  ],
  api: [
    {
      name: 'LiveVideoPlayer',
      description:
        'The Video.js live video preset and its skin, themed with the shadcn/ui tokens. The live button, the DVR window and the seek-back-to-edge behaviour come from the preset; the media element stays a separate item.',
      rows: [
        { prop: 'title', type: 'string | null', default: '-' },
        { prop: 'poster', type: 'string | null', default: '-' },
        {
          prop: 'aspectRatio',
          type: '\'video\' | \'classic\' | \'square\' | \'portrait\' | \'wide\' | \'auto\'',
          default: '\'video\'',
        },
        { prop: 'accentColor', type: 'string', default: 'Skin default' },
        {
          prop: 'objectFit',
          type: '\'contain\' | \'cover\' | \'fill\' | \'none\' | \'scale-down\'',
          default: 'Skin default',
        },
        { prop: 'objectPosition', type: 'string', default: 'Skin default' },
        {
          prop: 'renderPoster',
          type: '(props) => ReactNode',
          default: '-',
        },
        { prop: 'locale', type: 'string', default: '-' },
        { prop: 'className', type: 'string', default: '-' },
        { prop: 'style', type: 'CSSProperties', default: '-' },
        { prop: 'children', type: 'ReactNode', default: 'Required' },
      ],
    },
    {
      name: 'LiveAudioPlayer',
      description:
        'The Video.js live audio preset and its skin, for streams, radio and live episodes. It reports the title and the cover art, adapts to the page color scheme and accepts the same theme props as the on-demand audio shell.',
      rows: [
        { prop: 'title', type: 'string | null', default: '-' },
        { prop: 'poster', type: 'string | null', default: '-' },
        { prop: 'accentColor', type: 'string', default: 'Skin default' },
        { prop: 'locale', type: 'string', default: '-' },
        { prop: 'className', type: 'string', default: '-' },
        { prop: 'style', type: 'CSSProperties', default: '-' },
        { prop: 'children', type: 'ReactNode', default: 'Required' },
      ],
    },
  ],
}
