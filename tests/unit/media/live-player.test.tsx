import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LiveAudioPlayer, LiveVideoPlayer } from '@/components/blocove/media/live'

interface PlayerMockProps {
  children?: ReactNode
  poster?: string | null
  title?: string | null
}

interface SkinMockProps {
  children?: ReactNode
  className?: string
  renderPoster?: ReactNode
  style?: Record<string, unknown>
}

vi.mock('@videojs/react', () => ({
  I18nProvider: ({ children, locale }: { children?: ReactNode, locale?: string }) => (
    <div data-locale={locale} data-testid="i18n-provider">
      {children}
    </div>
  ),
}))

vi.mock('@videojs/react/live-video', () => ({
  LiveVideoPlayer: ({ children, poster, title }: PlayerMockProps) => (
    <div data-poster={poster ?? ''} data-testid="live-video-player" data-title={title ?? ''}>
      {children}
    </div>
  ),
  LiveVideoSkin: ({ children, className, renderPoster, style }: SkinMockProps) => (
    <div className={className} data-testid="live-video-skin" style={style}>
      {renderPoster
        ? <div data-testid="live-video-poster-slot">{renderPoster}</div>
        : null}
      {children}
    </div>
  ),
}))

vi.mock('@videojs/react/live-audio', () => ({
  LiveAudioPlayer: ({ children, poster, title }: PlayerMockProps) => (
    <div data-poster={poster ?? ''} data-testid="live-audio-player" data-title={title ?? ''}>
      {children}
    </div>
  ),
  LiveAudioSkin: ({ children, className, style }: SkinMockProps) => (
    <div className={className} data-testid="live-audio-skin" style={style}>
      {children}
    </div>
  ),
}))

describe('liveVideoPlayer', () => {
  it('forwards the title and the poster to the live player', () => {
    const { getByTestId } = render(
      <LiveVideoPlayer poster="/live-poster.jpg" title="Always on">
        <video data-testid="media" />
      </LiveVideoPlayer>,
    )
    const player = getByTestId('live-video-player')

    expect(player.dataset.title).toBe('Always on')
    expect(player.dataset.poster).toBe('/live-poster.jpg')
    expect(player.querySelector('[data-testid="live-video-skin"] [data-testid="media"]')).not.toBeNull()
  })

  it('composes the skin with the Blocove defaults and the default ratio', () => {
    const { getByTestId } = render(
      <LiveVideoPlayer>
        <video data-testid="media" />
      </LiveVideoPlayer>,
    )
    const skin = getByTestId('live-video-skin')

    expect(skin.className).toContain('w-full')
    expect(skin.style.aspectRatio).toBe('16 / 9')
    expect(skin.style.getPropertyValue('--media-border-radius')).toBe('var(--radius, 0.625rem)')
    expect(skin.style.getPropertyValue('--media-font-family')).toBe('var(--font-sans, inherit)')
    expect(skin.style.getPropertyValue('--media-scale-unit')).toBe('1rem')
    expect(skin.style.getPropertyValue('--media-accent-color')).toBe('')
  })

  it('themes the skin from the props and lets the caller override the derived styles', () => {
    const { getByTestId } = render(
      <LiveVideoPlayer
        accentColor="#f5c518"
        aspectRatio="square"
        className="rounded-xl"
        objectFit="cover"
        objectPosition="center 20%"
        style={{ 'aspectRatio': '4 / 3', '--media-scale-unit': '0.75rem' } as React.CSSProperties}
      >
        <video data-testid="media" />
      </LiveVideoPlayer>,
    )
    const skin = getByTestId('live-video-skin')

    expect(skin.className).toContain('w-full')
    expect(skin.className).toContain('rounded-xl')
    expect(skin.style.aspectRatio).toBe('4 / 3')
    expect(skin.style.getPropertyValue('--media-accent-color')).toBe('#f5c518')
    expect(skin.style.getPropertyValue('--media-object-fit')).toBe('cover')
    expect(skin.style.getPropertyValue('--media-object-position')).toBe('center 20%')
    expect(skin.style.getPropertyValue('--media-scale-unit')).toBe('0.75rem')
  })

  it('maps the other named aspect ratios', () => {
    const { getByTestId } = render(
      <LiveVideoPlayer aspectRatio="portrait">
        <video data-testid="media" />
      </LiveVideoPlayer>,
    )

    expect(getByTestId('live-video-skin').style.aspectRatio).toBe('9 / 16')
  })

  it('does not reserve a ratio for the auto layout', () => {
    const { getByTestId } = render(
      <LiveVideoPlayer aspectRatio="auto">
        <video data-testid="media" />
      </LiveVideoPlayer>,
    )

    expect(getByTestId('live-video-skin').style.aspectRatio).toBe('')
  })

  it('passes the poster renderer through to the skin', () => {
    const { getByTestId } = render(
      <LiveVideoPlayer renderPoster={<img alt="Live cover" data-testid="custom-poster" />}>
        <video data-testid="media" />
      </LiveVideoPlayer>,
    )

    expect(getByTestId('live-video-skin').contains(getByTestId('custom-poster'))).toBe(true)
  })

  it('leaves the poster slot out when no renderer is given', () => {
    const { queryByTestId } = render(
      <LiveVideoPlayer>
        <video data-testid="media" />
      </LiveVideoPlayer>,
    )

    expect(queryByTestId('live-video-poster-slot')).toBeNull()
  })

  it('wraps the skin in the i18n provider when a locale is given', () => {
    const { getByTestId } = render(
      <LiveVideoPlayer locale="ja">
        <video data-testid="media" />
      </LiveVideoPlayer>,
    )
    const provider = getByTestId('i18n-provider')

    expect(provider.dataset.locale).toBe('ja')
    expect(provider.querySelector('[data-testid="live-video-skin"]')).not.toBeNull()
    expect(getByTestId('live-video-player').contains(provider)).toBe(true)
  })

  it('does not wrap the skin when no locale is given', () => {
    const { getByTestId, queryByTestId } = render(
      <LiveVideoPlayer>
        <video data-testid="media" />
      </LiveVideoPlayer>,
    )

    expect(queryByTestId('i18n-provider')).toBeNull()
    expect(getByTestId('live-video-skin')).not.toBeNull()
  })
})

describe('liveAudioPlayer', () => {
  it('forwards the title and the cover art to the live player', () => {
    const { getByTestId } = render(
      <LiveAudioPlayer poster="/live-cover.jpg" title="Morning radio">
        <audio data-testid="media" />
      </LiveAudioPlayer>,
    )
    const player = getByTestId('live-audio-player')

    expect(player.dataset.title).toBe('Morning radio')
    expect(player.dataset.poster).toBe('/live-cover.jpg')
    expect(player.querySelector('[data-testid="live-audio-skin"] [data-testid="media"]')).not.toBeNull()
  })

  it('themes the skin with the Blocove defaults', () => {
    const { getByTestId } = render(
      <LiveAudioPlayer>
        <audio data-testid="media" />
      </LiveAudioPlayer>,
    )
    const skin = getByTestId('live-audio-skin')

    expect(skin.className).toContain('w-full')
    expect(skin.style.getPropertyValue('--media-border-radius')).toBe('var(--radius, 0.625rem)')
    expect(skin.style.getPropertyValue('--media-scale-unit')).toBe('1rem')
    expect(skin.style.getPropertyValue('--media-accent-color')).toBe('')
    expect(skin.style.aspectRatio).toBe('')
  })

  it('sets the accent color and lets the caller override the derived styles', () => {
    const { getByTestId } = render(
      <LiveAudioPlayer
        accentColor="#22c55e"
        className="rounded-lg"
        style={{ '--media-scale-unit': '0.5rem' } as React.CSSProperties}
      >
        <audio data-testid="media" />
      </LiveAudioPlayer>,
    )
    const skin = getByTestId('live-audio-skin')

    expect(skin.className).toContain('w-full')
    expect(skin.className).toContain('rounded-lg')
    expect(skin.style.getPropertyValue('--media-accent-color')).toBe('#22c55e')
    expect(skin.style.getPropertyValue('--media-scale-unit')).toBe('0.5rem')
  })

  it('wraps the skin in the i18n provider when a locale is given', () => {
    const { getByTestId } = render(
      <LiveAudioPlayer locale="zh-CN">
        <audio data-testid="media" />
      </LiveAudioPlayer>,
    )
    const provider = getByTestId('i18n-provider')

    expect(provider.dataset.locale).toBe('zh-CN')
    expect(provider.querySelector('[data-testid="live-audio-skin"]')).not.toBeNull()
    expect(getByTestId('live-audio-player').contains(provider)).toBe(true)
  })

  it('does not wrap the skin when no locale is given', () => {
    const { getByTestId, queryByTestId } = render(
      <LiveAudioPlayer>
        <audio data-testid="media" />
      </LiveAudioPlayer>,
    )

    expect(queryByTestId('i18n-provider')).toBeNull()
    expect(getByTestId('live-audio-skin')).not.toBeNull()
  })
})
