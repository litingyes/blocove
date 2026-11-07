import { expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { page, userEvent } from 'vitest/browser'
import { AmbientVideo } from '@/components/blocove/media/ambient-video'
import { AudioMedia, AudioPlayer } from '@/components/blocove/media/audio'
import { HlsAudioMedia } from '@/components/blocove/media/hls-audio'
import { HlsVideoMedia } from '@/components/blocove/media/hls-video'
import { LiveAudioPlayer, LiveVideoPlayer } from '@/components/blocove/media/live'
import { VideoMedia, VideoPlayer } from '@/components/blocove/media/video'
import { VideoHero } from '@/registry/blocove/blocks/video-hero'
import { VideoPlaylist } from '@/registry/blocove/blocks/video-playlist'
import { hlsFixtures, mediaFixtures, mediaFixtureTracks } from '../helpers/media'

function elementLocator(selector: string) {
  const element = document.querySelector(selector)

  if (!element) {
    throw new Error(`Could not find ${selector}`)
  }

  return page.elementLocator(element)
}

function mediaElement() {
  return elementLocator('video')
}

/**
 * The HLS adapters drive the media element through MediaSource, so the manifest
 * URL never reaches the DOM: the engine appends a `<source>` child pointing at
 * the blob it created. Asserting that blob is the wiring these tests cover, no
 * playback — the headless Chromium build decodes no H.264.
 */
async function expectMediaSourceAttached(selector: 'audio' | 'video') {
  await expect.poll(
    () => {
      const media = document.querySelector(selector)

      if (!media) {
        return ''
      }

      return Array.from(media.querySelectorAll('source'))
        .map(source => source.getAttribute('src') ?? '')
        .join(',')
    },
    { timeout: 8000 },
  ).toContain('blob:')
}

async function waitForPlayback(selector = 'video') {
  await expect.poll(() => {
    const element = document.querySelector<HTMLMediaElement>(selector)

    return element
      ? Math.round(element.currentTime * 10) / 10
      : 0
  }, { timeout: 8000 }).toBeGreaterThan(0)
}

it('plays and pauses the sample video through the skin', async () => {
  await render(
    <VideoPlayer poster={mediaFixtures.poster} title="Sample clip">
      <VideoMedia src={mediaFixtures.video} />
    </VideoPlayer>,
  )

  await expect.element(mediaElement()).toBeVisible()

  const playButton = page.getByRole('button', { name: 'Play', exact: true })
  await playButton.click()

  await expect.poll(() => document.querySelector('video')?.paused, { timeout: 8000 }).toBe(false)
  await waitForPlayback()

  await page.getByRole('button', { name: 'Pause', exact: true }).click()
  await expect.poll(() => document.querySelector('video')?.paused, { timeout: 8000 }).toBe(true)
})

it('renders the declared captions as a default track', async () => {
  await render(
    <VideoPlayer title="Captioned clip">
      <VideoMedia src={mediaFixtures.video} tracks={mediaFixtureTracks} />
    </VideoPlayer>,
  )

  await expect.element(mediaElement()).toBeVisible()

  // The declaration becomes a native track and the player enables it, so the
  // captions menu and the burned-in cues both see it.
  await expect.poll(() => {
    const media = document.querySelector('video')

    return media
      ? [...media.textTracks].map(track => track.mode).join(',')
      : ''
  }, { timeout: 8000 }).toContain('showing')

  const track = document.querySelector('video track')

  expect(track?.getAttribute('src')).toBe(mediaFixtures.captions)
  expect(track?.getAttribute('srclang')).toBe('en')
  expect(track?.hasAttribute('default')).toBe(true)
})

it('plays the sample audio', async () => {
  await render(
    <AudioPlayer poster={mediaFixtures.poster} title="Sample episode">
      <AudioMedia src={mediaFixtures.audio} />
    </AudioPlayer>,
  )

  expect(document.querySelector('audio')).not.toBeNull()

  await page.getByRole('button', { name: 'Play', exact: true }).click()
  await waitForPlayback('audio')

  expect(document.querySelector<HTMLAudioElement>('audio')?.paused).toBe(false)
})

it('autoplays the ambient video muted and looped', async () => {
  await render(
    <AmbientVideo poster={mediaFixtures.poster} src={mediaFixtures.video} />,
  )

  await expect.poll(() => {
    const element = document.querySelector<HTMLVideoElement>('video')

    return element
      ? `${element.muted}:${element.loop}`
      : ''
  }, { timeout: 8000 }).toBe('true:true')
})

it('swaps the media when a playlist entry is selected', async () => {
  await render(
    <VideoPlaylist
      items={[
        {
          id: 'one',
          title: 'Composing the shell',
          src: mediaFixtures.video,
          poster: mediaFixtures.poster,
          duration: '00:08',
        },
        {
          id: 'two',
          title: 'Swapping the media',
          src: mediaFixtures.videoAlt,
          poster: mediaFixtures.posterAlt,
          duration: '00:08',
        },
      ]}
    />,
  )

  await expect.element(page.getByRole('heading', { name: 'Composing the shell' })).toBeVisible()

  await userEvent.click(page.getByRole('button', { name: /Swapping the media/ }))

  await expect.element(page.getByRole('heading', { name: 'Swapping the media' })).toBeVisible()

  await expect.poll(
    () => document.querySelector('video')?.getAttribute('src') ?? '',
    { timeout: 8000 },
  ).toContain('sample-video-alt.webm')
})

it('draws the hero content over the ambient video', async () => {
  await render(
    <VideoHero
      description="Small composable items."
      poster={mediaFixtures.poster}
      src={mediaFixtures.video}
      title="Audio and video, built from small items"
    />,
  )

  await expect.element(
    page.getByRole('heading', { name: 'Audio and video, built from small items' }),
  ).toBeVisible()
  await expect.element(page.getByText('Small composable items.')).toBeVisible()
  expect(document.querySelectorAll('video')).toHaveLength(1)
})

it('mounts the HLS video through the video player', async () => {
  await render(
    <VideoPlayer poster={mediaFixtures.poster} title="HLS clip">
      <HlsVideoMedia src={hlsFixtures.video} />
    </VideoPlayer>,
  )

  await expect.element(mediaElement()).toBeVisible()
  expect(document.querySelector('video')?.hasAttribute('playsinline')).toBe(true)
  await expectMediaSourceAttached('video')
  await expect.element(page.getByRole('button', { name: 'Play', exact: true })).toBeVisible()
})

it('mounts the HLS audio through the audio player', async () => {
  await render(
    <AudioPlayer poster={mediaFixtures.poster} title="HLS episode">
      <HlsAudioMedia src={hlsFixtures.audio} />
    </AudioPlayer>,
  )

  // The skin hides the element itself, so mount it without asking for layout.
  expect(document.querySelector('audio')).not.toBeNull()
  await expectMediaSourceAttached('audio')
  await expect.element(page.getByRole('button', { name: 'Play', exact: true })).toBeVisible()
})

it('mounts the live HLS video through the live player', async () => {
  await render(
    <LiveVideoPlayer poster={mediaFixtures.poster} title="Live clip">
      {/* Pin the stream type: this Chromium decodes no H.264, so waiting for the
          engine to probe the manifest would race the live layout. */}
      <HlsVideoMedia src={hlsFixtures.liveVideo} streamType="live" />
    </LiveVideoPlayer>,
  )

  await expect.element(mediaElement()).toBeVisible()
  await expectMediaSourceAttached('video')
  await expect.element(page.getByRole('button', { name: 'Play', exact: true })).toBeVisible()
  // The live skin replaces the time controls with a live button, so its
  // presence proves the live preset rendered the media. Its label follows the
  // playhead ("Playing live" at the edge, "Seek to live edge" behind it).
  await expect.element(page.getByRole('button', { name: /live/i })).toBeVisible()
})

it('mounts the live HLS audio through the live player', async () => {
  await render(
    <LiveAudioPlayer poster={mediaFixtures.poster} title="Live radio">
      <HlsAudioMedia src={hlsFixtures.liveAudio} />
    </LiveAudioPlayer>,
  )

  // The skin hides the element itself, so mount it without asking for layout.
  expect(document.querySelector('audio')).not.toBeNull()
  await expectMediaSourceAttached('audio')
  await expect.element(page.getByRole('button', { name: 'Play', exact: true })).toBeVisible()
  await expect.element(page.getByRole('button', { name: /live/i })).toBeVisible()
})
