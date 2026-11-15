import type { MarkdownComponents } from '@/lib/blocove/markdown-parse'
import { cn } from 'cn'
import { useMemo } from 'react'
import { MarkdownChart } from '@/registry/blocove/ui/markdown/chart'
import { MarkdownCodeBlock } from '@/registry/blocove/ui/markdown/code-block'
import { Markdown } from '@/registry/blocove/ui/markdown/markdown'
import { MarkdownMath } from '@/registry/blocove/ui/markdown/math'
import { MarkdownMermaid } from '@/registry/blocove/ui/markdown/mermaid'

export interface MarkdownDemoFrameProps {
  /** The markdown the demo renders. */
  source: string
  /** Register the shiki fence renderer. */
  code?: boolean
  /** Register the KaTeX renderer. */
  math?: boolean
  /** Register the Pele renderer. */
  mermaid?: boolean
  /** Register the shadcn/ui chart renderer. */
  chart?: boolean
  className?: string
}

/**
 * Shared preview surface for the markdown demos: one bordered panel with the
 * reading column the node styles are designed for. The capability map is rebuilt
 * only when a flag changes; the shell compares its entries, so finished blocks
 * keep their identity while the source grows.
 */
export function MarkdownDemoFrame({
  source,
  code = false,
  math = false,
  mermaid = false,
  chart = false,
  className,
}: MarkdownDemoFrameProps) {
  const components = useMemo(() => {
    const result: MarkdownComponents = {}

    if (code) {
      result.code = MarkdownCodeBlock
    }

    if (math) {
      result.math = MarkdownMath
    }

    if (mermaid) {
      result.fences = {
        ...(result.fences ?? {}),
        mermaid: MarkdownMermaid,
      }
    }

    if (chart) {
      result.fences = {
        ...(result.fences ?? {}),
        chart: MarkdownChart,
      }
    }

    return Object.keys(result).length > 0
      ? result
      : undefined
  }, [code, math, mermaid, chart])

  return (
    <div
      className={cn(
        'w-full max-w-2xl rounded-lg border bg-background p-4 text-start sm:p-6',
        className,
      )}
    >
      <Markdown source={source} components={components} />
    </div>
  )
}
