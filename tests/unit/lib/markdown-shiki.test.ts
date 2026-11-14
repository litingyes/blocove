import type { ReactNode } from 'react'
import { isValidElement } from 'react'
import { describe, expect, it } from 'vitest'
import { loadMarkdownFenceHighlighter } from '@/lib/blocove/markdown-shiki'

/** The token text of one highlighted line, with the shiki spans flattened. */
function textOf(line: ReactNode[]): string {
  return line
    .map(node => isValidElement(node)
      ? (node.props as { children?: string }).children ?? ''
      : String(node ?? ''))
    .join('')
}

describe('loadMarkdownFenceHighlighter', () => {
  it('returns null for a language it does not ship', async () => {
    expect(await loadMarkdownFenceHighlighter('cobol')).toBeNull()
  })

  it('highlights a line and continues from the grammar state it returned', async () => {
    const highlighter = await loadMarkdownFenceHighlighter('ts')

    expect(highlighter).not.toBeNull()

    const first = highlighter!.highlight('const answer = 42')
    const second = highlighter!.highlight('export default answer', first.state)

    expect(first.lines).toHaveLength(1)
    expect(textOf(first.lines[0] ?? [])).toBe('const answer = 42')
    expect(first.state).toBeDefined()

    expect(second.lines).toHaveLength(1)
    expect(textOf(second.lines[0] ?? [])).toBe('export default answer')
  })

  it('styles the tokens for the light and the dark theme', async () => {
    const highlighter = await loadMarkdownFenceHighlighter('ts')
    const [token] = highlighter!.highlight('const answer = 42').lines[0] ?? []

    expect(isValidElement(token)).toBe(true)

    if (!isValidElement(token)) {
      throw new Error('the highlighted token is an element')
    }

    const props = token.props as { className?: string, style?: unknown }

    expect(props).toMatchObject({
      className: 'text-(--shiki-light) dark:text-(--shiki-dark)',
    })
    expect(props.style).toBeDefined()
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
      const highlighter = await loadMarkdownFenceHighlighter(language)

      expect(highlighter, language).not.toBeNull()
      expect(highlighter!.highlight(code).lines.length, language).toBeGreaterThan(0)
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
      'TS',
    ]) {
      expect(await loadMarkdownFenceHighlighter(alias), alias).not.toBeNull()
    }
  })
})
