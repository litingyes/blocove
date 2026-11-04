import { DownloadIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { codeFileName, downloadTextFile } from '@/lib/download-file'

export interface DownloadButtonProps {
  code: string
  language: string
  title?: string
}

/**
 * Downloads the code a panel shows as a file next to the copy action.
 */
export function DownloadButton({ code, language, title }: DownloadButtonProps) {
  const fileName = codeFileName(title, language)

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={`Download ${fileName}`}
      onClick={() => downloadTextFile(fileName, code)}
    >
      <DownloadIcon />
    </Button>
  )
}
