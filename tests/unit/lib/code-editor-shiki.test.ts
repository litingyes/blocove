import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getCodeEditorColorScheme,
  subscribeCodeEditorColorScheme,
  tokenizeCodeEditor,
} from '@/lib/blocove/code-editor-shiki'

function ranges(code: string, tokens: { from: number, to: number }[]) {
  return tokens.map(token => code.slice(token.from, token.to))
}

afterEach(() => {
  // The SSR tests stub the document away; restore it before touching the DOM.
  vi.unstubAllGlobals()

  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('dark')
    document.body?.classList.remove('dark')
  }
})

describe('getCodeEditorColorScheme', () => {
  it('defaults to light when no dark class is set', () => {
    expect(getCodeEditorColorScheme()).toBe('light')
  })

  it('follows the dark class on the document element and the body', () => {
    document.documentElement.classList.add('dark')
    expect(getCodeEditorColorScheme()).toBe('dark')

    document.documentElement.classList.remove('dark')
    document.body.classList.add('dark')
    expect(getCodeEditorColorScheme()).toBe('dark')
  })

  it('falls back to light without a document (SSR)', () => {
    vi.stubGlobal('document', undefined)

    expect(getCodeEditorColorScheme()).toBe('light')
  })
})

describe('subscribeCodeEditorColorScheme', () => {
  it('notifies and stops notifying after the returned unsubscribe runs', async () => {
    const listener = vi.fn()
    const unsubscribe = subscribeCodeEditorColorScheme(listener)

    document.documentElement.classList.add('dark')
    await vi.waitFor(() => {
      expect(listener).toHaveBeenCalled()
    })

    const calls = listener.mock.calls.length
    unsubscribe()
    document.documentElement.classList.remove('dark')
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(listener).toHaveBeenCalledTimes(calls)
  })

  it('is a no-op without a document', () => {
    vi.stubGlobal('document', undefined)
    const listener = vi.fn()

    const unsubscribe = subscribeCodeEditorColorScheme(listener)

    expect(unsubscribe).toBeTypeOf('function')
    expect(() => unsubscribe()).not.toThrow()
    expect(listener).not.toHaveBeenCalled()
  })
})

describe('tokenizeCodeEditor', () => {
  it('returns null for a language without a bundled grammar', async () => {
    expect(await tokenizeCodeEditor('plain text', 'cobol', 'light')).toBeNull()
  })

  it('tokenizes a single line into contiguous ranges with theme colors', async () => {
    const code = 'const answer = 42'
    const tokens = await tokenizeCodeEditor(code, 'javascript', 'light')

    expect(tokens).not.toBeNull()
    expect(tokens).toHaveLength(7)
    expect(ranges(code, tokens!)).toEqual([
      'const',
      ' ',
      'answer',
      ' ',
      '=',
      ' ',
      '42',
    ])

    for (let index = 1; index < tokens!.length; index++) {
      expect(tokens![index].from).toBe(tokens![index - 1].to)
    }

    expect(tokens![0].style).toContain('color: #D73A49;')
  })

  it('resolves aliases and language casing', async () => {
    expect(await tokenizeCodeEditor('const value = 1', 'ts', 'light')).not.toBeNull()
    expect(await tokenizeCodeEditor('const value = 1', 'JS', 'light')).not.toBeNull()
    expect(await tokenizeCodeEditor('const value = 1', 'typescript', 'dark')).not.toBeNull()
  })

  it('maps italic and bold font styles onto the token style', async () => {
    const code = '# Title\n\n**bold** and *italic*'
    const tokens = await tokenizeCodeEditor(code, 'markdown', 'light')

    expect(tokens).not.toBeNull()

    const slices = ranges(code, tokens!)
    const bold = tokens![slices.indexOf('**bold**')]
    const italic = tokens![slices.indexOf('*italic*')]

    expect(bold.style).toContain('font-weight: 600;')
    expect(italic.style).toContain('font-style: italic;')
  })

  it('advances over line breaks so ranges stay inside the document', async () => {
    const code = 'const answer = 42\nconsole.log(answer)\n'
    const tokens = await tokenizeCodeEditor(code, 'javascript', 'light')

    expect(tokens).not.toBeNull()
    expect(tokens!.length).toBeGreaterThan(7)
    for (const token of tokens!) {
      expect(token.from).toBeLessThan(token.to)
      expect(token.to).toBeLessThanOrEqual(code.length)
      expect(token.style).toMatch(/color: #[0-9A-F]{6};/i)
    }
  })

  it('uses a different palette for the dark scheme', async () => {
    const code = 'const answer = 42'
    const light = await tokenizeCodeEditor(code, 'javascript', 'light')
    const dark = await tokenizeCodeEditor(code, 'javascript', 'dark')

    expect(light![0].style).not.toBe(dark![0].style)
  })

  it('returns no tokens for an empty document', async () => {
    expect(await tokenizeCodeEditor('', 'javascript', 'light')).toEqual([])
  })

  it('loads every bundled language and resolves every alias', async () => {
    const samples: Record<string, string> = {
      bash: 'echo hi',
      css: '.a { color: red; }',
      diff: '-a\n+b',
      html: '<p>hi</p>',
      javascript: 'const a = 1',
      json: '{"a":1}',
      jsx: 'const a = <div />',
      markdown: '# Title',
      python: 'x = 1',
      sql: 'select 1',
      tsx: 'const a = <div />',
      typescript: 'const a: number = 1',
      yaml: 'a: 1',
    }

    for (const [language, code] of Object.entries(samples)) {
      const tokens = await tokenizeCodeEditor(code, language, 'light')
      expect(tokens, language).not.toBeNull()
    }

    for (const alias of [
      'js',
      'md',
      'py',
      'sh',
      'shell',
      'shellscript',
      'ts',
      'yml',
      'zsh',
    ]) {
      expect(await tokenizeCodeEditor('a = 1', alias, 'light'), alias).not.toBeNull()
    }
  })
})
