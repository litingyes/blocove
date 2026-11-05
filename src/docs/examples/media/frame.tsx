import type { ReactNode } from 'react'
import { cn } from 'cn'

export interface MediaDemoFrameProps {
  className?: string
  children: ReactNode
}

/**
 * Shared preview shell for the media demos: one column, one width, so the
 * player previews line up across pages.
 */
export function MediaDemoFrame({ className, children }: MediaDemoFrameProps) {
  return (
    <div className={cn('flex w-full max-w-2xl flex-col gap-4', className)}>
      {children}
    </div>
  )
}
