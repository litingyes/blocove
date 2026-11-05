import type { ReactNode } from 'react'
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AudioEpisodePlayer } from '@/registry/blocove/blocks/audio-episode-player'
import { VideoHero } from '@/registry/blocove/blocks/video-hero'
import { VideoPlaylist } from '@/registry/blocove/blocks/video-playlist'
import { VideoShowcase } from '@/registry/blocove/blocks/video-showcase'

vi.mock('@/components/blocove/media/video', () => ({
  VideoPlayer: ({ children, title }: { children: ReactNode, title?: string }) => (
    <div data-testid="player" data-title={title ?? ''}>{children}</div>
  ),
  VideoMedia: ({ src }: { src?: string }) => (
    <div data-src={src ?? ''} data-testid="media" />
  ),
}))

vi.mock('@/components/blocove/media/audio', () => ({
  AudioPlayer: ({ children, title }: { children: ReactNode, title?: string }) => (
    <div data-testid="audio-player" data-title={title ?? ''}>{children}</div>
  ),
  AudioMedia: ({ src }: { src?: string }) => (
    <div data-src={src ?? ''} data-testid="audio-media" />
  ),
}))

vi.mock('@/components/blocove/media/ambient-video', () => ({
  AmbientVideo: ({ src, children }: { src: string, children?: ReactNode }) => (
    <div data-src={src} data-testid="ambient">
      {children}
    </div>
  ),
}))

const tracks = [
  {
    src: '/en.vtt',
    label: 'English',
    srcLang: 'en',
    default: true,
  },
]

describe('videoHero', () => {
  it('renders the ambient video behind the headline, copy and actions', () => {
    const { getByText, getByTestId } = render(
      <VideoHero
        actions={<button type="button">Get started</button>}
        description="Small composable items."
        eyebrow="Blocove media"
        poster="/poster.jpg"
        src="/hero.mp4"
        title="Audio and video"
      />,
    )

    expect(getByTestId('ambient').dataset.src).toBe('/hero.mp4')
    expect(getByText('Blocove media')).toBeTruthy()
    expect(getByText('Audio and video')).toBeTruthy()
    expect(getByText('Small composable items.')).toBeTruthy()
    expect(getByText('Get started')).toBeTruthy()
  })

  it('leaves out the optional parts', () => {
    const { container, queryByRole } = render(
      <VideoHero src="/hero.mp4" title="Only a headline" />,
    )

    expect(queryByRole('button')).toBeNull()
    expect(container.querySelectorAll('p')).toHaveLength(0)
    expect(container.querySelector('h2')?.textContent).toBe('Only a headline')
  })
})

describe('videoShowcase', () => {
  it('renders the player, the caption, the facts and the actions', () => {
    const { getByTestId, getByText } = render(
      <VideoShowcase
        actions={<button type="button">Copy link</button>}
        description="A captioned video."
        eyebrow="Release notes"
        meta={['00:08', 'Captions']}
        poster="/poster.jpg"
        src="/clip.mp4"
        title="What ships"
        tracks={tracks}
      />,
    )

    expect(getByTestId('player').dataset.title).toBe('What ships')
    expect(getByTestId('media').dataset.src).toBe('/clip.mp4')
    expect(getByText('Release notes')).toBeTruthy()
    expect(getByText('00:08')).toBeTruthy()
    expect(getByText('Captions')).toBeTruthy()
    expect(getByText('Copy link')).toBeTruthy()
  })

  it('renders only the player when nothing else is passed', () => {
    const { container } = render(
      <VideoShowcase src="/clip.mp4" title="Bare video" />,
    )

    expect(container.querySelector('figcaption')).toBeNull()
    expect(container.querySelector('figure')).not.toBeNull()
  })
})

describe('audioEpisodePlayer', () => {
  it('renders the header facts, the cover and the player', () => {
    const { container, getByTestId, getByText } = render(
      <AudioEpisodePlayer
        actions={<button type="button">Subscribe</button>}
        cover="/cover.jpg"
        description="What the episode covers."
        duration="42 min"
        episode={12}
        publishedAt="November 2026"
        show="The Blocove Podcast"
        src="/episode.m4a"
        title="Composable media"
      />,
    )

    expect(getByText('Ep. 12')).toBeTruthy()
    expect(getByText('November 2026')).toBeTruthy()
    expect(getByText('42 min')).toBeTruthy()
    expect(getByText('The Blocove Podcast')).toBeTruthy()
    expect(getByTestId('audio-player').dataset.title).toBe('Composable media')
    expect(getByTestId('audio-media').dataset.src).toBe('/episode.m4a')
    expect(getByText('Subscribe')).toBeTruthy()
    expect(container.querySelector('[data-slot="audio-episode-player"] img')?.getAttribute('src')).toBe('/cover.jpg')
  })

  it('omits the fact row and the description when they are absent', () => {
    const { container } = render(
      <AudioEpisodePlayer src="/episode.m4a" title="Bare episode" />,
    )

    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelectorAll('p')).toHaveLength(0)
  })
})

describe('videoPlaylist', () => {
  const items = [
    {
      id: 'one',
      title: 'Composing the shell',
      src: '/one.mp4',
      duration: '12:40',
      description: 'First.',
    },
    {
      id: 'two',
      title: 'Swapping the media',
      src: '/two.mp4',
      duration: '08:15',
      description: 'Second.',
    },
  ]

  it('starts on the first entry and marks it current', () => {
    const { getByTestId, getAllByRole } = render(<VideoPlaylist items={items} />)

    expect(getByTestId('player').dataset.title).toBe('Composing the shell')
    expect(getByTestId('media').dataset.src).toBe('/one.mp4')
    expect(getAllByRole('button')[0].getAttribute('aria-current')).toBe('true')
    expect(getAllByRole('button')[1].getAttribute('aria-current')).toBeNull()
  })

  it('honours the default entry', () => {
    const { getByTestId } = render(
      <VideoPlaylist defaultId="two" items={items} />,
    )

    expect(getByTestId('player').dataset.title).toBe('Swapping the media')
    expect(getByTestId('media').dataset.src).toBe('/two.mp4')
  })

  it('swaps the media and the title when an entry is selected', () => {
    const { getAllByRole, getByTestId, getByText } = render(
      <VideoPlaylist items={items} />,
    )

    fireEvent.click(getAllByRole('button')[1])

    expect(getByTestId('player').dataset.title).toBe('Swapping the media')
    expect(getByTestId('media').dataset.src).toBe('/two.mp4')
    expect(getAllByRole('button')[1].getAttribute('aria-current')).toBe('true')
    expect(getByText('Second.')).toBeTruthy()
  })

  it('renders nothing for an empty playlist', () => {
    const { container } = render(<VideoPlaylist items={[]} />)

    expect(container.querySelector('[data-slot="video-playlist"]')).toBeNull()
  })
})
