import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  FileTextIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface CopyPageMenuProps {
  /** The page as markdown, copied by the primary action. */
  markdown: string
  /** URL of the raw markdown page, opened by "View as Markdown". */
  href: string
}

/**
 * Copy Page split button: copies the whole page as markdown for pasting into an
 * LLM or a doc, and links to the raw `.md` version of the page.
 */
export function CopyPageMenu({ markdown, href }: CopyPageMenuProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return
    }

    const timeout = setTimeout(setCopied, 2000, false)
    return () => clearTimeout(timeout)
  }, [copied])

  return (
    <ButtonGroup>
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
      <DropdownMenu>
        <DropdownMenuTrigger
          render={(
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="More page actions"
            />
          )}
        >
          <ChevronDownIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 min-w-52">
          <DropdownMenuItem
            render={(
              <a href={href} target="_blank" rel="noreferrer" />
            )}
          >
            <FileTextIcon />
            View as Markdown
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  )
}
