import { expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { page, userEvent } from 'vitest/browser'
import { ImageCompare } from '@/components/blocove/image/compare'
import { ImageGallery } from '@/components/blocove/image/gallery'
import { Image } from '@/components/blocove/image/image'
import { ImageZoom } from '@/components/blocove/image/zoom'
import { ImageShowcase } from '@/registry/blocove/blocks/image-showcase'

const launch = '/image/sample-launch-960.jpg'
const frames = [
  { alt: 'A frame from the launch trailer', src: '/image/sample-frame-a.jpg' },
  { alt: 'A second frame from the launch trailer', src: '/image/sample-frame-b.jpg' },
  { alt: 'A third frame from the launch trailer', src: '/image/sample-frame-c.jpg' },
]

function resize(src: string, width: number) {
  return src.replace(/-960\.jpg$/, `-${width}.jpg`)
}

it('loads a real image and keeps its reserved box', async () => {
  await render(
    <Image
      alt="Launch"
      aspectRatio="16 / 9"
      sizes="100vw"
      src={launch}
      transform={resize}
      widths={[320, 640]}
    />,
  )

  await expect.element(page.getByAltText('Launch')).toBeVisible()
  await expect.poll(
    () => document.querySelector('[data-slot="image"]')?.getAttribute('data-state'),
    { timeout: 8000 },
  ).toBe('loaded')

  const image = document.querySelector('img')

  expect(image?.getAttribute('srcset')).toBe(
    '/image/sample-launch-320.jpg 320w, /image/sample-launch-640.jpg 640w',
  )
  expect((document.querySelector('[data-slot="image"]') as HTMLElement).style.aspectRatio).toBe('16 / 9')
})

it('opens the zoom dialog, closes on Escape and returns focus', async () => {
  await render(
    <ImageZoom
      alt="Launch"
      caption="A still from the launch trailer."
      src={launch}
    />,
  )

  const trigger = document.querySelector('[data-slot="image-zoom"]') as HTMLElement

  await page.getByRole('button', { name: 'Zoom image: Launch' }).click()
  await expect.poll(
    () => document.querySelector('[data-slot="dialog-content"]'),
    { timeout: 8000 },
  ).not.toBeNull()

  await userEvent.keyboard('{Escape}')
  await expect.poll(
    () => document.querySelector('[data-slot="dialog-content"]'),
    { timeout: 8000 },
  ).toBeNull()

  await expect.poll(() => document.activeElement === trigger, { timeout: 8000 }).toBe(true)
})

it('moves the gallery selection with the keyboard', async () => {
  await render(<ImageGallery images={frames} />)

  const group = document.querySelector('[role="group"]') as HTMLElement
  const buttons = [
    ...group.querySelectorAll('button'),
  ]

  buttons[0].focus()
  await userEvent.keyboard('{ArrowRight}')

  expect(buttons[1].getAttribute('aria-current')).toBe('true')
  await expect.poll(
    () => document.querySelector('[data-slot="image-zoom"] img')?.getAttribute('src'),
    { timeout: 8000 },
  ).toBe('/image/sample-frame-b.jpg')
})

it('drives the comparison split with the range input', async () => {
  await render(
    <ImageCompare
      after={{ alt: 'Color', src: '/image/sample-after-960.jpg' }}
      before={{ alt: 'Black and white', src: '/image/sample-before-960.jpg' }}
    />,
  )

  const input = document.querySelector('input[type="range"]') as HTMLInputElement
  const before = document.querySelector('[data-slot="image-compare-before"]') as HTMLElement

  expect(input.value).toBe('50')
  expect(before.style.clipPath).toContain('50%')

  input.focus()
  await userEvent.keyboard('{ArrowRight}')

  await expect.poll(() => input.value, { timeout: 8000 }).toBe('51')
  expect(before.style.clipPath).toContain('49%')
})

it('renders the showcase photo story with its gallery', async () => {
  await render(
    <ImageShowcase
      credit="NASA"
      href="https://images.nasa.gov/"
      images={[
        {
          alt: 'The launch vehicle on the pad',
          caption: 'A still from the launch trailer.',
          src: launch,
        },
        ...frames,
      ]}
      meta={['Four stills']}
      title="Around the Moon"
    />,
  )

  await expect.element(page.getByRole('heading', { name: 'Around the Moon' })).toBeVisible()
  await expect.element(page.getByRole('link', { name: /View original/ })).toBeVisible()

  const thumbnails = document.querySelectorAll('[data-slot="image-gallery"] [role="group"] button')

  expect(thumbnails).toHaveLength(3)
})
