import type { MarkdownInline } from '@/registry/blocove/lib/markdown-parse'
import { describe, expect, it } from 'vitest'
import { parseInline, sanitizeHref } from '@/registry/blocove/lib/markdown-parse'

function inline(source: string): MarkdownInline[] {
  return parseInline(source)
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

function shape(source: string): unknown {
  return inline(source).map((node) => {
    switch (node.kind) {
      case 'text':
        return `text:${node.value}`
      case 'code':
        return `code:${node.value}`
      case 'math':
        return `math:${node.value}`
      case 'break':
        return node.hard ? 'br' : 'soft'
      case 'footnote-ref':
        return `ref:${node.id}`
      case 'image':
        return `img:${node.alt}`
      default:
        return `${node.kind}[${node.children.map(child => child.kind).join(',')}]`
    }
  })
}

describe('text', () => {
  it('returns a single text node for plain content', () => {
    expect(inline('plain words')).toEqual([
      { kind: 'text', value: 'plain words' },
    ])
  })

  it('returns nothing for empty content', () => {
    expect(inline('')).toEqual([])
  })
})

describe('emphasis', () => {
  it('parses strong, emphasis and deletion', () => {
    expect(shape('**bold**')).toEqual(['strong[text]'])
    expect(shape('*em*')).toEqual(['emphasis[text]'])
    expect(shape('~~gone~~')).toEqual(['del[text]'])
  })

  it('nests emphasis inside strong', () => {
    const nodes = inline('**a *b* c**')

    expect(nodes).toHaveLength(1)
    expect(nodes[0].kind).toBe('strong')
    expect(text(nodes)).toBe('a b c')
  })

  it('parses a triple run as strong and emphasis', () => {
    const nodes = inline('***both***')

    expect(nodes[0].kind).toBe('strong')
    expect((nodes[0] as { children: MarkdownInline[] }).children[0].kind).toBe('emphasis')
  })

  it('keeps an unbalanced marker literal', () => {
    expect(shape('**bold')).toEqual(['text:**bold'])
    expect(shape('*em')).toEqual(['text:*em'])
  })

  it('treats a single tilde and a lone marker as text', () => {
    expect(shape('~one~')).toEqual(['text:~one~'])
    expect(shape('a * b')).toEqual(['text:a * b'])
  })

  it('reads a code span inside the emphasis body', () => {
    expect(text(inline('*a `code` b*'))).toBe('a code b')
    expect(text(inline('*a ` b*'))).toBe('a ` b')
  })

  it('skips a shorter marker run while looking for the closing one', () => {
    expect(text(inline('**a * b**'))).toBe('a * b')
  })

  it('does not emphasise underscores inside a word', () => {
    expect(shape('snake_case_name')).toEqual(['text:snake_case_name'])
    expect(shape('_em_')).toEqual(['emphasis[text]'])
  })
})

describe('code spans', () => {
  it('parses a code span', () => {
    expect(shape('a `b` c')).toEqual(['text:a ', 'code:b', 'text: c'])
  })

  it('lets a longer run contain backticks', () => {
    expect(shape('``a `b` c``')).toEqual(['code:a `b` c'])
  })

  it('trims one edge space but keeps inner spaces', () => {
    expect(shape('` a `')).toEqual(['code:a'])
    expect(shape('` a b `')).toEqual(['code:a b'])
  })

  it('keeps an unclosed backtick literal', () => {
    expect(shape('`a')).toEqual(['text:`a'])
  })
})

describe('escapes and entities', () => {
  it('unescapes punctuation', () => {
    expect(shape('\\*not emphasis\\*')).toEqual(['text:*not emphasis*'])
  })

  it('decodes named and numeric entities', () => {
    expect(shape('&amp;')).toEqual(['text:&'])
    expect(shape('&#65;')).toEqual(['text:A'])
    expect(shape('&#x41;')).toEqual(['text:A'])
  })

  it('keeps an unknown entity literal', () => {
    expect(shape('&bogus;')).toEqual(['text:&bogus;'])
  })

  it('keeps an out-of-range code point literal', () => {
    expect(shape('&#9999999;')).toEqual(['text:&#9999999;'])
  })
})

describe('links and images', () => {
  it('parses a link with a title', () => {
    expect(inline('[label](https://x.dev "Title")')).toEqual([
      {
        kind: 'link',
        href: 'https://x.dev',
        title: 'Title',
        children: [
          { kind: 'text', value: 'label' },
        ],
      },
    ])
  })

  it('parses an image', () => {
    expect(inline('![alt](https://x.dev/a.png)')).toEqual([
      {
        kind: 'image',
        src: 'https://x.dev/a.png',
        title: undefined,
        alt: 'alt',
      },
    ])
  })

  it('parses a link inside emphasis', () => {
    const nodes = inline('**a [b](https://x.dev)**')

    expect(text(nodes)).toBe('a b')
  })

  it('keeps a link with a missing closing paren literal', () => {
    expect(shape('[a](https://x.dev')).toEqual(['text:[a](https://x.dev'])
  })

  it('refuses an unsafe scheme', () => {
    expect(shape('[x](javascript:alert(1))')).toEqual(['text:[x](javascript:alert(1))'])
  })

  it('reads an angle destination', () => {
    expect(inline('[a](<https://x.dev/a b>)')[0]).toMatchObject({
      kind: 'link',
      href: 'https://x.dev/a b',
    })
  })

  it('reads every title form and ignores padding', () => {
    expect(inline('[a](https://x.dev "Double")')[0]).toMatchObject({ title: 'Double' })
    expect(inline('[a](https://x.dev \'Single\')')[0]).toMatchObject({ title: 'Single' })
    expect(inline('[a](https://x.dev (Paren))')[0]).toMatchObject({ title: 'Paren' })
    expect(inline('[a]( https://x.dev "Spaced" )')[0]).toMatchObject({
      href: 'https://x.dev',
      title: 'Spaced',
    })
  })

  it('unescapes punctuation escapes in the destination and the label', () => {
    expect(inline('[a](https://x.dev/a\\)b)')[0]).toMatchObject({
      href: 'https://x.dev/a)b',
    })
    expect(text(inline('[a \\] b](https://x.dev)'))).toBe('a ] b')
  })

  it('reads a label that holds an unclosed code span', () => {
    expect(text(inline('[a `b](https://x.dev)'))).toBe('a `b')
  })

  it('keeps a malformed destination literal', () => {
    // The bracketed link never forms; the bare URL inside it still autolinks.
    expect(shape('[a](https://x.dev "unterminated)')).toEqual([
      'text:[a](',
      'link[text]',
      'text: "unterminated)',
    ])
    expect(shape('[a](https://x.dev extra)')).toEqual([
      'text:[a](',
      'link[text]',
      'text: extra)',
    ])
    expect(shape('[label] text')).toEqual(['text:[label] text'])
  })

  it('reads the autolink inside an unterminated angle destination', () => {
    // The link itself fails, so the angle run is parsed on its own.
    const nodes = inline('[a](<https://x.dev)')

    expect(nodes.map(node => node.kind)).toEqual(['text', 'link', 'text'])
    expect(nodes[1]).toMatchObject({ kind: 'link', href: 'https://x.dev' })
  })

  it('accepts relative and fragment URLs', () => {
    expect(text(inline('[a](/docs)'))).toBe('a')
    expect(text(inline('[a](#anchor)'))).toBe('a')
  })
})

describe('autolinks', () => {
  it('parses a bracketed autolink', () => {
    expect(inline('<https://x.dev>')).toEqual([
      {
        kind: 'link',
        href: 'https://x.dev',
        children: [
          { kind: 'text', value: 'https://x.dev' },
        ],
      },
    ])
  })

  it('turns a bracketed address into a mailto link', () => {
    const nodes = inline('<me@x.dev>')

    expect(nodes[0].kind).toBe('link')
    expect((nodes[0] as { href: string }).href).toBe('mailto:me@x.dev')
  })

  it('parses a bare URL and trims trailing punctuation', () => {
    const nodes = inline('see https://x.dev/a.')

    expect((nodes[1] as { href: string }).href).toBe('https://x.dev/a')
    expect(text(nodes)).toBe('see https://x.dev/a.')
  })

  it('keeps a literal angle run and an address inside a word', () => {
    expect(shape('<not a link>')).toEqual(['text:<not a link>'])
    expect(shape('xhttps://x.dev')).toEqual(['text:xhttps://x.dev'])
  })

  it('adds the scheme to a www address', () => {
    const nodes = inline('www.x.dev')

    expect((nodes[0] as { href: string }).href).toBe('https://www.x.dev')
  })
})

describe('footnote references and math', () => {
  it('parses a footnote reference', () => {
    expect(shape('a[^note]')).toEqual(['text:a', 'ref:note'])
  })

  it('parses inline math', () => {
    expect(shape('$x^2$')).toEqual(['math:x^2'])
  })

  it('keeps a spaced dollar literal', () => {
    expect(shape('$ x $')).toEqual(['text:$ x $'])
  })

  it('keeps an escaped dollar inside math', () => {
    expect(shape('$a\\$b$')).toEqual(['math:a\\$b'])
  })

  it('keeps an unclosed dollar literal', () => {
    expect(shape('$x')).toEqual(['text:$x'])
  })
})

describe('breaks', () => {
  it('reads two trailing spaces as a hard break', () => {
    expect(shape('a  \nb')).toEqual(['text:a', 'br', 'text:b'])
  })

  it('reads a newline as a soft break', () => {
    expect(shape('a\nb')).toEqual(['text:a', 'soft', 'text:b'])
  })

  it('reads a backslash before a newline as a hard break', () => {
    expect(shape('a\\\nb')).toEqual(['text:a', 'br', 'text:b'])
  })
})

describe('sanitizeHref', () => {
  it('allows the safe schemes', () => {
    expect(sanitizeHref('https://x.dev')).toBe('https://x.dev')
    expect(sanitizeHref('mailto:me@x.dev')).toBe('mailto:me@x.dev')
    expect(sanitizeHref('tel:+123')).toBe('tel:+123')
  })

  it('drops the executable schemes', () => {
    expect(sanitizeHref('javascript:alert(1)')).toBeNull()
    expect(sanitizeHref(' JAVASCRIPT:alert(1)')).toBeNull()
    expect(sanitizeHref('data:text/html,<script>')).toBeNull()
    expect(sanitizeHref('vbscript:msgbox')).toBeNull()
  })

  it('keeps relative paths and fragments', () => {
    expect(sanitizeHref('/docs')).toBe('/docs')
    expect(sanitizeHref('#top')).toBe('#top')
    expect(sanitizeHref('./a')).toBe('./a')
    expect(sanitizeHref('https')).toBe('https')
  })

  it('returns an empty href for whitespace and control characters only', () => {
    expect(sanitizeHref('   ')).toBe('')
    expect(sanitizeHref('\u0007')).toBe('')
  })

  it('strips control characters before checking', () => {
    expect(sanitizeHref('java\nscript:alert(1)')).toBeNull()
  })
})
