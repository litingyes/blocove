import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ImageShowcase } from '@/registry/blocove/blocks/image-showcase'

const images = [
  {
    alt: 'Rollout',
    caption: 'The rocket leaves the assembly building.',
    src: '/rollout.jpg',
  },
  {
    alt: 'Crew',
    src: '/crew.jpg',
  },
  {
    alt: 'Launch',
    src: '/launch.jpg',
  },
]

describe('imageShowcase', () => {
  it('renders the header, the lead image, the credit, the facts and the actions', () => {
    const { container, getByAltText, getByRole, getByText } = render(
      <ImageShowcase
        actions={<button type="button">Share</button>}
        credit="NASA"
        description="Four frames from the mission."
        eyebrow="Photo essay"
        href="https://images.nasa.gov/details/artemis-ii"
        images={images}
        meta={['March 2026', 'Four photographs']}
        title="Around the Moon"
      />,
    )
    const section = container.querySelector('[data-slot="image-showcase"]') as HTMLElement

    expect(section).not.toBeNull()
    expect(getByText('Photo essay')).toBeTruthy()
    expect(getByText('Around the Moon').tagName.toLowerCase()).toBe('h3')
    expect(getByText('Four frames from the mission.')).toBeTruthy()
    expect(getByAltText('Rollout')).not.toBeNull()
    expect(getByText('NASA')).toBeTruthy()
    expect(getByText('March 2026')).toBeTruthy()
    expect(getByText('Share')).toBeTruthy()

    const source = getByRole('link', { name: /View original/ })

    expect(source.getAttribute('href')).toBe('https://images.nasa.gov/details/artemis-ii')
    expect(source.getAttribute('target')).toBe('_blank')
  })

  it('renders a gallery for the images after the first', () => {
    const { container, getByRole } = render(
      <ImageShowcase images={images} title="Around the Moon" />,
    )
    const gallery = container.querySelector('[data-slot="image-gallery"]')
    const thumbnails = [
      ...container.querySelectorAll('[role="group"] button'),
    ]

    expect(gallery).not.toBeNull()
    expect(thumbnails).toHaveLength(2)
    expect(getByRole('group', { name: 'More from Around the Moon' })).toBeTruthy()
  })

  it('does not render a gallery for a single image', () => {
    const { container } = render(
      <ImageShowcase images={[images[0]]} title="Around the Moon" />,
    )

    expect(container.querySelector('[data-slot="image-gallery"]')).toBeNull()
  })

  it('renders nothing when there are no images', () => {
    const { container } = render(
      <ImageShowcase images={[]} title="Around the Moon" />,
    )

    expect(container.querySelector('[data-slot="image-showcase"]')).toBeNull()
  })

  it('leaves out the footer when there is nothing to put in it', () => {
    const { container } = render(
      <ImageShowcase images={[images[0]]} title="Around the Moon" />,
    )

    expect(container.querySelector('[data-slot="separator"]')).toBeNull()
  })

  it('reserves the lead box and shows its caption outside the zoom dialog', () => {
    const { container, getByText } = render(
      <ImageShowcase images={images} title="Around the Moon" />,
    )
    const lead = container.querySelector('[data-slot="image-zoom"] [data-slot="image"]') as HTMLElement

    expect(lead.style.aspectRatio).toBe('16 / 9')
    expect(getByText('The rocket leaves the assembly building.')).toBeTruthy()
  })

  it('forwards a custom aspect ratio to the lead image and the gallery', () => {
    const { container } = render(
      <ImageShowcase aspectRatio="4 / 3" images={images} title="Around the Moon" />,
    )
    const ratios = [
      ...container.querySelectorAll('[data-slot="image-zoom"] [data-slot="image"]'),
    ].map(node => (node as HTMLElement).style.aspectRatio)

    expect(ratios).toHaveLength(2)
    expect(ratios.every(ratio => ratio === '4 / 3')).toBe(true)
  })
})
