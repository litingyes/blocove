import type { CodeBlockOptions } from '@tiptap/extension-code-block'
import type { Editor } from '@tiptap/react'
import { CodeBlock } from '@tiptap/extension-code-block'
import { useCurrentEditor, useEditorState } from '@tiptap/react'
import { SquareCodeIcon } from 'lucide-react'
import { EditorToolbarButton } from '@/components/ui/rich-text-editor/editor'
import { defineExtensionComponent } from '@/lib/rich-text-editor-extension'

export type EditorCodeBlockProps = Partial<CodeBlockOptions>

/**
 * Registers the Tiptap CodeBlock node.
 */
export const EditorCodeBlock = defineExtensionComponent<EditorCodeBlockProps>(
  'codeBlock',
  props => [
    CodeBlock.configure(props),
  ],
)

export interface EditorCodeBlockToolbarProps {
  className?: string
}

/**
 * Toolbar toggle for the code block node.
 */
export function EditorCodeBlockToolbar({
  className,
}: EditorCodeBlockToolbarProps) {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return (
    <EditorCodeBlockToolbarContent editor={editor} className={className} />
  )
}

function EditorCodeBlockToolbarContent({
  editor,
  className,
}: {
  editor: Editor
  className?: string
}) {
  const active = useEditorState({
    editor,
    selector: ({ editor: instance }) => instance.isActive('codeBlock'),
  })

  return (
    <EditorToolbarButton
      label="Code block"
      shortcut="Mod Alt C"
      pressed={active}
      onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
      className={className}
    >
      <SquareCodeIcon />
    </EditorToolbarButton>
  )
}
