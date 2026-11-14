import { render, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MarkdownCodeBlock } from '@/components/blocove/markdown/code-block'

async function tokens(container: HTMLElement) {
  await waitFor(() => {
    expect(container.querySelector('code > span > span')).not.toBeNull()
  })
}

describe('markdownCodeBlock', () => {
  it('highlights a fence with the requested language', async () => {
    const { container } = render(
      <MarkdownCodeBlock language="ts" code={'const a = 1\nconst b = 2'} />,
    )

    await tokens(container)

    const lines = container.querySelectorAll('pre > code > span')

    expect(lines).toHaveLength(2)
    expect(container.querySelector('pre')?.getAttribute('data-language')).toBe('ts')
    expect(container.textContent).toContain('const a = 1')
  })

  it('falls back to plain text for a language it does not ship', async () => {
    const { container } = render(
      <MarkdownCodeBlock language="klingon" code="qapla!" />,
    )

    await waitFor(() => {
      expect(container.querySelector('pre > code > span')).not.toBeNull()
    })

    expect(container.querySelector('code > span > span')).toBeNull()
    expect(container.textContent).toBe('qapla!')
  })

  it('keeps a blank line in the code', async () => {
    const { container } = render(
      <MarkdownCodeBlock language="ts" code={'a\n\nb'} />,
    )

    await tokens(container)

    expect(container.querySelectorAll('pre > code > span')).toHaveLength(3)
  })

  it('keeps the lines mounted while the fence grows', async () => {
    const { container, rerender } = render(
      <MarkdownCodeBlock language="ts" code="const a = 1" />,
    )

    await tokens(container)

    rerender(<MarkdownCodeBlock language="ts" code={'const a = 1\nconst b = 2'} />)

    await tokens(container)

    const first = container.querySelectorAll('pre > code > span')[0]

    rerender(<MarkdownCodeBlock language="ts" code={'const a = 1\nconst b = 22'} />)

    await tokens(container)

    // The completed first line is reused, so its element is not rebuilt as the
    // fence streams.
    expect(container.querySelectorAll('pre > code > span')[0]).toBe(first)
  })

  it('marks the fence while it is streaming', async () => {
    const { container } = render(
      <MarkdownCodeBlock language="ts" code="const a" streaming />,
    )

    await tokens(container)

    expect(container.querySelector('pre')?.getAttribute('data-streaming')).toBe('true')
  })
})
