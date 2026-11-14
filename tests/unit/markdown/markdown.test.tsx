import type { MarkdownCodeProps, MarkdownMathProps } from '@/lib/blocove/markdown-parse'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Markdown } from '@/components/blocove/markdown/markdown'

function typesetSurface(container: HTMLElement): HTMLElement {
  const surface = container.querySelector<HTMLElement>('.typeset')

  expect(surface, 'the rendered nodes live in a typeset element').not.toBeNull()

  return surface!
}

describe('semantics', () => {
  it('renders every block as the element typeset styles', () => {
    const { container } = render(
      <Markdown
        source={[
          '# Title',
          '## Section',
          'Body with **strong**, *emphasis*, ~~deleted~~ and `code`.',
          '',
          '> quoted',
          '',
          '- one',
          '- two',
          '',
          '1. first',
          '2. second',
          '',
          '---',
          '',
          '| a | b |',
          '| - | - |',
          '| 1 | 2 |',
          '',
          '```ts',
          'const a = 1',
          '```',
          '',
          '![alt](/image.png)',
          '',
          '[link](https://x.dev)',
        ].join('\n')}
      />,
    )

    expect(container.querySelector('h1')?.textContent).toBe('Title')
    expect(container.querySelector('h2')?.textContent).toBe('Section')
    expect(container.querySelector('strong')?.textContent).toBe('strong')
    expect(container.querySelector('em')?.textContent).toBe('emphasis')
    expect(container.querySelector('del')?.textContent).toBe('deleted')
    expect(container.querySelector('p > code')?.textContent).toBe('code')
    expect(container.querySelector('blockquote')?.textContent).toBe('quoted')
    expect(container.querySelectorAll('ul > li')).toHaveLength(2)
    expect(container.querySelectorAll('ol > li')).toHaveLength(2)
    expect(container.querySelector('hr')).not.toBeNull()
    expect(container.querySelectorAll('table thead th')).toHaveLength(2)
    expect(container.querySelectorAll('table tbody td')).toHaveLength(2)
    expect(container.querySelector('pre > code')?.className).toBe('language-ts')
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('alt')
    expect(container.querySelector('a')?.getAttribute('href')).toBe('https://x.dev')
  })

  it('keeps the typeset element free of a data-slot', () => {
    const { container } = render(<Markdown source="# Title" />)
    const surface = typesetSurface(container)

    expect(surface.hasAttribute('data-slot')).toBe(false)
    expect(container.firstElementChild?.getAttribute('data-slot')).toBe('markdown')
  })

  it('drops the typeset classes when asked', () => {
    const { container } = render(<Markdown source="# Title" typeset={false} />)

    expect(container.querySelector('.typeset')).toBeNull()
  })

  it('wraps list items only in a loose list', () => {
    const tight = render(<Markdown source={'- a\n- b\n'} />)

    expect(tight.container.querySelectorAll('li > p')).toHaveLength(0)

    const loose = render(<Markdown source={'- a\n\n- b\n'} />)

    expect(loose.container.querySelectorAll('li > p')).toHaveLength(2)
  })

  it('renders task items as checkboxes', () => {
    const { container } = render(<Markdown source={'- [x] done\n- [ ] todo\n'} />)
    const checkboxes = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')

    expect(container.querySelector('ul')?.className).toContain('contains-task-list')
    expect(container.querySelectorAll('li.task-list-item')).toHaveLength(2)
    expect([...checkboxes].map(box => box.checked)).toEqual([true, false])
  })

  it('keeps the start number of an ordered list', () => {
    const { container } = render(<Markdown source={'3. third\n4. fourth\n'} />)

    expect(container.querySelector('ol')?.getAttribute('start')).toBe('3')
  })
})

describe('safety', () => {
  it('renders raw HTML as text', () => {
    const { container } = render(<Markdown source={'<script>alert(1)</script>\n'} />)

    expect(container.querySelector('script')).toBeNull()
    expect(typesetSurface(container).textContent).toContain('<script>alert(1)</script>')
  })

  it('renders an unsafe link as text', () => {
    const { container } = render(<Markdown source={'[x](javascript:alert(1))\n'} />)

    expect(container.querySelector('a')).toBeNull()
    expect(typesetSurface(container).textContent).toContain('[x](javascript:alert(1))')
  })
})

describe('streaming', () => {
  it('marks the surface while it is receiving tokens', () => {
    const { container, rerender } = render(<Markdown source="Hel" streaming />)
    const surface = typesetSurface(container)

    expect(surface.getAttribute('aria-busy')).toBe('true')
    expect(surface.getAttribute('data-streaming')).toBe('true')

    rerender(<Markdown source="Hello" />)

    expect(surface.getAttribute('aria-busy')).toBeNull()
    expect(surface.getAttribute('data-streaming')).toBeNull()
  })

  it('updates the open block and keeps finished elements mounted', () => {
    const source = '# Title\n\n```ts\nconst a = 1\n```\n\nTail'
    const { container, rerender } = render(<Markdown source={source} />)
    const pre = container.querySelector('pre')
    const heading = container.querySelector('h1')

    rerender(<Markdown source={`${source} and more`} />)

    expect(container.querySelector('pre')).toBe(pre)
    expect(container.querySelector('h1')).toBe(heading)
    expect(typesetSurface(container).textContent).toContain('Tail and more')
  })

  it('marks only the block still being written', () => {
    const { container, rerender } = render(<Markdown source={'- one\n- two'} streaming />)

    expect(container.querySelector('li:last-child')?.getAttribute('data-streaming')).toBeNull()

    rerender(<Markdown source={'- one\n- two\n\nTail'} streaming />)

    expect(container.querySelector('p')?.getAttribute('data-streaming')).toBe('true')
  })
})

describe('capabilities', () => {
  it('uses a registered code renderer', () => {
    const code = vi.fn(({ language, code }: MarkdownCodeProps) => (
      <pre data-language={language}>{code}</pre>
    ))

    const { container } = render(
      <Markdown source={'```ts\nconst a = 1\n```\n'} components={{ code }} />,
    )

    expect(container.querySelector('pre')?.getAttribute('data-language')).toBe('ts')
    expect(code).toHaveBeenCalledWith(
      expect.objectContaining({ language: 'ts', code: 'const a = 1' }),
      undefined,
    )
  })

  it('falls back to a plain fence without a renderer', () => {
    const { container } = render(<Markdown source={'```ts\nconst a = 1\n```\n'} />)

    expect(container.querySelector('pre > code')?.textContent).toBe('const a = 1')
    expect(container.querySelector('pre > code')?.className).toBe('language-ts')
  })

  it('uses a registered math renderer', () => {
    const math = ({ value, display }: MarkdownMathProps) => (
      <span data-kind={display ? 'block' : 'inline'}>{value}</span>
    )

    const { container } = render(
      <Markdown
        source={'Inline $x^2$ math.\n\n$$\na + b\n$$\n'}
        components={{ math }}
      />,
    )

    expect(container.querySelector('[data-kind="inline"]')?.textContent).toBe('x^2')
    expect(container.querySelector('[data-kind="block"]')?.textContent?.trim()).toBe('a + b')
  })

  it('keeps math literal without a renderer', () => {
    const { container } = render(<Markdown source={'Inline $x^2$ math.\n'} />)

    expect(typesetSurface(container).textContent).toBe('Inline $x^2$ math.')
  })
})

describe('footnotes', () => {
  it('numbers references and renders the definitions at the end', () => {
    const { container } = render(<Markdown source={'Text[^a] and[^b]\n\n[^a]: first\n[^b]: second\n'} />)
    const refs = container.querySelectorAll('[data-footnotes] + *, sup a')
    const definitions = container.querySelectorAll('[data-footnotes] li')

    expect(container.querySelector('section[data-footnotes]')).not.toBeNull()
    expect(definitions).toHaveLength(2)
    expect([
      ...container.querySelectorAll('sup a'),
    ].map(link => link.textContent)).toEqual(['1', '2'])
    expect(refs.length).toBeGreaterThan(0)
    expect(definitions[0].getAttribute('id')).toBe('fn-a')
  })

  it('keeps a reference without a definition literal', () => {
    const { container } = render(<Markdown source={'Text[^missing]\n'} />)

    expect(container.querySelector('sup')).toBeNull()
    expect(typesetSurface(container).textContent).toBe('Text[^missing]')
  })
})
