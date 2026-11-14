import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ImageGallery } from '@/components/blocove/image/gallery'

const images = [
  {
    alt: 'Rollout',
    caption: 'The rocket leaves the assembly building.',
    src: '/rollout.jpg',
    thumbnailSrc: '/rollout-thumb.jpg',
  },
  {
    alt: 'Crew',
    caption: 'The four astronauts.',
    src: '/crew.jpg',
  },
  {
    alt: 'Launch',
    src: '/launch.jpg',
  },
]

function currentButton(container: HTMLElement) {
  return container.querySelector('[aria-current="true"]') as HTMLElement
}

function thumbnailButtons(container: HTMLElement) {
  return [
    ...container.querySelectorAll<HTMLButtonElement>('[role="group"] button'),
  ]
}

describe('imageGallery', () => {
  it('renders the selected image and one thumbnail per image', () => {
    const { container } = render(<ImageGallery images={images} />)
    const buttons = thumbnailButtons(container)
    const preview = container.querySelector('[data-slot="image-zoom"]') as HTMLElement

    expect(container.querySelector('[data-slot="image-gallery"]')).not.toBeNull()
    expect(preview.querySelector('img')?.getAttribute('src')).toBe('/rollout.jpg')
    expect(buttons).toHaveLength(3)
    expect(currentButton(container)).toBe(buttons[0])
    expect(buttons[0].getAttribute('aria-label')).toBe('Rollout')
    expect(buttons[0].querySelector('img')?.getAttribute('src')).toBe('/rollout-thumb.jpg')
    expect(container.textContent).toContain('The rocket leaves the assembly building.')
  })

  it('selects another image and its caption on click', () => {
    const { container } = render(<ImageGallery images={images} />)

    fireEvent.click(thumbnailButtons(container)[1])

    expect(currentButton(container)).toBe(thumbnailButtons(container)[1])
    expect(
      (container.querySelector('[data-slot="image-zoom"] img') as HTMLImageElement).getAttribute('src'),
    ).toBe('/crew.jpg')
    expect(container.textContent).toContain('The four astronauts.')
  })

  it('moves the selection with the arrow keys and focuses the thumbnail', () => {
    const { container } = render(<ImageGallery images={images} />)
    const group = container.querySelector('[role="group"]') as HTMLElement
    const buttons = thumbnailButtons(container)

    fireEvent.keyDown(group, { key: 'ArrowRight' })

    expect(currentButton(container)).toBe(buttons[1])
    expect(document.activeElement).toBe(buttons[1])

    fireEvent.keyDown(group, { key: 'ArrowLeft' })
    expect(currentButton(container)).toBe(buttons[0])
  })

  it('wraps around the ends and supports Home and End', () => {
    const { container } = render(<ImageGallery images={images} />)
    const group = container.querySelector('[role="group"]') as HTMLElement
    const buttons = thumbnailButtons(container)

    fireEvent.keyDown(group, { key: 'ArrowLeft' })
    expect(currentButton(container)).toBe(buttons[2])

    fireEvent.keyDown(group, { key: 'Home' })
    expect(currentButton(container)).toBe(buttons[0])

    fireEvent.keyDown(group, { key: 'End' })
    expect(currentButton(container)).toBe(buttons[2])
  })

  it('honours the default index', () => {
    const { container } = render(<ImageGallery defaultIndex={2} images={images} />)

    expect(currentButton(container)).toBe(thumbnailButtons(container)[2])
  })

  it('clamps an out-of-range default index', () => {
    const { container } = render(<ImageGallery defaultIndex={9} images={images} />)

    expect(currentButton(container)).toBe(thumbnailButtons(container)[2])
  })

  it('renders nothing for an empty list', () => {
    const { container } = render(<ImageGallery images={[]} />)

    expect(container.querySelector('[data-slot="image-gallery"]')).toBeNull()
  })

  it('exposes the group label and the column count', () => {
    const { container } = render(
      <ImageGallery columns={2} images={images} label="Mission photographs" />,
    )
    const group = container.querySelector('[role="group"]') as HTMLElement

    expect(group.getAttribute('aria-label')).toBe('Mission photographs')
    expect(group.className).toContain('grid-cols-2')
  })

  it('keeps one tab stop and moves from the focused thumbnail', () => {
    const { container } = render(<ImageGallery images={images} />)
    const buttons = thumbnailButtons(container)

    expect(buttons.map(button => button.tabIndex)).toEqual([0, -1, -1])

    buttons[2].focus()
    fireEvent.keyDown(buttons[2], { key: 'ArrowRight' })

    expect(currentButton(container)).toBe(buttons[0])
    expect(document.activeElement).toBe(buttons[0])
  })

  it('moves between rows with ArrowDown and ArrowUp', () => {
    const many = [
      ...images,
      { alt: 'Fourth', src: '/four.jpg' },
      { alt: 'Fifth', src: '/five.jpg' },
      { alt: 'Sixth', src: '/six.jpg' },
    ]
    const { container } = render(<ImageGallery columns={3} images={many} />)
    const buttons = thumbnailButtons(container)

    buttons[0].focus()
    fireEvent.keyDown(buttons[0], { key: 'ArrowDown' })

    expect(currentButton(container)).toBe(buttons[3])

    fireEvent.keyDown(buttons[3], { key: 'ArrowUp' })

    expect(currentButton(container)).toBe(buttons[0])
  })
})
