import type { ImageOptions } from '@tiptap/extension-image'
import type { Editor } from '@tiptap/react'
import type { FormEvent } from 'react'
import type { ExtensionComponent } from '@/lib/rich-text-editor-extension'
import { Image } from '@tiptap/extension-image'
import { useCurrentEditor, useEditorState } from '@tiptap/react'
import { cn } from 'cn'
import { ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { EditorToolbarButton } from '@/components/ui/rich-text-editor/editor'
import { defineExtensionComponent } from '@/lib/rich-text-editor-extension'

/**
 * Registers the Tiptap Image node. Options pass straight through to the
 * extension, e.g. `<EditorImage inline allowBase64 />`.
 */
export const EditorImage: ExtensionComponent<Partial<ImageOptions>> = defineExtensionComponent(
  'image',
  props => [
    Image.configure(props),
  ],
)

export interface EditorImageToolbarProps {
  className?: string
}

/**
 * Toolbar control for inserting an image by URL. Opening it while an image is
 * selected pre-fills the current source, so both insertion and replacement go
 * through the same input.
 */
export function EditorImageToolbar({ className }: EditorImageToolbarProps) {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return <EditorImageToolbarContent editor={editor} className={className} />
}

const protocolPattern = /^[a-z][\w+.-]*:/i

function normalizeImageUrl(value: string): string {
  const url = value.trim()

  if (url === '') {
    return ''
  }

  if (protocolPattern.test(url)) {
    return url
  }

  if (url.startsWith('//')) {
    return `https:${url}`
  }

  return `https://${url}`
}

function EditorImageToolbarContent({
  editor,
  className,
}: {
  editor: Editor
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const isActive = useEditorState({
    editor,
    selector: ({ editor: instance }) => instance.isActive('image'),
  })

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      const attributes = editor.getAttributes('image') as { src?: string }
      setUrl(attributes.src ?? '')
    }

    setOpen(nextOpen)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const src = normalizeImageUrl(url)

    if (src === '') {
      return
    }

    editor.chain().focus().setImage({ src }).run()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      {/*
        Base UI anchors the popup to the trigger element and needs its ref, so
        the trigger is a host element that renders the toolbar button inside it.
      */}
      <PopoverTrigger
        nativeButton={false}
        tabIndex={-1}
        render={<span className="inline-flex" />}
      >
        <EditorToolbarButton
          label="Image"
          className={cn(isActive && 'bg-muted text-foreground', className)}
        >
          <ImageIcon />
        </EditorToolbarButton>
      </PopoverTrigger>
      <PopoverContent
        finalFocus={() => {
          editor.chain().focus().run()
          return false
        }}
      >
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          <Input
            aria-label="Image URL"
            placeholder="https://example.com/image.png"
            value={url}
            onChange={event => setUrl(event.target.value)}
          />
          <Button type="submit" size="sm">
            Insert image
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}
