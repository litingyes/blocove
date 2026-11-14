import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ImageHero } from '@/registry/blocove/blocks/image-hero'

describe('imageHero', () => {
  it('renders the image, the eyebrow, the title, the copy and the actions', () => {
    const { container, getByAltText, getByText } = render(
      <ImageHero
        actions={<button type="button">Read the mission</button>}
        alt="Artemis II on the launch pad"
        description="A launch in four frames."
        eyebrow="Mission photographs"
        src="/hero.jpg"
        title="Around the Moon"
      />,
    )
    const section = container.querySelector('[data-slot="image-hero"]') as HTMLElement
    const image = getByAltText('Artemis II on the launch pad')

    expect(section).not.toBeNull()
    expect(image.getAttribute('src')).toBe('/hero.jpg')
    expect(image.getAttribute('sizes')).toBe('100vw')
    expect(image.getAttribute('loading')).toBe('eager')
    expect(getByText('Mission photographs')).toBeTruthy()
    expect(getByText('Around the Moon').tagName.toLowerCase()).toBe('h2')
    expect(getByText('A launch in four frames.')).toBeTruthy()
    expect(getByText('Read the mission')).toBeTruthy()
  })

  it('reserves the stage with the default aspect ratio', () => {
    const { container } = render(
      <ImageHero alt="Hero" src="/hero.jpg" title="Headline" />,
    )
    const section = container.querySelector('[data-slot="image-hero"]') as HTMLElement

    expect(section.style.aspectRatio).toBe('16 / 9')
  })

  it('accepts a custom aspect ratio and leaves out the optional parts', () => {
    const { container, queryByRole } = render(
      <ImageHero alt="Hero" aspectRatio="21 / 9" src="/hero.jpg" title="Headline" />,
    )

    expect(container.querySelector('[data-slot="image-hero"]')?.getAttribute('style')).toContain('21 / 9')
    expect(queryByRole('button')).toBeNull()
    expect(container.querySelectorAll('p')).toHaveLength(0)
  })

  it('styles the section through className', () => {
    const { container } = render(
      <ImageHero alt="Hero" className="hero-frame" src="/hero.jpg" title="Headline" />,
    )

    expect(container.querySelector('[data-slot="image-hero"]')?.className).toContain('hero-frame')
  })
})
