import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AudioMedia, AudioPlayer } from '@/components/blocove/media/audio'

vi.mock('@videojs/react', () => ({
  I18nProvider: ({ children, locale }: { children?: ReactNode, locale?: string }) => (
    <div data-locale={locale} data-testid="i18n-provider">
      {children}
    </div>
  ),
}))

vi.mock('@videojs/react/audio', () => ({
  AudioPlayer: ({ children, title, poster }: { children: ReactNode, title?: string | null, poster?: string | null }) => (
    <div data-poster={poster ?? ''} data-testid="audiojs-player" data-title={title ?? ''}>
      {children}
    </div>
  ),
  AudioSkin: ({ children, className, style }: { children: ReactNode, className?: string, style?: Record<string, unknown> }) => (
    <div className={className} data-testid="audiojs-skin" style={style}>
      {children}
    </div>
  ),
  Audio: ({ children, ...props }: Record<string, unknown> & { children?: ReactNode }) => (
    <audio data-testid="audiojs-media" {...props}>
      {children}
    </audio>
  ),
}))

describe('audioPlayer', () => {
  it('forwards the title and the cover art, and themes the skin', () => {
    const { getByTestId } = render(
      <AudioPlayer
        accentColor="#22c55e"
        className="rounded-lg"
        poster="/cover.jpg"
        title="Episode twelve"
      >
        <AudioMedia src="/episode.m4a" />
      </AudioPlayer>,
    )
    const player = getByTestId('audiojs-player')
    const skin = getByTestId('audiojs-skin')

    expect(player.dataset.title).toBe('Episode twelve')
    expect(player.dataset.poster).toBe('/cover.jpg')
    expect(skin.className).toContain('w-full')
    expect(skin.className).toContain('rounded-lg')
    expect(skin.style.getPropertyValue('--media-accent-color')).toBe('#22c55e')
    expect(skin.style.getPropertyValue('--media-border-radius')).toBe('var(--radius, 0.625rem)')
    expect(skin.style.aspectRatio).toBe('')
  })

  it('wraps the skin in the i18n provider when a locale is given', () => {
    const { getByTestId } = render(
      <AudioPlayer locale="de">
        <AudioMedia src="/episode.m4a" />
      </AudioPlayer>,
    )
    const provider = getByTestId('i18n-provider')

    expect(provider.dataset.locale).toBe('de')
    expect(provider.querySelector('[data-testid="audiojs-skin"]')).not.toBeNull()
    expect(getByTestId('audiojs-player').contains(provider)).toBe(true)
  })

  it('does not wrap the skin when no locale is given', () => {
    const { getByTestId, queryByTestId } = render(
      <AudioPlayer>
        <AudioMedia src="/episode.m4a" />
      </AudioPlayer>,
    )

    expect(queryByTestId('i18n-provider')).toBeNull()
    expect(getByTestId('audiojs-skin')).not.toBeNull()
  })
})

describe('audioMedia', () => {
  it('renders the native audio element with tracks and a metadata preload', () => {
    const { container, getByTestId } = render(
      <AudioMedia
        src="/episode.m4a"
        tracks={[
          { src: '/episode.vtt', label: 'English', srcLang: 'en' },
        ]}
      />,
    )
    const media = getByTestId('audiojs-media')

    expect(media.getAttribute('src')).toBe('/episode.m4a')
    expect(media.getAttribute('preload')).toBe('metadata')
    expect(container.querySelectorAll('track')).toHaveLength(1)
    expect(container.querySelector('track')?.getAttribute('kind')).toBe('captions')
  })

  it('forwards native attributes', () => {
    const { getByTestId } = render(
      <AudioMedia loop src="/episode.m4a" />,
    )

    expect(getByTestId('audiojs-media').hasAttribute('loop')).toBe(true)
  })
})
