import type { ReactNode } from 'react'
import { cn } from 'cn'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
 * Demo card with Preview and Code tabs. The preview panel stays mounted so a
 * demo keeps its state while the code is open; the code panel is unmounted so
 * the highlighter only works while it is visible.
 */
export function ComponentPreview({
  title,
  code,
  language = 'tsx',
  children,
  className,
  previewClassName,
}: ComponentPreviewProps) {
  return (
    <div
      data-slot="component-preview"
      className={cn('overflow-hidden rounded-xl border', className)}
    >
      <Tabs defaultValue="preview" className="gap-0">
        <div className="border-b px-2 py-1.5">
          <TabsList variant="line">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="preview" keepMounted>
          <div
            className={cn(
              'grid min-h-[350px] place-items-center p-6 sm:p-10',
              previewClassName,
            )}
          >
            {children}
          </div>
        </TabsContent>

        <TabsContent value="code">
          <CodePanel
            code={code}
            language={language}
            title={title}
            className="rounded-none border-none"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
