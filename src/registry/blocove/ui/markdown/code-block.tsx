/* eslint-disable react/no-array-index-key -- a fence only ever appends lines, so the line index is the identity. */

import type { ReactNode } from 'react'
import type { GrammarState } from 'shiki/core'
import type { MarkdownCodeProps } from '@/lib/blocove/markdown-parse'
import type { MarkdownFenceHighlighter } from '@/lib/blocove/markdown-shiki'
import { cn } from 'cn'
import { useEffect, useMemo, useState } from 'react'
import { loadMarkdownFenceHighlighter } from '@/lib/blocove/markdown-shiki'

interface HighlightState {
  highlighter: MarkdownFenceHighlighter | null
  /** The code already highlighted into `lines`. */
  text: string
  lines: ReactNode[][]
  state?: GrammarState
}

/**
 * Highlights a fence incrementally. While the fence streams, only the lines
 * that completed since the last render are tokenized; the last line is still
 * being written, so it is tokenized on every render, starting from the grammar
 * state of the line before it.
 */
function useFenceLines(code: string, language: string): ReactNode[][] {
  const [loaded, setLoaded] = useState<{
    language: string
    highlighter: MarkdownFenceHighlighter | null
  } | null>(null)
  const highlighter = loaded?.language === language
    ? loaded.highlighter
    : null

  useEffect(() => {
    let cancelled = false

    loadMarkdownFenceHighlighter(language)
      .then((next) => {
        if (!cancelled) {
          setLoaded({ language, highlighter: next })
        }
      })
      // An unknown or unavailable language renders as plain text; the failure is
      // not retried on every render.
      .catch(() => {
        if (!cancelled) {
          setLoaded({ language, highlighter: null })
        }
      })

    return () => {
      cancelled = true
    }
  }, [language])

  const [done, setDone] = useState<HighlightState>({
    highlighter: null,
    text: '',
    lines: [],
  })

  let next = done

  if (next.highlighter !== highlighter || !code.startsWith(next.text)) {
    next = { highlighter, text: '', lines: [] }
  }

  const end = code.lastIndexOf('\n') + 1

  if (highlighter && end > next.text.length) {
    const result = highlighter.highlight(code.slice(next.text.length, end - 1), next.state)

    next = {
      highlighter,
      text: code.slice(0, end),
      lines: [
        ...next.lines,
        ...result.lines,
      ],
      state: result.state,
    }
  }

  if (next !== done) {
    setDone(next)
  }

  const tail = code.slice(end)

  return useMemo(() => {
    if (!highlighter) {
      return code.split('\n').map(line => [line])
    }

    return [...next.lines, highlighter.highlight(tail, next.state).lines[0]]
  }, [code, highlighter, next, tail])
}

export interface MarkdownCodeBlockProps extends MarkdownCodeProps {
  className?: string
}

/**
 * Fence renderer for the markdown shell, highlighted with shiki.
 *
 * Register it through the shell's capability map:
 *
 * ```tsx
 * <Markdown source={source} components={{ code: MarkdownCodeBlock }} />
 * ```
 *
 * The element keeps no `data-slot` on purpose: shadcn/typeset already styles
 * `pre > code`, so the fence is left in the typeset flow and the tokens only add
 * color.
 */
export function MarkdownCodeBlock({
  language,
  code,
  streaming,
  className,
}: MarkdownCodeBlockProps) {
  const lines = useFenceLines(code, language)

  return (
    <pre
      data-language={language || undefined}
      data-streaming={streaming || undefined}
      className={cn(className)}
    >
      <code>
        {lines.map((line, index) => (
          <span key={index} className="block">
            {line.length > 0
              ? line
              : '\n'}
          </span>
        ))}
      </code>
    </pre>
  )
}
