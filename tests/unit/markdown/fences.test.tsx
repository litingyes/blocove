import type { MarkdownCodeProps } from '@/lib/blocove/markdown-parse'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Markdown } from '@/components/blocove/markdown/markdown'

function probe(name: string) {
  return function Probe({ language, code, streaming, complete }: MarkdownCodeProps) {
    return (
      <pre
        data-testid={name}
        data-language={language}
        data-streaming={String(streaming ?? false)}
        data-complete={String(complete ?? false)}
      >
        {code}
      </pre>
    )
  }
}

const FenceProbe = probe('fence')
const CodeProbe = probe('code')

const openFence = '```mermaid\nflowchart LR\n  A --> B'
const closedFence = '```mermaid\nflowchart LR\n  A --> B\n```\n'
const closedWithoutNewline = '```mermaid\nflowchart LR\n  A --> B\n```'
const components = {
  code: CodeProbe,
  fences: { mermaid: FenceProbe },
}

describe('fence dispatch', () => {
  it('uses the language renderer and marks an open fence incomplete', () => {
    const { getByTestId } = render(
      <Markdown source={openFence} streaming components={components} />,
    )
    const fence = getByTestId('fence')

    expect(fence.getAttribute('data-language')).toBe('mermaid')
    expect(fence.getAttribute('data-complete')).toBe('false')
    expect(fence.textContent).toContain('flowchart LR')
  })

  it('renders as soon as the closing fence arrives', () => {
    const { getByTestId } = render(
      <Markdown source={closedFence} streaming components={components} />,
    )

    expect(getByTestId('fence').getAttribute('data-complete')).toBe('true')
  })

  it('treats a final source without a trailing newline as complete', () => {
    const { getByTestId, rerender } = render(
      <Markdown source={closedWithoutNewline} streaming components={components} />,
    )

    expect(getByTestId('fence').getAttribute('data-complete')).toBe('false')

    rerender(<Markdown source={closedWithoutNewline} components={components} />)

    expect(getByTestId('fence').getAttribute('data-complete')).toBe('true')
  })

  it('matches the fence language case-insensitively', () => {
    const { getByTestId } = render(
      <Markdown source={closedFence.replace('mermaid', 'Mermaid')} components={components} />,
    )

    expect(getByTestId('fence').getAttribute('data-language')).toBe('Mermaid')
  })

  it('falls back to the code renderer for other languages', () => {
    const { getByTestId } = render(
      <Markdown source={'```ts\nconst a = 1\n```\n'} components={components} />,
    )

    expect(getByTestId('code').getAttribute('data-language')).toBe('ts')
  })

  it('keeps the plain pre when no renderer claims the fence', () => {
    const { container } = render(<Markdown source={'```ts\nconst a = 1\n```\n'} />)

    expect(container.querySelector('pre > code')?.className).toBe('language-ts')
  })
})
