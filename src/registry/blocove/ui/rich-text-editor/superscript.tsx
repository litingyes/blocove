import type { SuperscriptExtensionOptions } from '@tiptap/extension-superscript'
import type { Editor } from '@tiptap/react'
import type { ExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import { Superscript } from '@tiptap/extension-superscript'
import { useCurrentEditor, useEditorState } from '@tiptap/react'
import { SuperscriptIcon } from 'lucide-react'
import { EditorToolbarButton } from '@/components/blocove/rich-text-editor/editor'
import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'

/**
 * Registers the Tiptap Superscript mark.
 */
export const EditorSuperscript: ExtensionComponent<Partial<SuperscriptExtensionOptions>> = defineExtensionComponent(
  'superscript',
  (props: Partial<SuperscriptExtensionOptions>) => [
    Superscript.configure(props),
  ],
)

export interface EditorSuperscriptToolbarProps {
  className?: string
}

export function EditorSuperscriptToolbar({ className }: EditorSuperscriptToolbarProps) {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return <EditorSuperscriptToolbarContent editor={editor} className={className} />
}

function EditorSuperscriptToolbarContent({
  editor,
  className,
}: {
  editor: Editor
  className?: string
}) {
  const active = useEditorState({
    editor,
    selector: ({ editor: instance }) => instance.isActive('superscript'),
  })

  return (
    <EditorToolbarButton
      label="Superscript"
      shortcut="Mod ."
      pressed={active}
      onPressedChange={() => editor.chain().focus().toggleSuperscript().run()}
      className={className}
    >
      <SuperscriptIcon />
    </EditorToolbarButton>
  )
}
