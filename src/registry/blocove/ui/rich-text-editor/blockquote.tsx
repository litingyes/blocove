import type { BlockquoteOptions } from '@tiptap/extension-blockquote'
import type { Editor } from '@tiptap/react'
import type { ExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import { Blockquote } from '@tiptap/extension-blockquote'
import { useCurrentEditor, useEditorState } from '@tiptap/react'
import { TextQuoteIcon } from 'lucide-react'
import { EditorToolbarButton } from '@/components/blocove/rich-text-editor/editor'
import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'

/**
 * Registers the Tiptap blockquote node.
 */
export const EditorBlockquote: ExtensionComponent<Partial<BlockquoteOptions>> = defineExtensionComponent(
  'blockquote',
  props => [
    Blockquote.configure(props),
  ],
)

export interface EditorBlockquoteToolbarProps {
  className?: string
}

/**
 * Toolbar toggle for the blockquote node.
 */
export function EditorBlockquoteToolbar({
  className,
}: EditorBlockquoteToolbarProps) {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return <EditorBlockquoteToolbarContent editor={editor} className={className} />
}

function EditorBlockquoteToolbarContent({
  editor,
  className,
}: {
  editor: Editor
  className?: string
}) {
  const active = useEditorState({
    editor,
    selector: ({ editor: instance }) => instance.isActive('blockquote'),
  })

  return (
    <EditorToolbarButton
      label="Blockquote"
      pressed={active}
      onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
      className={className}
    >
      <TextQuoteIcon />
    </EditorToolbarButton>
  )
}
