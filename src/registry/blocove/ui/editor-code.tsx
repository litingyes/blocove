import type { CodeOptions } from '@tiptap/extension-code'
import type { Editor } from '@tiptap/react'
import type { ExtensionComponent } from '@/lib/editor-extension'
import { Code } from '@tiptap/extension-code'
import { useCurrentEditor, useEditorState } from '@tiptap/react'
import { CodeIcon } from 'lucide-react'
import { EditorToolbarButton } from '@/components/ui/editor'
import { defineExtensionComponent } from '@/lib/editor-extension'

/**
 * Registers the Tiptap inline Code mark.
 */
export const EditorCode: ExtensionComponent<Partial<CodeOptions>> = defineExtensionComponent(
  'code',
  (props: Partial<CodeOptions>) => [
    Code.configure(props),
  ],
)

export interface EditorCodeToolbarProps {
  className?: string
}

export function EditorCodeToolbar({ className }: EditorCodeToolbarProps) {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return <EditorCodeToolbarContent editor={editor} className={className} />
}

function EditorCodeToolbarContent({
  editor,
  className,
}: {
  editor: Editor
  className?: string
}) {
  const active = useEditorState({
    editor,
    selector: ({ editor: instance }) => instance.isActive('code'),
  })

  return (
    <EditorToolbarButton
      label="Inline code"
      shortcut="Mod E"
      pressed={active}
      onPressedChange={() => editor.chain().focus().toggleCode().run()}
      className={className}
    >
      <CodeIcon />
    </EditorToolbarButton>
  )
}
