import type { ComponentProps } from 'react'
import { CheckIcon, CopyIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export type CopyButtonProps = Omit<
  ComponentProps<typeof Button>,
  'children' | 'onClick'
> & {
  value: string
  label: string
}

/**
 * Icon button that copies a string to the clipboard and confirms it briefly.
 */
export function CopyButton({ value, label, ...props }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return
    }

    const timeout = setTimeout(setCopied, 2000, false)
    return () => clearTimeout(timeout)
  }, [copied])

  return (
    <>
      <Button
        type="button"
        aria-label={copied ? 'Copied' : label}
        data-copied={copied || undefined}
        onClick={() => {
          navigator.clipboard
            .writeText(value)
            .then(() => setCopied(true))
            .catch(() => {})
        }}
        {...props}
      >
        {copied
          ? <CheckIcon />
          : <CopyIcon />}
      </Button>
      <span aria-live="polite" className="sr-only">
        {copied ? 'Copied' : ''}
      </span>
    </>
  )
}
