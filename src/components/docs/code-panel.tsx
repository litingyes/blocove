import { cn } from 'cn'
import { CodeBlockContent, CodeBlockLine } from '@/components/ui/code-block'
import { useHighlightedCode } from '@/hooks/use-highlighted-code'
import { CopyButton } from './copy-button'

export interface CodePanelProps {
  code: string
  language?: string
  title?: string
  className?: string
  bodyClassName?: string
  lineNumbers?: boolean
}

/**
 * Highlighted code with a small header and a copy action.
 */
export function CodePanel({
  code,
  language = 'tsx',
  title,
  className,
  bodyClassName,
  lineNumbers = true,
}: CodePanelProps) {
  const lines = useHighlightedCode(code, language)

  return (
    <div
      data-slot="docs-code-panel"
      className={cn(
        'overflow-hidden rounded-lg border bg-muted/30',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-3 py-1.5">
        <span className="truncate font-mono text-xs text-muted-foreground">
          {title ?? language}
        </span>
        <CopyButton
          value={code}
          label={`Copy ${title ?? language} code`}
          variant="ghost"
          size="icon-xs"
        />
      </div>
      <CodeBlockContent
        lineNumbers={lineNumbers}
        className={cn('max-h-[420px] text-xs', bodyClassName)}
      >
        {lines.map((line, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <CodeBlockLine key={index}>{line}</CodeBlockLine>
        ))}
      </CodeBlockContent>
    </div>
  )
}
