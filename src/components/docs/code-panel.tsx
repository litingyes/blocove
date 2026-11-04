import { cn } from 'cn'
import { WrapTextIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockLine,
  CodeBlockTitle,
} from '@/components/ui/code-block'
import { useHighlightedCode } from '@/hooks/use-highlighted-code'
import { DownloadButton } from './download-button'

export interface CodePanelProps {
  code: string
  language?: string
  title?: string
  className?: string
  lineNumbers?: boolean
}

/**
 * Highlighted code in the shadcn/ui code block: a header with the file name and
 * copy, download and line-wrap actions, and the highlighted lines below.
 */
export function CodePanel({
  code,
  language = 'tsx',
  title,
  className,
  lineNumbers = true,
}: CodePanelProps) {
  const lines = useHighlightedCode(code, language)
  const [wrap, setWrap] = useState(true)
  const label = title ?? language

  return (
    <CodeBlock size="sm" className={cn('bg-muted/30', className)}>
      <CodeBlockHeader className="border-b bg-muted/40 pb-2">
        <CodeBlockTitle className="text-muted-foreground">
          <span className="font-mono font-normal">{label}</span>
        </CodeBlockTitle>
        <CodeBlockActions>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={wrap ? 'Disable line wrapping' : 'Wrap long lines'}
            aria-pressed={wrap}
            className={cn(!wrap && 'text-muted-foreground')}
            onClick={() => setWrap(current => !current)}
          >
            <WrapTextIcon />
          </Button>
          <DownloadButton code={code} language={language} title={title} />
          <CodeBlockCopyButton
            value={code}
            aria-label={`Copy ${label} code`}
          />
        </CodeBlockActions>
      </CodeBlockHeader>
      <CodeBlockContent
        wrap={wrap}
        lineNumbers={lineNumbers}
        className="max-h-[420px] text-xs"
      >
        {lines.map((line, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <CodeBlockLine key={index}>{line}</CodeBlockLine>
        ))}
      </CodeBlockContent>
    </CodeBlock>
  )
}
