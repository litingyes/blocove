import type { DocsPage } from '@/docs/types'
import AmbientVideoDemo from '@/docs/examples/media/ambient-video'
import { mediaSamples } from '@/docs/examples/media/content'
import { ambientVideoUsage } from '@/docs/snippets/media'

export const docsPage: DocsPage = {
  item: 'ambient-video',
  examples: [
    {
      title: 'Default',
      component: AmbientVideoDemo,
      code: ambientVideoUsage({
        src: mediaSamples.video,
        poster: mediaSamples.poster,
      }),
    },
  ],
  note: 'The background preset mutes and loops the video itself, so it can autoplay without a gesture and needs no controls. The element is decorative: put the meaning in the content you render on top, and pass `autoPlay={false}` when a visitor asks for reduced motion.',
  api: [
    {
      name: 'AmbientVideo',
      description:
        'A chrome-less background video: autoplaying, muted and looping, with a slot for the content drawn over it. The slot renders next to the player, so give that content its own positioning.',
      rows: [
        { prop: 'src', type: 'string', default: 'Required' },
        { prop: 'poster', type: 'string', default: '-' },
        {
          prop: 'aspectRatio',
          type: '\'video\' | \'classic\' | \'square\' | \'portrait\' | \'wide\' | \'auto\'',
          default: '\'video\'',
        },
        { prop: 'autoPlay', type: 'boolean', default: 'true' },
        { prop: 'className', type: 'string', default: '-' },
        { prop: 'style', type: 'CSSProperties', default: '-' },
        { prop: 'children', type: 'ReactNode', default: '-' },
      ],
    },
  ],
}
