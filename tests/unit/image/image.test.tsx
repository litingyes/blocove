import { fireEvent, render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Image } from '@/components/blocove/image/image'

function imageWrapper(container: HTMLElement) {
  return container.querySelector('[data-slot="image"]') as HTMLElement
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('image', () => {
  it('renders the native image with Blocove defaults', () => {
    const { getByAltText } = render(<Image alt="Launch" src="/photo.jpg" />)
    const image = getByAltText('Launch') as HTMLImageElement

    expect(image.getAttribute('src')).toBe('/photo.jpg')
    expect(image.getAttribute('loading')).toBe('lazy')
    expect(image.getAttribute('decoding')).toBe('async')
    expect(image.getAttribute('fetchpriority')).toBe('auto')
  })

  it('loads the image eagerly when it is a priority image', () => {
    const { getByAltText } = render(
      <Image alt="Hero" priority src="/hero.jpg" />,
    )
    const image = getByAltText('Hero') as HTMLImageElement

    expect(image.getAttribute('loading')).toBe('eager')
    expect(image.getAttribute('decoding')).toBe('sync')
    expect(image.getAttribute('fetchpriority')).toBe('high')
  })

  it('derives the aspect ratio from explicit dimensions', () => {
    const { container, getByAltText } = render(
      <Image alt="Launch" height={540} src="/photo.jpg" width={960} />,
    )
    const image = getByAltText('Launch') as HTMLImageElement

    expect(image.getAttribute('width')).toBe('960')
    expect(image.getAttribute('height')).toBe('540')
    expect(imageWrapper(container).style.aspectRatio).toBe('960 / 540')
  })

  it('lets an explicit aspect ratio win', () => {
    const { container } = render(
      <Image alt="Launch" aspectRatio="4 / 3" height={540} src="/photo.jpg" width={960} />,
    )

    expect(imageWrapper(container).style.aspectRatio).toBe('4 / 3')
  })

  it('builds the srcset from widths and a transform', () => {
    const { getByAltText } = render(
      <Image
        alt="Launch"
        sizes="(min-width: 768px) 640px, 100vw"
        src="/photo.jpg"
        transform={(src, width) => `${src}?w=${width}`}
        widths={[320, 640]}
      />,
    )
    const image = getByAltText('Launch') as HTMLImageElement

    expect(image.getAttribute('srcset')).toBe('/photo.jpg?w=320 320w, /photo.jpg?w=640 640w')
    expect(image.getAttribute('sizes')).toBe('(min-width: 768px) 640px, 100vw')
  })

  it('lets an explicit srcset win over the generated one', () => {
    const { getByAltText } = render(
      <Image
        alt="Launch"
        sizes="100vw"
        src="/photo.jpg"
        srcSet="/small.jpg 320w, /large.jpg 960w"
        widths={[320, 640]}
      />,
    )

    expect(getByAltText('Launch').getAttribute('srcset')).toBe('/small.jpg 320w, /large.jpg 960w')
  })

  it('renders a picture when art-direction sources are given', () => {
    const { container, getByAltText } = render(
      <Image
        alt="Launch"
        sizes="100vw"
        sources={[
          { media: '(min-width: 768px)', srcSet: '/wide.jpg 960w' },
          { srcSet: '/narrow.jpg 480w', type: 'image/jpeg' },
        ]}
        src="/photo.jpg"
      />,
    )
    const sources = [
      ...container.querySelectorAll('picture source'),
    ]

    expect(sources).toHaveLength(2)
    expect(sources[0].getAttribute('media')).toBe('(min-width: 768px)')
    expect(sources[0].getAttribute('srcset')).toBe('/wide.jpg 960w')
    expect(sources[1].getAttribute('type')).toBe('image/jpeg')
    expect(getByAltText('Launch')).not.toBeNull()
  })

  it('maps the focal point and object fit onto the image', () => {
    const { getByAltText } = render(
      <Image alt="Launch" focalPoint={{ x: 30, y: 70 }} src="/photo.jpg" />,
    )
    const image = getByAltText('Launch') as HTMLImageElement

    expect(image.style.objectPosition).toBe('30% 70%')
    expect(image.style.objectFit).toBe('cover')
  })

  it('lets the caller override object fit and style', () => {
    const { getByAltText } = render(
      <Image
        alt="Launch"
        objectFit="contain"
        src="/photo.jpg"
        style={{ objectPosition: '10% 20%' }}
      />,
    )
    const image = getByAltText('Launch') as HTMLImageElement

    expect(image.style.objectFit).toBe('contain')
    expect(image.style.objectPosition).toBe('10% 20%')
  })

  it('paints a color placeholder behind the image', () => {
    const { container } = render(
      <Image alt="Launch" placeholder="#eeeeee" src="/photo.jpg" />,
    )

    expect(imageWrapper(container).style.backgroundColor).toBeTruthy()
  })

  it('paints an image placeholder behind the image', () => {
    const { container } = render(
      <Image alt="Launch" placeholder="/lqip.jpg" src="/photo.jpg" />,
    )

    expect(imageWrapper(container).style.backgroundImage).toBe('url("/lqip.jpg")')
  })

  it('fades in once the image has loaded and forwards onLoad', () => {
    const onLoad = vi.fn()
    const { container, getByAltText } = render(
      <Image alt="Launch" onLoad={onLoad} src="/photo.jpg" />,
    )
    const image = getByAltText('Launch') as HTMLImageElement

    expect(imageWrapper(container).dataset.state).toBe('loading')
    expect(image.className).toContain('opacity-0')

    fireEvent.load(image)

    expect(onLoad).toHaveBeenCalledOnce()
    expect(imageWrapper(container).dataset.state).toBe('loaded')
    expect(image.className).toContain('opacity-100')
    expect(image.className).toContain('motion-reduce:transition-none')
  })

  it('marks a cached image as loaded on mount without an onLoad event', async () => {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true)
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(960)

    const { container } = render(<Image alt="Cached" src="/photo.jpg" />)

    await waitFor(() => {
      expect(imageWrapper(container).dataset.state).toBe('loaded')
    })
  })

  it('leaves a complete image without dimensions in the loading state on mount', async () => {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true)
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(0)

    const { container } = render(<Image alt="Broken" src="/missing.jpg" />)

    await waitFor(() => {
      expect(imageWrapper(container).dataset.state).toBe('loading')
    })
  })

  it('replaces a failed image with the fallback', () => {
    const onError = vi.fn()
    const { container, getByText, queryByAltText } = render(
      <Image
        alt="Broken"
        fallback={<span>No picture</span>}
        onError={onError}
        src="/missing.jpg"
      />,
    )

    fireEvent.error(container.querySelector('img')!)

    expect(onError).toHaveBeenCalledOnce()
    expect(imageWrapper(container).dataset.state).toBe('error')
    expect(getByText('No picture')).toBeTruthy()
    expect(queryByAltText('Broken')).toBeNull()
  })

  it('draws a neutral surface when a failed image has no fallback', () => {
    const { container, queryByAltText } = render(
      <Image alt="Broken" src="/missing.jpg" />,
    )

    fireEvent.error(container.querySelector('img')!)

    expect(queryByAltText('Broken')).toBeNull()
    expect(container.querySelector('[data-slot="image"]')?.getAttribute('data-state')).toBe('error')
  })

  it('merges the container and image class names', () => {
    const { container, getByAltText } = render(
      <Image
        alt="Launch"
        className="rounded-lg"
        containerClassName="my-frame"
        src="/photo.jpg"
      />,
    )

    expect(imageWrapper(container).className).toContain('my-frame')
    expect(getByAltText('Launch').className).toContain('rounded-lg')
  })
})
