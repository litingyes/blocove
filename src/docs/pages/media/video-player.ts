import type { DocsPage } from '@/docs/types'
import { mediaSamples } from '@/docs/examples/media/content'
import VideoPlayerDemo from '@/docs/examples/media/video-player'
import { videoPlayerUsage } from '@/docs/snippets/media'

export const docsPage: DocsPage = {
  item: 'video-player',
  examples: [
    {
      title: 'Default',
      component: VideoPlayerDemo,
      code: videoPlayerUsage({
        title: 'Composable media components',
        poster: mediaSamples.poster,
        src: mediaSamples.video,
        tracks: [
          {
            src: mediaSamples.captions,
            label: 'English',
            srcLang: 'en',
            default: true,
          },
        ],
      }),
    },
  ],
  note: 'The shell is the Video.js video preset and its skin; the media element is a separate component, so the shell never needs to change when the source does. The skin only exposes its published settings, and Blocove sets them from your shadcn/ui tokens: radius, hairline, font and scale follow theme changes, while the accent keeps the contrasting default unless you pass `accentColor`.',
  api: [
    {
      name: 'VideoPlayer',
      description:
        'The on-demand video preset and its skin, themed with the shadcn/ui tokens. Compose the media inside it. The player element renders nothing itself, so the classic shadcn attributes (`className`, `style`, `children`) belong to this component.',
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
        { prop: 'className', type: 'string', default: '-' },
        { prop: 'style', type: 'CSSProperties', default: '-' },
        {
          prop: 'children',
          type: 'ReactNode',
          default: 'Required',
        },
      ],
    },
    {
      name: 'VideoMedia',
      description:
        'The native `<video>` element. It registers itself as the player\'s media on mount and forwards every native attribute, so `autoPlay`, `muted`, `loop` and the media events work as usual.',
      rows: [
        { prop: 'src', type: 'string', default: '-' },
        { prop: 'tracks', type: 'MediaTrack[]', default: '-' },
        {
          prop: 'playsInline',
          type: 'boolean',
          default: 'true',
        },
        {
          prop: 'preload',
          type: '\'none\' | \'metadata\' | \'auto\'',
          default: '\'metadata\'',
        },
        {
          prop: '...props',
          type: 'VideoHTMLAttributes<HTMLVideoElement>',
          default: '-',
        },
      ],
    },
    {
      name: 'MediaTrack',
      description:
        'One text track. Captions are the default kind, and the same declarations feed the video and audio media components.',
      rows: [
        { prop: 'src', type: 'string', default: 'Required' },
        { prop: 'label', type: 'string', default: 'Required' },
        { prop: 'srcLang', type: 'string', default: 'Required' },
        {
          prop: 'kind',
          type: '\'captions\' | \'subtitles\' | \'descriptions\' | \'chapters\' | \'metadata\'',
          default: '\'captions\'',
        },
        { prop: 'default', type: 'boolean', default: '-' },
      ],
    },
  ],
}
