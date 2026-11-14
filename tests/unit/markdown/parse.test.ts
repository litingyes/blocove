import type { MarkdownBlock, MarkdownInline, MarkdownListBlock, MarkdownTableBlock } from '@/registry/blocove/lib/markdown-parse'
import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '@/registry/blocove/lib/markdown-parse'

function blocks(source: string): MarkdownBlock[] {
  return [
    ...parseMarkdown(source).blocks,
  ]
}

function kinds(source: string): string[] {
  return blocks(source).map(block => block.kind)
}

type BlockOfKind<Kind extends MarkdownBlock['kind']> = Extract<MarkdownBlock, { kind: Kind }>

function first<Kind extends MarkdownBlock['kind']>(source: string, kind: Kind): BlockOfKind<Kind> {
  const block = blocks(source).find(candidate => candidate.kind === kind)

  expect(block, `expected a ${kind} block in ${JSON.stringify(source)}`).toBeDefined()

  return block as BlockOfKind<Kind>
}

function text(inline: MarkdownInline[]): string {
  return inline
    .map((node) => {
      switch (node.kind) {
        case 'text':
        case 'code':
        case 'math':
          return node.value
        case 'break':
          return node.hard ? '\n' : ' '
        case 'footnote-ref':
          return `[^${node.id}]`
        case 'image':
          return node.alt
        default:
          return text(node.children)
      }
    })
    .join('')
}

describe('headings', () => {
  it('parses every ATX level', () => {
    const result = blocks('# One\n## Two\n### Three\n#### Four\n##### Five\n###### Six\n')

    expect(result.map(block => block.kind)).toEqual(Array.from({ length: 6 }).fill('heading'))
    expect(result.map(block => block.kind === 'heading' && block.level)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('strips the closing hash sequence', () => {
    expect(text(first('# Title ##', 'heading').inline)).toBe('Title')
  })

  it('turns a paragraph into a setext heading', () => {
    const result = blocks('Title\n===\n\nSub\n---\n')

    expect(result.map(block => block.kind === 'heading' && block.level)).toEqual([1, 2])
  })

  it('keeps a multi-line setext heading in one block', () => {
    const result = blocks('One\ntwo\n===\n')

    expect(result).toHaveLength(1)
    expect(text((result[0] as { inline: MarkdownInline[] }).inline)).toBe('One two')
  })

  it('accepts up to three spaces of indentation', () => {
    expect(kinds('   # Slim\n')).toEqual(['heading'])
    expect(kinds('    # Deep\n')).toEqual(['paragraph'])
  })
})

describe('rules and paragraphs', () => {
  it('parses a thematic break', () => {
    expect(kinds('---\n')).toEqual(['rule'])
    expect(kinds('***\n')).toEqual(['rule'])
    expect(kinds('_ _ _\n')).toEqual(['rule'])
  })

  it('keeps a rule after a blank line a rule', () => {
    expect(kinds('a\n\n---\n')).toEqual(['paragraph', 'rule'])
  })

  it('joins soft-wrapped paragraph lines into one block', () => {
    expect(kinds('one\ntwo\nthree\n')).toEqual(['paragraph'])
  })

  it('does not treat a bare dash as a list item', () => {
    expect(kinds('-\n')).toEqual(['paragraph'])
  })
})

describe('code fences', () => {
  it('reads the language from the info string', () => {
    const code = first('```ts title="x"\nconst a = 1\n```\n', 'code')

    expect(code.language).toBe('ts')
    expect(code.code).toBe('const a = 1')
  })

  it('closes on a fence at least as long as the opening one', () => {
    expect(first('~~~\nx\n~~~\n', 'code').code).toBe('x')
    expect(first('````\na\n```\nb\n````\n', 'code').code).toBe('a\n```\nb')
  })

  it('leaves an unterminated fence open', () => {
    const code = blocks('```ts\nconst a = 1\n')[0]

    expect(code.kind).toBe('code')
    expect(code.terminated).toBe(false)
  })

  it('keeps backticks in a tilde fence', () => {
    expect(first('~~~\na `b` c\n~~~\n', 'code').code).toBe('a `b` c')
  })
})

describe('blockquotes', () => {
  it('nests a quote inside a quote', () => {
    const quote = first('> a\n> > b\n', 'blockquote')

    expect(quote.children.map(block => block.kind)).toEqual(['paragraph', 'blockquote'])
  })

  it('keeps lazy continuation lines', () => {
    const quote = first('> a\nb\n', 'blockquote')

    expect(text((quote.children[0] as { inline: MarkdownInline[] }).inline)).toBe('a b')
  })
})

describe('lists', () => {
  function list(source: string): MarkdownListBlock {
    return first(source, 'list') as MarkdownListBlock
  }

  it('parses a tight bullet list', () => {
    const result = list('- a\n- b\n')

    expect(result.ordered).toBe(false)
    expect(result.tight).toBe(true)
    expect(result.items).toHaveLength(2)
  })

  it('keeps the first number of an ordered list', () => {
    const result = list('2. a\n3. b\n')

    expect(result.ordered).toBe(true)
    expect(result.startNumber).toBe(2)
  })

  it('parses task items', () => {
    const result = list('- [x] done\n- [ ] todo\n')

    expect(result.items.map(item => item.task)).toEqual(['checked', 'unchecked'])
  })

  it('nests a list inside an item', () => {
    const result = list('- a\n  - b\n')

    expect(result.items).toHaveLength(1)
    expect(result.items[0].children.map(block => block.kind)).toEqual(['paragraph', 'list'])
  })

  it('marks a list loose when a blank line separates items', () => {
    const result = list('- a\n\n- b\n')

    expect(result.tight).toBe(false)
    expect(result.items).toHaveLength(2)
  })

  it('keeps a lazy continuation line in the current item', () => {
    const list = first('- item\ncontinuation\n', 'list')

    expect(list.items).toHaveLength(1)
    expect(text((list.items[0].children[0] as { inline: MarkdownInline[] }).inline))
      .toBe('item continuation')
  })

  it('starts a new list when the marker style changes', () => {
    expect(kinds('- a\n1. b\n')).toEqual(['list', 'list'])
  })
})

describe('tables', () => {
  function table(source: string): MarkdownTableBlock {
    return first(source, 'table') as MarkdownTableBlock
  }

  it('reads the alignment of every column', () => {
    const result = table('| a | b | c |\n|:--|:-:|--:|\n')

    expect(result.align).toEqual(['left', 'center', 'right'])
  })

  it('pads a short row to the header width', () => {
    const result = table('| a | b |\n| --- | --- |\n| 1 |\n')

    expect(result.header).toHaveLength(2)
    expect(result.rows[0]).toHaveLength(2)
  })

  it('parses body rows into cells', () => {
    const result = table('| a |\n| --- |\n| 1 |\n| 2 |\n')

    expect(result.rows).toHaveLength(2)
    expect(text(result.rows[1][0])).toBe('2')
  })

  it('keeps an escaped pipe inside a cell', () => {
    const table = first('| a \\| b | c |\n| - | - |\n| 1 | 2 |\n', 'table')

    expect(text(table.header[0])).toBe('a | b')
  })

  it('does not read a bad delimiter row as a table', () => {
    expect(kinds('| a | b |\n| - | nope |\n| 1 | 2 |\n')).toEqual(['paragraph'])
  })

  it('ends the rows at the next block', () => {
    const result = blocks('| a |\n| - |\n| 1 |\n# Heading\n')
    const table = result[0]

    expect(result.map(block => block.kind)).toEqual(['table', 'heading'])
    expect(table.kind === 'table'
      ? table.rows
      : []).toHaveLength(1)
  })

  it('needs the delimiter row to become a table', () => {
    expect(kinds('| a | b |\n')).toEqual(['paragraph'])
  })
})

describe('footnotes and math', () => {
  it('parses a definition and its reference', () => {
    const result = blocks('Text[^1]\n\n[^1]: note\n')

    expect(result.map(block => block.kind)).toEqual(['paragraph', 'footnote'])
    expect(result[1]).toMatchObject({ kind: 'footnote', id: '1' })
  })

  it('parses single-line and fenced display math', () => {
    expect(first('$$x$$\n', 'math').value).toBe('x')
    expect(first('$$\na^2\n$$\n', 'math').value).toBe('a^2')
  })

  it('ends a footnote at a blank line', () => {
    const result = blocks('Text[^a]\n\n[^a]: note\n\nAfter\n')

    expect(result.map(block => block.kind)).toEqual(['paragraph', 'footnote', 'paragraph'])
  })

  it('keeps indented and lazy continuation lines in the footnote', () => {
    const indented = first('[^a]: first\n  second\n', 'footnote')
    const lazy = first('[^a]: first\nsecond\n', 'footnote')

    expect(text(indented.inline)).toBe('first second')
    expect(text(lazy.inline)).toBe('first second')
  })

  it('leaves an open math fence at a blank line', () => {
    const result = blocks('$$\na + b\n\nAfter\n')
    const math = result[0]

    expect(math.kind === 'math'
      ? math.value
      : '').toBe('a + b')
    expect(result.map(block => block.kind)).toEqual(['math', 'paragraph'])
  })

  it('leaves an unterminated math fence open', () => {
    expect(blocks('$$\na^2\n')[0].terminated).toBe(false)
  })
})

describe('safety and input normalization', () => {
  it('renders raw HTML blocks as text', () => {
    const result = blocks('<script>alert(1)</script>\n')

    expect(result).toHaveLength(1)
    expect(text((result[0] as { inline: MarkdownInline[] }).inline)).toBe('<script>alert(1)</script>')
  })

  it('normalizes CRLF and CR line endings', () => {
    const cache = parseMarkdown('a\r\n\r\nb\rc\n')

    expect(cache.source).not.toContain('\r')
    expect(cache.blocks).toHaveLength(2)
  })
})

describe('offsets', () => {
  it('records the range of every block and leaves the last one open', () => {
    const result = blocks('a\n\nb')

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ start: 0, end: 2, terminated: true })
    expect(result[1]).toMatchObject({ start: 3, end: 4, terminated: false })
  })

  it('terminates a block only when something follows it', () => {
    expect(blocks('a\n')[0].terminated).toBe(false)
    expect(blocks('a\n\n')[0].terminated).toBe(true)
  })
})
