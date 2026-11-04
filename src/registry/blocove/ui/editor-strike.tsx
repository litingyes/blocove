import type { StrikeOptions } from '@tiptap/extension-strike'
import type { Editor } from '@tiptap/react'
import type { ExtensionComponent } from '@/lib/editor-extension'
import { Strike } from '@tiptap/extension-strike'
import { useCurrentEditor, useEditorState } from '@tiptap/react'
import { StrikethroughIcon } from 'lucide-react'
import { EditorToolbarButton } from '@/components/ui/editor'
import { defineExtensionComponent } from '@/lib/editor-extension'

/**
 * Registers the Tiptap Strike mark.
 */
export const EditorStrike: ExtensionComponent<Partial<StrikeOptions>> = defineExtensionComponent(
  'strike',
  (props: Partial<StrikeOptions>) => [
    Strike.configure(props),
  ],
)

export interface EditorStrikeToolbarProps {
  className?: string
}

export function EditorStrikeToolbar({ className }: EditorStrikeToolbarProps) {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return <EditorStrikeToolbarContent editor={editor} className={className} />
}

function EditorStrikeToolbarContent({
  editor,
  className,
}: {
  editor: Editor
  className?: string
}) {
  const active = useEditorState({
    editor,
    selector: ({ editor: instance }) => instance.isActive('strike'),
  })

  return (
    <EditorToolbarButton
      label="Strikethrough"
      shortcut="Shift Mod S"
      pressed={active}
      onPressedChange={() => editor.chain().focus().toggleStrike().run()}
      className={className}
    >
      <StrikethroughIcon />
    </EditorToolbarButton>
  )
}
