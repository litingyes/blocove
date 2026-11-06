import type { InvisibleCharactersOptions } from '@tiptap/extension-invisible-characters'
import type { Editor } from '@tiptap/react'
import type { ExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import { InvisibleCharacters } from '@tiptap/extension-invisible-characters'
import { useCurrentEditor, useEditorState } from '@tiptap/react'
import { PilcrowIcon } from 'lucide-react'
import { EditorToolbarButton } from '@/components/blocove/rich-text-editor/editor'
import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'

/**
 * Registers the Tiptap invisible characters extension. Spaces, paragraph marks
 * and hard breaks are rendered through decorations, so they never enter the
 * document itself.
 */
export const EditorInvisibleCharacters: ExtensionComponent<Partial<InvisibleCharactersOptions>> = defineExtensionComponent(
  'invisible-characters',
  props => [
    InvisibleCharacters.configure(props),
  ],
)

export interface EditorInvisibleCharactersToolbarProps {
  className?: string
}

/**
 * Toolbar toggle for the invisible characters.
 */
export function EditorInvisibleCharactersToolbar({
  className,
}: EditorInvisibleCharactersToolbarProps) {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return <EditorInvisibleCharactersToolbarContent editor={editor} className={className} />
}

function EditorInvisibleCharactersToolbarContent({
  editor,
  className,
}: {
  editor: Editor
  className?: string
}) {
  const visible = useEditorState({
    editor,
    selector: ({ editor: instance }) => {
      const storage = instance.storage.invisibleCharacters as {
        visibility: () => boolean
      }

      return storage.visibility()
    },
  })

  return (
    <EditorToolbarButton
      label="Invisible characters"
      pressed={visible}
      onPressedChange={(next) => {
        if (next) {
          editor.chain().focus().showInvisibleCharacters().run()
          return
        }

        editor.chain().focus().hideInvisibleCharacters().run()
      }}
      className={className}
    >
      <PilcrowIcon />
    </EditorToolbarButton>
  )
}
