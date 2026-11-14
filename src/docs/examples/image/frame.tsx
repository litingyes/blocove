import type { ReactNode } from 'react'
import { cn } from 'cn'

export interface ImageDemoFrameProps {
  className?: string
  children: ReactNode
}

/**
 * Shared preview shell for the image demos: one column and a bounded width, so
 * the viewer previews line up across pages.
 */
export function ImageDemoFrame({ className, children }: ImageDemoFrameProps) {
  return (
    <div className={cn('flex w-full max-w-2xl flex-col gap-4', className)}>
      {children}
    </div>
  )
}
