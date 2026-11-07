import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  VideoMedia,
  VideoPlayer,
} from '@/components/blocove/media/video'

vi.mock('@videojs/react', () => ({
  I18nProvider: ({ children, locale }: { children?: ReactNode, locale?: string }) => (
    <div data-locale={locale} data-testid="i18n-provider">
      {children}
    </div>
  ),
}))

vi.mock('@videojs/react/video', () => ({
  VideoPlayer: ({ children, title, poster }: { children: ReactNode, title?: string | null, poster?: string | null }) => (
    <div data-poster={poster ?? ''} data-testid="videojs-player" data-title={title ?? ''}>
      {children}
    </div>
  ),
  VideoSkin: ({ children, className, renderThumbnail, style }: { children: ReactNode, className?: string, renderThumbnail?: ReactNode, style?: Record<string, unknown> }) => (
    <div className={className} data-testid="videojs-skin" style={style}>
      {renderThumbnail
        ? <div data-testid="videojs-thumbnail">{renderThumbnail}</div>
        : null}
      {children}
    </div>
  ),
  Video: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <video data-testid="videojs-media" {...props}>
      {children}
    </video>
  ),
}))

function setup() {
  return render(
    <VideoPlayer poster="/poster.jpg" title="Episode one">
      <VideoMedia
        src="/clip.mp4"
        tracks={[
          {
            src: '/en.vtt',
            label: 'English',
            srcLang: 'en',
            default: true,
          },
          {
            src: '/zh.vtt',
            label: '中文',
            srcLang: 'zh',
            kind: 'subtitles',
          },
        ]}
      />
    </VideoPlayer>,
  )
}

describe('videoPlayer', () => {
  it('forwards the title and the poster to the player', () => {
    const { getByTestId } = setup()

    expect(getByTestId('videojs-player').dataset.title).toBe('Episode one')
    expect(getByTestId('videojs-player').dataset.poster).toBe('/poster.jpg')
  })

  it('sets the skin theme from the shadcn tokens', () => {
    const { getByTestId } = setup()
    const skin = getByTestId('videojs-skin')

    expect(skin.style.getPropertyValue('--media-border-radius')).toBe('var(--radius, 0.625rem)')
    expect(skin.style.getPropertyValue('--media-font-family')).toBe('var(--font-sans, inherit)')
    expect(skin.style.getPropertyValue('--media-scale-unit')).toBe('1rem')
    expect(skin.style.aspectRatio).toBe('16 / 9')
    expect(skin.className).toContain('w-full')
  })

  it('lets the caller override the derived styles', () => {
    const { getByTestId } = render(
      <VideoPlayer
        accentColor="#f5c518"
        aspectRatio="square"
        className="rounded-xl"
        style={{ 'aspectRatio': '4 / 3', '--media-scale-unit': '0.75rem' } as React.CSSProperties}
      >
        <VideoMedia src="/clip.mp4" />
      </VideoPlayer>,
    )
    const skin = getByTestId('videojs-skin')

    expect(skin.style.getPropertyValue('--media-accent-color')).toBe('#f5c518')
    expect(skin.style.getPropertyValue('--media-scale-unit')).toBe('0.75rem')
    expect(skin.style.aspectRatio).toBe('4 / 3')
    expect(skin.className).toContain('rounded-xl')
  })

  it('passes the storyboard renderer through to the skin', () => {
    const { getByTestId } = render(
      <VideoPlayer renderThumbnail={<img alt="Storyboard" data-testid="storyboard" />}>
        <VideoMedia src="/clip.mp4" />
      </VideoPlayer>,
    )

    expect(getByTestId('videojs-skin').contains(getByTestId('storyboard'))).toBe(true)
  })

  it('leaves the storyboard slot out when no renderer is given', () => {
    const { queryByTestId } = setup()

    expect(queryByTestId('videojs-thumbnail')).toBeNull()
  })

  it('wraps the skin in the i18n provider when a locale is given', () => {
    const { getByTestId } = render(
      <VideoPlayer locale="fr">
        <VideoMedia src="/clip.mp4" />
      </VideoPlayer>,
    )
    const provider = getByTestId('i18n-provider')

    expect(provider.dataset.locale).toBe('fr')
    expect(provider.querySelector('[data-testid="videojs-skin"]')).not.toBeNull()
    expect(getByTestId('videojs-player').contains(provider)).toBe(true)
  })

  it('does not wrap the skin when no locale is given', () => {
    const { getByTestId, queryByTestId } = setup()

    expect(queryByTestId('i18n-provider')).toBeNull()
    expect(getByTestId('videojs-skin')).not.toBeNull()
  })
})

describe('videoMedia', () => {
  it('renders the native media element with the Blocove defaults', () => {
    const { getByTestId } = setup()
    const media = getByTestId('videojs-media')

    expect(media.getAttribute('src')).toBe('/clip.mp4')
    expect(media.getAttribute('playsinline')).not.toBeNull()
    expect(media.getAttribute('preload')).toBe('metadata')
  })

  it('renders one track per declaration with captions as the default kind', () => {
    const { container } = setup()
    const tracks = [
      ...container.querySelectorAll('track'),
    ]

    expect(tracks).toHaveLength(2)
    expect(tracks[0].getAttribute('kind')).toBe('captions')
    expect(tracks[0].hasAttribute('default')).toBe(true)
    expect(tracks[0].getAttribute('srclang')).toBe('en')
    expect(tracks[1].getAttribute('kind')).toBe('subtitles')
    expect(tracks[1].hasAttribute('default')).toBe(false)
  })

  it('forwards the native attributes and its own children', () => {
    const { getByTestId } = render(
      <VideoMedia crossOrigin="anonymous" muted src="/clip.mp4">
        <span data-testid="media-child" />
      </VideoMedia>,
    )
    const media = getByTestId('videojs-media')

    expect(media.getAttribute('crossorigin')).toBe('anonymous')
    expect(media.hasAttribute('muted')).toBe(true)
    expect(media.querySelector('[data-testid="media-child"]')).not.toBeNull()
  })
})
