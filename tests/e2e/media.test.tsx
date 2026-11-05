import { expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { page, userEvent } from 'vitest/browser'
import { AmbientVideo } from '@/components/blocove/media/ambient-video'
import { AudioMedia, AudioPlayer } from '@/components/blocove/media/audio'
import { VideoMedia, VideoPlayer } from '@/components/blocove/media/video'
import { VideoHero } from '@/registry/blocove/blocks/video-hero'
import { VideoPlaylist } from '@/registry/blocove/blocks/video-playlist'
import { mediaFixtures, mediaFixtureTracks } from '../helpers/media'

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
