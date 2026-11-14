import { render, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MarkdownCodeBlock } from '@/components/blocove/markdown/code-block'

async function tokens(container: HTMLElement) {
  await waitFor(() => {
    expect(
      container.querySelector(
        '[data-slot="code-block-content"] [data-slot="code-block-line"] [data-slot="code-block-line-content"] span',
      ),
    ).not.toBeNull()
  })
}

function lineNodes(container: HTMLElement) {
  return container.querySelectorAll(
    '[data-slot="code-block-content"] [data-slot="code-block-line"]',
  )
}

function card(container: HTMLElement) {
  return container.querySelector('[data-slot="code-block"]')
}

function content(container: HTMLElement) {
  return container.querySelector('[data-slot="code-block-content"]')
}

describe('markdownCodeBlock', () => {
  it('frames the fence with the shadcn code block', async () => {
    const { container } = render(<MarkdownCodeBlock language="ts" code="const a = 1" />)

    await tokens(container)

    expect(card(container)?.getAttribute('data-language')).toBe('ts')
    expect(container.querySelector('[data-slot="code-block-title"]')?.textContent).toBe('ts')
    expect(
      container.querySelector('[data-slot="code-block-copy-button"]')?.getAttribute('aria-label'),
    ).toContain('Copy')
  })

  it('highlights a fence with the requested language', async () => {
    const { container } = render(
      <MarkdownCodeBlock language="ts" code={'const a = 1\nconst b = 2'} />,
    )

    await tokens(container)

    expect(lineNodes(container)).toHaveLength(2)
    expect(card(container)?.getAttribute('data-language')).toBe('ts')
    expect(content(container)?.textContent).toContain('const a = 1')
  })

  it('falls back to plain text for a language it does not ship', async () => {
    const { container } = render(
      <MarkdownCodeBlock language="klingon" code="qapla!" />,
    )

    await waitFor(() => {
      expect(lineNodes(container)).toHaveLength(1)
    })

    expect(container.querySelector('[data-slot="code-block-line-content"] span')).toBeNull()
    expect(content(container)?.textContent).toBe('qapla!')
  })

  it('keeps a blank line in the code', async () => {
    const { container } = render(
      <MarkdownCodeBlock language="ts" code={'a\n\nb'} />,
    )

    await tokens(container)

    expect(lineNodes(container)).toHaveLength(3)
  })

  it('keeps the lines mounted while the fence grows', async () => {
    const { container, rerender } = render(
      <MarkdownCodeBlock language="ts" code="const a = 1" />,
    )

    await tokens(container)

    rerender(<MarkdownCodeBlock language="ts" code={'const a = 1\nconst b = 2'} />)

    await tokens(container)

    const first = lineNodes(container)[0]

    rerender(<MarkdownCodeBlock language="ts" code={'const a = 1\nconst b = 22'} />)

    await tokens(container)

    // The completed first line is reused, so its element is not rebuilt as the
    // fence streams.
    expect(lineNodes(container)[0]).toBe(first)
  })

  it('marks the fence while it is streaming', async () => {
    const { container } = render(
      <MarkdownCodeBlock language="ts" code="const a" streaming />,
    )

    await tokens(container)

    expect(card(container)?.getAttribute('data-streaming')).toBe('true')
  })
})
