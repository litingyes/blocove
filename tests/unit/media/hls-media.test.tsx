import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HlsAudioMedia } from '@/components/blocove/media/hls-audio'
import { HlsVideoMedia } from '@/components/blocove/media/hls-video'

interface HlsMediaMockProps {
  children?: ReactNode
  source?: { src?: string } | null
  [key: string]: unknown
}

vi.mock('@videojs/react/media/hls-video', () => ({
  HlsVideo: ({ children, source, ...props }: HlsMediaMockProps) => (
    <video data-source-src={source?.src} data-testid="hls-video-media" {...props}>
      {children}
    </video>
  ),
}))

vi.mock('@videojs/react/media/hls-audio', () => ({
  HlsAudio: ({ children, source, ...props }: HlsMediaMockProps) => (
    <audio data-source-src={source?.src} data-testid="hls-audio-media" {...props}>
      {children}
    </audio>
  ),
}))

describe('hlsVideoMedia', () => {
  it('renders the adaptive video element with the manifest and the Blocove defaults', () => {
    const { getByTestId } = render(
      <HlsVideoMedia src="/media/hls/sample-video.m3u8" />,
    )
    const media = getByTestId('hls-video-media')

    expect(media.getAttribute('src')).toBe('/media/hls/sample-video.m3u8')
    expect(media.getAttribute('preload')).toBe('metadata')
    expect(media.hasAttribute('playsinline')).toBe(true)
  })

  it('forwards a source descriptor and lets the caller override the defaults', () => {
    const { getByTestId } = render(
      <HlsVideoMedia
        crossOrigin="anonymous"
        playsInline={false}
        preload="none"
        source={{ src: '/media/hls/sample-video.m3u8', type: 'application/x-mpegURL' }}
      />,
    )
    const media = getByTestId('hls-video-media')

    expect(media.dataset.sourceSrc).toBe('/media/hls/sample-video.m3u8')
    expect(media.getAttribute('crossorigin')).toBe('anonymous')
    expect(media.getAttribute('preload')).toBe('none')
    expect(media.hasAttribute('playsinline')).toBe(false)
  })

  it('renders one track per declaration with captions as the default kind', () => {
    const { container } = render(
      <HlsVideoMedia
        src="/media/hls/sample-video.m3u8"
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
      />,
    )
    const tracks = [
      ...container.querySelectorAll('track'),
    ]

    expect(tracks).toHaveLength(2)
    expect(tracks[0].getAttribute('kind')).toBe('captions')
    expect(tracks[0].getAttribute('label')).toBe('English')
    expect(tracks[0].getAttribute('src')).toBe('/en.vtt')
    expect(tracks[0].getAttribute('srclang')).toBe('en')
    expect(tracks[0].hasAttribute('default')).toBe(true)
    expect(tracks[1].getAttribute('kind')).toBe('subtitles')
    expect(tracks[1].hasAttribute('default')).toBe(false)
  })

  it('leaves the media bare when no tracks are declared', () => {
    const { container } = render(
      <HlsVideoMedia src="/media/hls/sample-video.m3u8" />,
    )

    expect(container.querySelectorAll('track')).toHaveLength(0)
  })

  it('renders its own children inside the media element', () => {
    const { getByTestId } = render(
      <HlsVideoMedia src="/media/hls/sample-video.m3u8">
        <span data-testid="media-child" />
      </HlsVideoMedia>,
    )

    expect(getByTestId('hls-video-media').querySelector('[data-testid="media-child"]')).not.toBeNull()
  })
})

describe('hlsAudioMedia', () => {
  it('renders the adaptive audio element with the manifest and a metadata preload', () => {
    const { getByTestId } = render(
      <HlsAudioMedia source={{ src: '/media/hls/sample-audio.m3u8' }} />,
    )
    const media = getByTestId('hls-audio-media')

    expect(media.dataset.sourceSrc).toBe('/media/hls/sample-audio.m3u8')
    expect(media.getAttribute('preload')).toBe('metadata')
  })

  it('forwards the native attributes and lets the caller override the preload', () => {
    const { getByTestId } = render(
      <HlsAudioMedia crossOrigin="use-credentials" preload="auto" src="/media/hls/sample-audio.m3u8" />,
    )
    const media = getByTestId('hls-audio-media')

    expect(media.getAttribute('src')).toBe('/media/hls/sample-audio.m3u8')
    expect(media.getAttribute('crossorigin')).toBe('use-credentials')
    expect(media.getAttribute('preload')).toBe('auto')
  })

  it('renders the declared tracks with their attributes', () => {
    const { container } = render(
      <HlsAudioMedia
        src="/media/hls/sample-audio.m3u8"
        tracks={[
          {
            src: '/episode.vtt',
            label: 'English',
            srcLang: 'en',
            default: true,
          },
        ]}
      />,
    )
    const track = container.querySelector('track')

    expect(container.querySelectorAll('track')).toHaveLength(1)
    expect(track?.getAttribute('kind')).toBe('captions')
    expect(track?.getAttribute('label')).toBe('English')
    expect(track?.getAttribute('src')).toBe('/episode.vtt')
    expect(track?.getAttribute('srclang')).toBe('en')
    expect(track?.hasAttribute('default')).toBe(true)
  })

  it('leaves the audio element bare when no tracks are declared', () => {
    const { container } = render(
      <HlsAudioMedia src="/media/hls/sample-audio.m3u8" />,
    )

    expect(container.querySelectorAll('track')).toHaveLength(0)
  })
})
