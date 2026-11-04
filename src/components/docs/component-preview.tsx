import type { ReactNode } from 'react'
import { cn } from 'cn'
import { ChevronUpIcon, CodeIcon } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CodePanel } from './code-panel'

export interface ComponentPreviewProps {
  title: string
  code: string
  language?: string
  children: ReactNode
  className?: string
  previewClassName?: string
}

/**
 * Demo stage with a collapsible code panel underneath.
 */
export function ComponentPreview({
  title,
  code,
  language = 'tsx',
  children,
  className,
  previewClassName,
}: ComponentPreviewProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <div
      data-slot="component-preview"
      className={cn('overflow-hidden rounded-xl border', className)}
    >
      <div
        className={cn(
          'grid min-h-[350px] place-items-center p-6 sm:p-10',
          previewClassName,
        )}
      >
        {children}
      </div>

      <div className="relative border-t">
        <div
          id={panelId}
          className={cn(
            'relative',
            open ? 'block' : 'max-h-24 overflow-hidden',
          )}
        >
          <CodePanel
            code={code}
            language={language}
            title={title}
            className="rounded-none border-0 bg-transparent"
            bodyClassName={open ? undefined : 'max-h-20'}
          />
          {open
            ? null
            : (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
              )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background shadow-xs"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(current => !current)}
        >
          {open
            ? <ChevronUpIcon />
            : <CodeIcon />}
          {open ? 'Hide Code' : 'View Code'}
        </Button>
      </div>
    </div>
  )
}
