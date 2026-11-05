import { fireEvent, screen } from '@testing-library/react'

/**
 * Base UI selects select on the pointer sequence, not on a bare click, so tests
 * replay the same events a real pointer emits before choosing an option.
 */
export function selectBaseUiOption(name: string) {
  const option = screen.getByRole('option', { name })

  fireEvent.pointerDown(option, { pointerType: 'mouse', button: 0 })
  fireEvent.pointerUp(option, { pointerType: 'mouse', button: 0 })
  fireEvent.mouseDown(option)
  fireEvent.mouseUp(option)
  fireEvent.click(option)
}
