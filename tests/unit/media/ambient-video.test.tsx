import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AmbientVideo } from '@/components/blocove/media/ambient-video'

vi.mock('@videojs/react/background', () => ({
  BackgroundVideoPlayer: ({ children }: { children: ReactNode }) => (
    <div data-testid="background-player">{children}</div>
  ),
  BackgroundVideoSkin: ({ children, className }: { children: ReactNode, className?: string }) => (
    <div className={className} data-testid="background-skin">{children}</div>
  ),
  BackgroundVideo: (props: Record<string, unknown>) => (
    <video data-testid="background-media" {...props} />
  ),
}))

describe('ambientVideo', () => {
  it('renders the player, the skin and the media', () => {
    const { getByTestId } = render(
      <AmbientVideo poster="/poster.jpg" src="/loop.mp4" />,
    )
    const media = getByTestId('background-media')

    expect(getByTestId('background-player')).toBeTruthy()
    expect(getByTestId('background-skin').className).toContain('h-full')
    expect(media.getAttribute('src')).toBe('/loop.mp4')
    expect(media.getAttribute('poster')).toBe('/poster.jpg')
    expect(media.getAttribute('autoplay')).not.toBeNull()
  })

  it('sizes the surface with the requested ratio', () => {
    const { container } = render(
      <AmbientVideo aspectRatio="wide" src="/loop.mp4" />,
    )
    const surface = container.querySelector<HTMLElement>('[data-slot="ambient-video"]')!

    expect(surface.dataset.slot).toBe('ambient-video')
    expect(surface.style.aspectRatio).toBe('21 / 9')
    expect(surface.style.getPropertyValue('--media-border-radius')).toBe('var(--radius, 0.625rem)')
  })

  it('does not reserve a ratio when the layout sizes the surface', () => {
    const { container } = render(
      <AmbientVideo aspectRatio="auto" className="absolute inset-0" src="/loop.mp4" />,
    )
    const surface = container.querySelector<HTMLElement>('[data-slot="ambient-video"]')!

    expect(surface.style.aspectRatio).toBe('')
    expect(surface.className).toContain('absolute')
    expect(surface.className).toContain('inset-0')
  })

  it('turns autoplay off for the reduced motion case', () => {
    const { getByTestId } = render(
      <AmbientVideo autoPlay={false} src="/loop.mp4" />,
    )

    expect(getByTestId('background-media').hasAttribute('autoplay')).toBe(false)
  })

  it('renders the overlay content next to the player', () => {
    const { container } = render(
      <AmbientVideo src="/loop.mp4">
        <h2>Composable media</h2>
      </AmbientVideo>,
    )
    const surface = container.querySelector('[data-slot="ambient-video"]')

    expect(surface?.querySelector('h2')?.textContent).toBe('Composable media')
    expect(surface?.querySelector('[data-testid="background-player"]')).not.toBeNull()
  })
})
