import type { SubscriptExtensionOptions } from '@tiptap/extension-subscript'
import type { Editor } from '@tiptap/react'
import type { ExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import { Subscript } from '@tiptap/extension-subscript'
import { useCurrentEditor, useEditorState } from '@tiptap/react'
import { SubscriptIcon } from 'lucide-react'
import { EditorToolbarButton } from '@/components/blocove/rich-text-editor/editor'
import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'

/**
 * Registers the Tiptap Subscript mark.
 */
export const EditorSubscript: ExtensionComponent<Partial<SubscriptExtensionOptions>> = defineExtensionComponent(
  'subscript',
  (props: Partial<SubscriptExtensionOptions>) => [
    Subscript.configure(props),
  ],
)

export interface EditorSubscriptToolbarProps {
  className?: string
}

export function EditorSubscriptToolbar({ className }: EditorSubscriptToolbarProps) {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return <EditorSubscriptToolbarContent editor={editor} className={className} />
}

function EditorSubscriptToolbarContent({
  editor,
  className,
}: {
  editor: Editor
  className?: string
}) {
  const active = useEditorState({
    editor,
    selector: ({ editor: instance }) => instance.isActive('subscript'),
  })

  return (
    <EditorToolbarButton
      label="Subscript"
      shortcut="Mod ,"
      pressed={active}
      onPressedChange={() => editor.chain().focus().toggleSubscript().run()}
      className={className}
    >
      <SubscriptIcon />
    </EditorToolbarButton>
  )
}
