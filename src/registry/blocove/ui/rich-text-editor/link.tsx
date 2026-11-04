import type { LinkOptions } from '@tiptap/extension-link'
import type { Editor } from '@tiptap/react'
import type { ExtensionComponent } from '@/lib/rich-text-editor-extension'
import { Link } from '@tiptap/extension-link'
import { useCurrentEditor, useEditorState } from '@tiptap/react'
import { LinkIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { EditorToolbarButton } from '@/components/ui/rich-text-editor/editor'
import { defineExtensionComponent } from '@/lib/rich-text-editor-extension'

// Matches an explicit URL protocol: `https:`, `mailto:`, `tel:`, …
const protocolPattern = /^[a-z][\w+.-]*:/i

/**
 * Registers the Tiptap Link mark. Links do not open while editing and always
 * carry a safe `rel` attribute.
 */
export const EditorLink: ExtensionComponent<Partial<LinkOptions>> = defineExtensionComponent(
  'link',
  (props: Partial<LinkOptions>) => [
    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { rel: 'noopener noreferrer nofollow' },
      ...props,
    }),
  ],
)

/**
 * Adds an `https://` protocol to bare URLs. Explicit protocols such as
 * `mailto:` and `tel:` are kept as they are.
 */
function normalizeHref(href: string) {
  const trimmed = href.trim()

  if (trimmed === '' || protocolPattern.test(trimmed)) {
    return trimmed
  }

  return `https://${trimmed}`
}

export interface EditorLinkToolbarProps {
  className?: string
}

export function EditorLinkToolbar({ className }: EditorLinkToolbarProps) {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return <EditorLinkToolbarContent editor={editor} className={className} />
}

function EditorLinkToolbarContent({
  editor,
  className,
}: {
  editor: Editor
  className?: string
}) {
  const active = useEditorState({
    editor,
    selector: ({ editor: instance }) => instance.isActive('link'),
  })
  const [open, setOpen] = useState(false)
  const [href, setHref] = useState('')

  function closePopover() {
    setOpen(false)
    editor.chain().focus().run()
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      closePopover()
      return
    }

    const attributes = editor.getAttributes('link') as { href?: string }

    setHref(attributes.href ?? '')
    setOpen(true)
  }

  function applyLink() {
    const nextHref = normalizeHref(href)

    if (nextHref === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    }
    else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: nextHref }).run()
    }

    closePopover()
  }

  function removeLink() {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    closePopover()
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      {/* `EditorToolbarButton` does not forward the props Base UI hands to a
          trigger, so the popup is anchored to a presentational wrapper. The
          wrapper is not focusable: the toolbar button stays the only control. */}
      <PopoverTrigger
        nativeButton={false}
        render={<span className="inline-flex" role="presentation" tabIndex={-1} />}
      >
        <EditorToolbarButton label="Link" pressed={active} className={className}>
          <LinkIcon />
        </EditorToolbarButton>
      </PopoverTrigger>
      <PopoverContent
        aria-label="Link"
        align="start"
        // Focus is handed back to the editor by the close handler instead.
        finalFocus={false}
      >
        <Input
          aria-label="Link URL"
          placeholder="https://example.com"
          value={href}
          onChange={event => setHref(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              applyLink()
            }
          }}
        />
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeLink}
          >
            Remove
          </Button>
          <Button type="button" size="sm" onClick={applyLink}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
