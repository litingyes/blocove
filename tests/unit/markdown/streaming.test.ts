import type { MarkdownCache } from '@/registry/blocove/lib/markdown-parse'
import { describe, expect, it } from 'vitest'
import { extendMarkdown, parseMarkdown } from '@/registry/blocove/lib/markdown-parse'

// A document with one of every supported block, long enough that prefixes cut it
// inside headings, paragraphs, lists, quotes, tables and fences.
const fixture = `# Streaming

A paragraph long enough to be cut in several places, with **bold** text and a [link](https://x.dev).

- one
- two
  - nested

> quoted
> lines

| a | b |
| - | - |
| 1 | 2 |

\`\`\`ts
const a = 1
\`\`\`

Closing paragraph.`

describe('prefixes', () => {
  it('parses every prefix and agrees with a fresh parse', () => {
    const problems: string[] = []
    let cache = extendMarkdown(undefined, '')

    for (let end = 0; end <= fixture.length; end++) {
      const source = fixture.slice(0, end)
      cache = extendMarkdown(cache, source)

      const fresh = parseMarkdown(source)

      try {
        expect(cache.blocks).toEqual(fresh.blocks)
      }
      catch {
        problems.push(JSON.stringify(source.slice(-24)))
      }
    }

    expect(problems).toEqual([])
  })

  it('reuses every terminated block by identity', () => {
    const cut = fixture.indexOf('Closing paragraph.')
    const before = parseMarkdown(fixture.slice(0, cut))
    const after = extendMarkdown(before, fixture)

    // Every block before the last one was terminated at the cut, so the growth
    // must not replace any of them.
    for (let index = 0; index < before.blocks.length - 1; index++) {
      expect(after.blocks[index], `block ${index} (${before.blocks[index].kind}) was rebuilt`).toBe(before.blocks[index])
    }
  })

  it('rebuilds only the open block', () => {
    const parent = fixture.indexOf(', with')
    const before = parseMarkdown(fixture.slice(0, parent))
    const after = extendMarkdown(before, fixture)

    expect(after.blocks[0]).toBe(before.blocks[0])
    expect(after.blocks[1]).not.toBe(before.blocks[1])
    expect(before.blocks[1].terminated).toBe(false)
  })

  it('keeps a growing fence as one code block', () => {
    const start = fixture.indexOf('```ts') + 4
    let cache = parseMarkdown(fixture.slice(0, start))

    for (let end = start; end <= fixture.length; end++) {
      cache = extendMarkdown(cache, fixture.slice(0, end))

      const code = cache.blocks.find(block => block.kind === 'code')

      expect(code, `no code block at ${end}`).toBeDefined()
    }

    const code = cache.blocks.find(block => block.kind === 'code')

    expect(code).toMatchObject({ kind: 'code', language: 'ts', code: 'const a = 1' })
  })
})

describe('edges that can still grow', () => {
  it('does not reuse a table that a new row can extend', () => {
    const before = parseMarkdown('| a |\n| - |\n| 1 |\n')
    const after = extendMarkdown(before, '| a |\n| - |\n| 1 |\n| 2 |\n')

    expect(before.blocks[0]).toMatchObject({ kind: 'table', terminated: false })
    expect(after.blocks[0]).not.toBe(before.blocks[0])
    expect(after.blocks[0]).toMatchObject({ kind: 'table' })
    expect((after.blocks[0] as { rows: unknown[] }).rows).toHaveLength(2)
  })

  it('does not reuse a list followed only by blank lines', () => {
    const before = parseMarkdown('- a\n\n')
    const after = extendMarkdown(before, '- a\n\n- b\n')

    expect(before.blocks[0]).toMatchObject({ kind: 'list', terminated: false })
    expect(after.blocks[0]).not.toBe(before.blocks[0])
    expect((after.blocks[0] as { items: unknown[] }).items).toHaveLength(2)
  })

  it('does not reuse a quote that a new line can extend', () => {
    const before = parseMarkdown('> a\n')
    const after = extendMarkdown(before, '> a\n> b\n')

    expect(before.blocks[0].terminated).toBe(false)
    expect(after.blocks[0]).not.toBe(before.blocks[0])
  })

  it('does not reuse a setext underline before its newline arrives', () => {
    const before = parseMarkdown('Title\n---')
    const after = extendMarkdown(before, 'Title\n---\n')

    expect(before.blocks).toHaveLength(2)
    expect(after.blocks).toHaveLength(1)
    expect(after.blocks[0]).toMatchObject({ kind: 'heading', level: 2 })
  })
})

describe('cache identity', () => {
  it('returns the same cache for the same source', () => {
    const cache = parseMarkdown('# a\n')

    expect(extendMarkdown(cache, '# a\n')).toBe(cache)
  })

  it('parses from scratch when the source is edited', () => {
    const cache = parseMarkdown('# a\n\n# b\n')
    const edited = extendMarkdown(cache, '# a\n\n# c\n')

    expect(edited.blocks).not.toBe(cache.blocks)
    expect(edited.blocks).toHaveLength(2)
  })

  it('handles an empty document', () => {
    expect(parseMarkdown('').blocks).toEqual([])
    expect(extendMarkdown(undefined, '').blocks).toEqual([])
  })

  it('falls back to a full parse when a kept block does not end on a line start', () => {
    // A cache boundary that lands inside a line cannot be resumed from; the
    // guard keeps the result identical to a fresh parse.
    const previous = {
      source: 'abc\n',
      blocks: [
        {
          kind: 'rule',
          start: 0,
          end: 2,
          terminated: true,
        },
      ],
    } as MarkdownCache
    const source = 'abc\ndef'

    expect(extendMarkdown(previous, source)).toEqual(parseMarkdown(source))
  })

  it('keeps absolute offsets while appending', () => {
    const cache = extendMarkdown(parseMarkdown('a\n\n'), 'a\n\nb\n')

    expect(cache.blocks[0]).toMatchObject({ start: 0, end: 2 })
    expect(cache.blocks[1]).toMatchObject({ start: 3, end: 5 })
  })
})
