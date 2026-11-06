import { DragHandle } from '@tiptap/extension-drag-handle-react'
import { useCurrentEditor } from '@tiptap/react'
import { cn } from 'cn'
import { GripVerticalIcon } from 'lucide-react'

export interface EditorDragHandleProps {
  className?: string
}

/**
 * Drag handle for block reordering. It is a floating control rather than a
 * Tiptap extension: render it anywhere inside the editor and the plugin it
 * mounts follows the block under the pointer.
 *
 * Nested blocks are draggable too, so list items and quoted blocks can be moved
 * without moving their container.
 */
export function EditorDragHandle({ className }: EditorDragHandleProps) {
  const { editor } = useCurrentEditor()

  if (!editor || !editor.isEditable) {
    return null
  }

  return (
    <DragHandle
      editor={editor}
      nested
      className={cn(
        'flex size-6 cursor-grab items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:cursor-grabbing',
        className,
      )}
    >
      <GripVerticalIcon className="size-4" />
    </DragHandle>
  )
}
