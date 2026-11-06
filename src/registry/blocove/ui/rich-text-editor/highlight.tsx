import type { HighlightOptions } from '@tiptap/extension-highlight'
import type { Editor } from '@tiptap/react'
import type { ExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import { Highlight } from '@tiptap/extension-highlight'
import { useCurrentEditor, useEditorState } from '@tiptap/react'
import { HighlighterIcon } from 'lucide-react'
import { EditorToolbarButton } from '@/components/blocove/rich-text-editor/editor'
import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'

/**
 * Registers the Tiptap Highlight mark. Multiple colors are enabled so the
 * highlight can carry a color, while the toolbar uses the default one.
 */
export const EditorHighlight: ExtensionComponent<Partial<HighlightOptions>> = defineExtensionComponent(
  'highlight',
  (props: Partial<HighlightOptions>) => [
    Highlight.configure({
      multicolor: true,
      ...props,
    }),
  ],
)

export interface EditorHighlightToolbarProps {
  className?: string
}

export function EditorHighlightToolbar({ className }: EditorHighlightToolbarProps) {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return <EditorHighlightToolbarContent editor={editor} className={className} />
}

function EditorHighlightToolbarContent({
  editor,
  className,
}: {
  editor: Editor
  className?: string
}) {
  const active = useEditorState({
    editor,
    selector: ({ editor: instance }) => instance.isActive('highlight'),
  })

  return (
    <EditorToolbarButton
      label="Highlight"
      pressed={active}
      onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
      className={className}
    >
      <HighlighterIcon />
    </EditorToolbarButton>
  )
}
