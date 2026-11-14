/* eslint-disable react/dom-no-dangerously-set-innerhtml -- the markup comes from KaTeX, which escapes its input and keeps its trust option off. */

import type { MarkdownMathProps } from '@/lib/blocove/markdown-parse'
import { cn } from 'cn'
import katex from 'katex'
import { useMemo } from 'react'

export interface MarkdownMathRendererProps extends MarkdownMathProps {
  className?: string
}

function renderMath(value: string, display: boolean): string | null {
  try {
    // `throwOnError: false` renders the expression with KaTeX's own error color
    // instead of throwing, which is what a half-written formula needs.
    return katex.renderToString(value, {
      displayMode: display,
      throwOnError: false,
      strict: 'ignore',
    })
  }
  catch {
    return null
  }
}

/**
 * Math renderer for the markdown shell, powered by KaTeX.
 *
 * Register it through the shell's capability map:
 *
 * ```tsx
 * <Markdown source={source} components={{ math: MarkdownMath }} />
 * ```
 *
 * Consumers must import `katex/dist/katex.min.css` for the formula layout.
 * Without this renderer, the shell leaves `$…$` and `$$…$$` as text.
 */
export function MarkdownMath({
  value,
  display,
  streaming,
  className,
}: MarkdownMathRendererProps) {
  const html = useMemo(() => renderMath(value, display), [value, display])

  if (html === null) {
    return (
      <code className={cn(className)} data-streaming={streaming || undefined}>
        {display
          ? `$$${value}$$`
          : `$${value}$`}
      </code>
    )
  }

  if (display) {
    return (
      <div
        className={cn('typeset-scroll', className)}
        data-streaming={streaming || undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  return (
    <span
      className={cn(className)}
      data-streaming={streaming || undefined}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
