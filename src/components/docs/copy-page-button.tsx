import { CheckIcon, CopyIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

/**
 * Copies the whole page as markdown for pasting into an LLM or a doc.
 */
export function CopyPageButton({ markdown }: { markdown: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return
    }

    const timeout = setTimeout(setCopied, 2000, false)
    return () => clearTimeout(timeout)
  }, [copied])

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        navigator.clipboard
          .writeText(markdown)
          .then(() => setCopied(true))
          .catch(() => {})
      }}
    >
      {copied
        ? <CheckIcon />
        : <CopyIcon />}
      {copied ? 'Copied' : 'Copy Page'}
    </Button>
  )
}
