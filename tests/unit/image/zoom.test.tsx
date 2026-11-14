import { fireEvent, render, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ImageZoom } from '@/components/blocove/image/zoom'

function dialogContent() {
  return document.querySelector('[data-slot="dialog-content"]') as HTMLElement | null
}

describe('imageZoom', () => {
  it('renders a zoom trigger with the thumbnail', () => {
    const { getByRole } = render(
      <ImageZoom
        alt="Artemis II rollout"
        src="/large.jpg"
        thumbnailSrc="/thumb.jpg"
      />,
    )
    const trigger = getByRole('button', { name: 'Zoom image: Artemis II rollout' })

    expect(trigger.getAttribute('data-slot')).toBe('image-zoom')
    expect(trigger.querySelector('img')?.getAttribute('src')).toBe('/thumb.jpg')
  })

  it('opens the large image and the caption when clicked', async () => {
    const { getByRole } = render(
      <ImageZoom
        alt="Artemis II rollout"
        caption="The rocket leaves the assembly building."
        src="/large.jpg"
        thumbnailSrc="/thumb.jpg"
      />,
    )

    fireEvent.click(getByRole('button', { name: 'Zoom image: Artemis II rollout' }))

    await waitFor(() => {
      expect(dialogContent()).not.toBeNull()
    })

    const dialog = dialogContent()!
    const image = dialog.querySelector('img')

    expect(image?.getAttribute('src')).toBe('/large.jpg')
    expect(image?.getAttribute('sizes')).toBe('100vw')
    expect(dialog.textContent).toContain('The rocket leaves the assembly building.')
    expect(dialog.textContent).toContain('Artemis II rollout')
  })

  it('closes from the dialog close button', async () => {
    const { getByRole } = render(
      <ImageZoom alt="Artemis II rollout" src="/large.jpg" />,
    )

    fireEvent.click(getByRole('button', { name: 'Zoom image: Artemis II rollout' }))
    await waitFor(() => expect(dialogContent()).not.toBeNull())

    fireEvent.click(dialogContent()!.querySelector('[data-slot="dialog-close"]') as HTMLElement)

    await waitFor(() => expect(dialogContent()).toBeNull())
  })

  it('accepts a custom label', () => {
    const { getByRole } = render(
      <ImageZoom alt="Ignored" src="/large.jpg" zoomLabel="Open the full picture" />,
    )

    expect(getByRole('button', { name: 'Open the full picture' })).toBeTruthy()
  })

  it('uses the main source as the thumbnail when none is given', () => {
    const { getByRole } = render(
      <ImageZoom alt="Artemis II rollout" src="/large.jpg" />,
    )

    expect(getByRole('button').querySelector('img')?.getAttribute('src')).toBe('/large.jpg')
  })

  it('makes the trigger responsive and priority', () => {
    const { getByRole } = render(
      <ImageZoom
        alt="Artemis II rollout"
        priority
        sizes="(min-width: 1024px) 640px, 100vw"
        src="/large.jpg"
        transform={(src, width) => `${src}?w=${width}`}
        widths={[320, 640]}
      />,
    )
    const image = getByRole('button').querySelector('img') as HTMLImageElement

    expect(image.getAttribute('srcset')).toBe('/large.jpg?w=320 320w, /large.jpg?w=640 640w')
    expect(image.getAttribute('sizes')).toBe('(min-width: 1024px) 640px, 100vw')
    expect(image.getAttribute('loading')).toBe('eager')
  })
})
