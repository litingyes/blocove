import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ImageFigure } from '@/components/blocove/image/figure'

describe('imageFigure', () => {
  it('wraps the image in a figure with a caption and a credit', () => {
    const { getByAltText, getByText, container } = render(
      <ImageFigure
        alt="Artemis II rollout"
        caption="The rocket leaves the assembly building."
        credit="NASA"
        height={540}
        src="/photo.jpg"
        width={960}
      />,
    )

    expect(container.querySelector('figure')?.getAttribute('data-slot')).toBe('image-figure')
    expect(getByAltText('Artemis II rollout')).not.toBeNull()
    expect(getByText('The rocket leaves the assembly building.')).toBeTruthy()
    expect(getByText('NASA')).toBeTruthy()
    expect(container.querySelector('figure')?.querySelector('[data-slot="image"]')).not.toBeNull()
  })

  it('renders only the image when there is no caption or credit', () => {
    const { container } = render(<ImageFigure alt="Bare" src="/photo.jpg" />)

    expect(container.querySelector('figcaption')).toBeNull()
    expect(container.querySelector('figure')).not.toBeNull()
  })

  it('styles the figure and the image separately', () => {
    const { container, getByAltText } = render(
      <ImageFigure
        alt="Styled"
        className="figure-frame"
        imageClassName="figure-image"
        src="/photo.jpg"
      />,
    )

    expect(container.querySelector('figure')?.className).toContain('figure-frame')
    expect(getByAltText('Styled').className).toContain('figure-image')
  })

  it('supports rich caption content', () => {
    const { getByText } = render(
      <ImageFigure
        alt="Rich"
        caption={(
          <span>
            Launch
            {' '}
            <strong>window</strong>
          </span>
        )}
        src="/photo.jpg"
      />,
    )

    expect(getByText('window').tagName.toLowerCase()).toBe('strong')
  })
})
