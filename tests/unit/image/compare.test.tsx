import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ImageCompare } from '@/components/blocove/image/compare'

function range(container: HTMLElement) {
  return container.querySelector('input[type="range"]') as HTMLInputElement
}

function beforeLayer(container: HTMLElement) {
  return container.querySelector('[data-slot="image-compare-before"]') as HTMLElement
}

describe('imageCompare', () => {
  it('renders both images and the labels', () => {
    const { container, getByAltText, getByText } = render(
      <ImageCompare
        after={{ alt: 'Restored', src: '/after.jpg' }}
        before={{ alt: 'Original', src: '/before.jpg' }}
      />,
    )

    expect(container.querySelector('[data-slot="image-compare"]')).not.toBeNull()
    expect(getByAltText('Original')).not.toBeNull()
    expect(getByAltText('Restored')).not.toBeNull()
    expect(getByText('Before')).toBeTruthy()
    expect(getByText('After')).toBeTruthy()
  })

  it('starts at the default position and clips the before image', () => {
    const { container } = render(
      <ImageCompare
        after={{ alt: 'Restored', src: '/after.jpg' }}
        before={{ alt: 'Original', src: '/before.jpg' }}
      />,
    )

    expect(range(container).value).toBe('50')
    expect(beforeLayer(container).style.clipPath).toBe('inset(0 50% 0 0)')
  })

  it('moves the split when the range changes', () => {
    const { container } = render(
      <ImageCompare
        after={{ alt: 'Restored', src: '/after.jpg' }}
        before={{ alt: 'Original', src: '/before.jpg' }}
      />,
    )

    fireEvent.change(range(container), {
      target: { value: '25' },
    })

    expect(range(container).value).toBe('25')
    expect(beforeLayer(container).style.clipPath).toBe('inset(0 75% 0 0)')
    expect(beforeLayer(container).style.getPropertyValue('clip-path')).toBe('inset(0 75% 0 0)')
  })

  it('clamps the default position to the 0–100 range', () => {
    const { container } = render(
      <ImageCompare
        after={{ alt: 'Restored', src: '/after.jpg' }}
        before={{ alt: 'Original', src: '/before.jpg' }}
        defaultPosition={140}
      />,
    )

    expect(range(container).value).toBe('100')
    expect(beforeLayer(container).style.clipPath).toBe('inset(0 0% 0 0)')
  })

  it('labels the range for assistive technology', () => {
    const { container } = render(
      <ImageCompare
        after={{ alt: 'Restored', src: '/after.jpg' }}
        before={{ alt: 'Original', src: '/before.jpg' }}
        rangeLabel="Edit position"
      />,
    )
    const input = range(container)

    expect(input.getAttribute('aria-label')).toBe('Edit position')
    expect(input.getAttribute('aria-valuetext')).toBe('50%')
  })

  it('uses the supplied resize transform for both images', () => {
    const { container } = render(
      <ImageCompare
        after={{ alt: 'Restored', src: '/after.jpg' }}
        before={{ alt: 'Original', src: '/before.jpg' }}
        transform={(src, width) => `${src}?w=${width}`}
        widths={[320, 640]}
      />,
    )
    const srcsets = [
      ...container.querySelectorAll('img'),
    ].map(image => image.getAttribute('srcset'))

    expect(srcsets).toEqual([
      '/before.jpg?w=320 320w, /before.jpg?w=640 640w',
      '/after.jpg?w=320 320w, /after.jpg?w=640 640w',
    ])
  })
})
