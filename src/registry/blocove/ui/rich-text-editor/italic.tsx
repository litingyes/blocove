import type { ItalicOptions } from '@tiptap/extension-italic'
import type { Editor } from '@tiptap/react'
import type { ExtensionComponent } from '@/lib/rich-text-editor-extension'
import { Italic } from '@tiptap/extension-italic'
import { useCurrentEditor, useEditorState } from '@tiptap/react'
import { ItalicIcon } from 'lucide-react'
import { EditorToolbarButton } from '@/components/ui/rich-text-editor/editor'
import { defineExtensionComponent } from '@/lib/rich-text-editor-extension'

/**
 * Registers the Tiptap Italic mark.
 */
export const EditorItalic: ExtensionComponent<Partial<ItalicOptions>> = defineExtensionComponent(
  'italic',
  (props: Partial<ItalicOptions>) => [
    Italic.configure(props),
  ],
)

export interface EditorItalicToolbarProps {
  className?: string
}

export function EditorItalicToolbar({ className }: EditorItalicToolbarProps) {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return <EditorItalicToolbarContent editor={editor} className={className} />
}

function EditorItalicToolbarContent({
  editor,
  className,
}: {
  editor: Editor
  className?: string
}) {
  const active = useEditorState({
    editor,
    selector: ({ editor: instance }) => instance.isActive('italic'),
  })

  return (
    <EditorToolbarButton
      label="Italic"
      shortcut="Mod I"
      pressed={active}
      onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      className={className}
    >
      <ItalicIcon />
    </EditorToolbarButton>
  )
}
