import type { Editor } from '@tiptap/react'
import type { ExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import { RubyText } from '@tiptap/extension-ruby-text'
import { useCurrentEditor, useEditorState } from '@tiptap/react'
import { LanguagesIcon } from 'lucide-react'
import { useState } from 'react'
import { EditorToolbarButton } from '@/components/blocove/rich-text-editor/editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'

/**
 * Registers the Tiptap RubyText mark. The annotation is rendered inside an
 * `rt` element above the selected base text.
 */
export const EditorRuby: ExtensionComponent = defineExtensionComponent(
  'ruby',
  () => [RubyText],
)

export interface EditorRubyToolbarProps {
  className?: string
}

export function EditorRubyToolbar({ className }: EditorRubyToolbarProps) {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return <EditorRubyToolbarContent editor={editor} className={className} />
}

function EditorRubyToolbarContent({
  editor,
  className,
}: {
  editor: Editor
  className?: string
}) {
  const active = useEditorState({
    editor,
    selector: ({ editor: instance }) => instance.isActive('rubyText'),
  })
  const [open, setOpen] = useState(false)
  const [ruby, setRuby] = useState('')

  function closePopover() {
    setOpen(false)
    editor.chain().focus().run()
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      closePopover()
      return
    }

    const attributes = editor.getAttributes('rubyText') as { rt?: string | null }

    setRuby(attributes.rt ?? '')
    setOpen(true)
  }

  function applyRuby() {
    const annotation = ruby.trim()

    if (annotation === '') {
      editor.chain().focus().unsetRubyText().run()
    }
    else {
      editor.chain().focus().setRubyText({ rt: annotation }).run()
    }

    closePopover()
  }

  function removeRuby() {
    editor.chain().focus().unsetRubyText().run()
    closePopover()
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      {/* `EditorToolbarButton` does not forward the props Base UI hands to a
          trigger, so the popup is anchored to a presentational wrapper. */}
      <PopoverTrigger
        nativeButton={false}
        render={<span className="inline-flex" role="presentation" tabIndex={-1} />}
      >
        <EditorToolbarButton label="Ruby" pressed={active} className={className}>
          <LanguagesIcon />
        </EditorToolbarButton>
      </PopoverTrigger>
      <PopoverContent
        aria-label="Ruby"
        align="start"
        // Focus is handed back to the editor by the close handler instead.
        finalFocus={false}
      >
        <Input
          aria-label="Ruby annotation"
          placeholder="かんじ"
          value={ruby}
          onChange={event => setRuby(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              applyRuby()
            }
          }}
        />
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeRuby}
          >
            Remove
          </Button>
          <Button type="button" size="sm" onClick={applyRuby}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
