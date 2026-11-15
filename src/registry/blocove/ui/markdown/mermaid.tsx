import type { CSSProperties } from 'react'
import type { MarkdownMermaidInstance } from '@/lib/blocove/markdown-mermaid'
import type { MarkdownCodeProps } from '@/lib/blocove/markdown-parse'
import { cn } from 'cn'
import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from '@/components/ui/code-block'
import {
  buildMarkdownMermaidOptions,
  loadMarkdownMermaid,
  markdownMermaidIdPrefix,
} from '@/lib/blocove/markdown-mermaid'

export interface MarkdownMermaidProps extends MarkdownCodeProps {
  className?: string
}

// Pele paints with CSS variables, so mapping them onto the shadcn tokens makes
// the diagram follow the theme without re-rendering. The series palette repeats
// the five chart colors for the eighth Pele categories.
const mermaidTheme = {
  '--pele-bg': 'var(--background)',
  '--pele-fg': 'var(--foreground)',
  '--pele-muted': 'var(--muted-foreground)',
  '--pele-line': 'var(--border)',
  '--pele-surface': 'var(--muted)',
  '--pele-surface-alt': 'var(--muted)',
  '--pele-border': 'var(--border)',
  '--pele-accent': 'var(--primary)',
  '--pele-critical': 'var(--destructive)',
  '--pele-error': 'var(--destructive)',
  '--pele-radius': 'var(--radius)',
  '--pele-series-1': 'var(--chart-1)',
  '--pele-series-2': 'var(--chart-2)',
  '--pele-series-3': 'var(--chart-3)',
  '--pele-series-4': 'var(--chart-4)',
  '--pele-series-5': 'var(--chart-5)',
  '--pele-series-6': 'var(--chart-1)',
  '--pele-series-7': 'var(--chart-2)',
  '--pele-series-8': 'var(--chart-3)',
} as CSSProperties

const subscribeToNothing = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

/** The client boundary without a state write in an effect. */
function useMounted(): boolean {
  return useSyncExternalStore(subscribeToNothing, getClientSnapshot, getServerSnapshot)
}

function errorMessage(cause: unknown): string {
  return cause instanceof Error && cause.message !== ''
    ? cause.message
    : 'The diagram could not be rendered.'
}

/**
 * Mermaid renderer for the markdown shell, drawn with Pele.
 *
 * Register it through the shell's fence map:
 *
 * ```tsx
 * <Markdown source={source} components={{ fences: { mermaid: MarkdownMermaid } }} />
 * ```
 *
 * While the fence is open, or when Pele rejects it, the fence stays the source
 * code block. Once the closing fence arrives (or the source is final), the
 * diagram mounts client-side: Pele reads the container width, follows resizes
 * and owns the error display. Colors come from the shadcn CSS variables mapped
 * onto `--pele-*` in the card, so a theme switch does not re-render the diagram.
 */
export function MarkdownMermaid({
  code,
  streaming,
  complete,
  className,
}: MarkdownMermaidProps) {
  const mounted = useMounted()
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const id = useId()
  const idPrefix = markdownMermaidIdPrefix(id)

  useEffect(() => {
    if (!complete || !mounted) {
      return
    }

    let cancelled = false

    loadMarkdownMermaid()
      .then(() => {
        if (!cancelled) {
          setReady(true)
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(errorMessage(cause))
        }
      })

    return () => {
      cancelled = true
    }
  }, [complete, mounted])

  useEffect(() => {
    if (!ready || !complete || error) {
      return
    }

    const element = containerRef.current

    if (!element) {
      return
    }

    let cancelled = false
    let instance: MarkdownMermaidInstance | undefined

    element.replaceChildren()

    loadMarkdownMermaid()
      .then(pele => pele.mountAsync(element, code, {
        ...buildMarkdownMermaidOptions(idPrefix),
        onError: (cause: unknown) => {
          if (!cancelled) {
            setError(errorMessage(cause))
          }
        },
      }))
      .then((next) => {
        if (cancelled) {
          next.destroy()
        }
        else {
          instance = next
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(errorMessage(cause))
        }
      })

    return () => {
      cancelled = true
      instance?.destroy()
      element.replaceChildren()
    }
  }, [ready, complete, code, idPrefix, error])

  const failed = error !== null
  const showSource = !complete || !mounted || !ready || failed

  return (
    <CodeBlock
      data-language="mermaid"
      data-streaming={streaming || undefined}
      className={cn(className)}
      style={mermaidTheme}
    >
      <CodeBlockHeader>
        <CodeBlockTitle className="text-muted-foreground">mermaid</CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton value={code} aria-label="Copy mermaid source" />
        </CodeBlockActions>
      </CodeBlockHeader>
      {showSource
        ? (
            <>
              <CodeBlockContent>{code}</CodeBlockContent>
              {failed
                ? (
                    <p role="status" className="px-3 pb-3 text-xs text-destructive">
                      {error}
                    </p>
                  )
                : null}
            </>
          )
        : (
            <div
              ref={containerRef}
              data-slot="markdown-mermaid-surface"
              className="min-h-24 p-3"
            />
          )}
    </CodeBlock>
  )
}
