import type { UnderlineOptions } from '@tiptap/extension-underline'
import type { Editor } from '@tiptap/react'
import type { ExtensionComponent } from '@/lib/rich-text-editor-extension'
import { Underline } from '@tiptap/extension-underline'
import { useCurrentEditor, useEditorState } from '@tiptap/react'
import { UnderlineIcon } from 'lucide-react'
import { EditorToolbarButton } from '@/components/ui/rich-text-editor/editor'
import { defineExtensionComponent } from '@/lib/rich-text-editor-extension'

/**
 * Registers the Tiptap Underline mark.
 */
export const EditorUnderline: ExtensionComponent<Partial<UnderlineOptions>> = defineExtensionComponent(
  'underline',
  (props: Partial<UnderlineOptions>) => [
    Underline.configure(props),
  ],
)

export interface EditorUnderlineToolbarProps {
  className?: string
}

export function EditorUnderlineToolbar({ className }: EditorUnderlineToolbarProps) {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return <EditorUnderlineToolbarContent editor={editor} className={className} />
}

function EditorUnderlineToolbarContent({
  editor,
  className,
}: {
  editor: Editor
  className?: string
}) {
  const active = useEditorState({
    editor,
    selector: ({ editor: instance }) => instance.isActive('underline'),
  })

  return (
    <EditorToolbarButton
      label="Underline"
      shortcut="Mod U"
      pressed={active}
      onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
      className={className}
    >
      <UnderlineIcon />
    </EditorToolbarButton>
  )
}
