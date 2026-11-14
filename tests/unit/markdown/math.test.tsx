import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MarkdownMath } from '@/components/blocove/markdown/math'

describe('markdownMath', () => {
  it('renders an inline formula with KaTeX', () => {
    const { container } = render(<MarkdownMath value="x^2" display={false} />)

    expect(container.querySelector('.katex')).not.toBeNull()
    expect(container.querySelector('.katex-display')).toBeNull()
  })

  it('renders a display formula as a block', () => {
    const { container } = render(<MarkdownMath value="\frac{a}{b}" display />)

    expect(container.querySelector('.katex-display')).not.toBeNull()
    expect(container.querySelector('.typeset-scroll')).not.toBeNull()
  })

  it('renders an incomplete formula instead of throwing', () => {
    const { container } = render(<MarkdownMath value="\frac{" display={false} />)

    expect(container.textContent?.trim()).not.toBe('')
  })

  it('marks the formula while it is streaming', () => {
    const { container } = render(<MarkdownMath value="x" display={false} streaming />)

    expect(container.querySelector('[data-streaming="true"]')).not.toBeNull()
  })
})
