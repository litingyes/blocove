import type { Editor } from '@tiptap/react'
import type { ExtensionComponent } from '@/lib/editor-extension'
import { Bold } from '@tiptap/extension-bold'
import { useCurrentEditor, useEditorState } from '@tiptap/react'
import { BoldIcon } from 'lucide-react'
import { EditorToolbarButton } from '@/components/ui/editor'
import { defineExtensionComponent } from '@/lib/editor-extension'

/**
 * Registers the Tiptap Bold mark.
 */
export const EditorBold: ExtensionComponent = defineExtensionComponent(
  'bold',
  () => [Bold],
)

export interface EditorBoldToolbarProps {
  className?: string
}

export function EditorBoldToolbar({ className }: EditorBoldToolbarProps) {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return <EditorBoldToolbarContent editor={editor} className={className} />
}

function EditorBoldToolbarContent({
  editor,
  className,
}: {
  editor: Editor
  className?: string
}) {
  const active = useEditorState({
    editor,
    selector: ({ editor: instance }) => instance.isActive('bold'),
  })

  return (
    <EditorToolbarButton
      label="Bold"
      shortcut="Mod B"
      pressed={active}
      onPressedChange={() => editor.chain().focus().toggleBold().run()}
      className={className}
    >
      <BoldIcon />
    </EditorToolbarButton>
  )
}
