import type { MarkdownComponents } from '@/lib/blocove/markdown-parse'
import { cn } from 'cn'
import { MarkdownCodeBlock } from '@/registry/blocove/ui/markdown/code-block'
import { Markdown } from '@/registry/blocove/ui/markdown/markdown'
import { MarkdownMath } from '@/registry/blocove/ui/markdown/math'

// Capability maps are module constants so the shell can hold them stable and skip
// re-rendering the blocks that already finished.
const codeCapability: MarkdownComponents = { code: MarkdownCodeBlock }
const mathCapability: MarkdownComponents = { math: MarkdownMath }
const allCapabilities: MarkdownComponents = {
  code: MarkdownCodeBlock,
  math: MarkdownMath,
}

export interface MarkdownDemoFrameProps {
  /** The markdown the demo renders. */
  source: string
  /** Register the shiki fence renderer. */
  code?: boolean
  /** Register the KaTeX renderer. */
  math?: boolean
  className?: string
}

/**
 * Shared preview surface for the markdown demos: one bordered panel with the
 * reading column the node styles are designed for.
 */
export function MarkdownDemoFrame({
  source,
  code = false,
  math = false,
  className,
}: MarkdownDemoFrameProps) {
  const components = code && math
    ? allCapabilities
    : code
      ? codeCapability
      : math
        ? mathCapability
        : undefined

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
