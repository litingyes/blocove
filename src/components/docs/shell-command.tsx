import type { ReactNode } from 'react'
import { cn } from 'cn'
import { Fragment } from 'react'
import { useHighlightedCode } from '@/hooks/use-highlighted-code'

export interface ShellCommandProps {
  /** Command line, exactly as it is copied to the clipboard. */
  command: string
  className?: string
}

/**
 * A shell command highlighted as `bash`, with the same shiki themes as the code
 * panels. The grammar loads lazily, so the first paint is plain text; the
 * wrapper only changes the colours, never the characters that get copied.
 */
export function ShellCommand({ command, className }: ShellCommandProps) {
  const lines: ReactNode[] = useHighlightedCode(command, 'bash')

  return (
    <code data-slot="shell-command" className={cn('font-mono', className)}>
      {lines.map((line, index) => (
        // eslint-disable-next-line react/no-array-index-key -- lines are static per command
        <Fragment key={index}>
          {index > 0
            ? '\n'
            : null}
          {line}
        </Fragment>
      ))}
    </code>
  )
}
