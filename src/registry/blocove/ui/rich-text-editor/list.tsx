import type { Editor } from '@tiptap/react'
import type { ExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import {
  BulletList,
  ListItem,
  ListKeymap,
  OrderedList,
  TaskItem,
  TaskList,
} from '@tiptap/extension-list'
import { useCurrentEditor, useEditorState } from '@tiptap/react'
import { cn } from 'cn'
import { ListIcon, ListOrderedIcon, ListTodoIcon } from 'lucide-react'
import { EditorToolbarButton } from '@/components/blocove/rich-text-editor/editor'
import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'

/**
 * Registers the bullet list node. A list is only valid together with its item
 * node and the list keymap, so the item ships all three.
 */
export const EditorBulletList: ExtensionComponent = defineExtensionComponent(
  'bullet-list',
  () => [BulletList, ListItem, ListKeymap],
)

/**
 * Registers the ordered list node.
 */
export const EditorOrderedList: ExtensionComponent = defineExtensionComponent(
  'ordered-list',
  () => [OrderedList, ListItem, ListKeymap],
)

/**
 * Registers the task list node. The `contains-task-list` and `task-list-item`
 * classes are what the typeset stylesheet targets, so the checkboxes and the
 * list markers line up with the rest of the typography.
 */
export const EditorTaskList: ExtensionComponent = defineExtensionComponent(
  'task-list',
  () => [
    TaskList.configure({
      HTMLAttributes: { class: 'contains-task-list' },
    }),
    TaskItem.configure({
      nested: true,
      HTMLAttributes: { class: 'task-list-item' },
    }),
    ListKeymap,
  ],
)

export interface EditorListToolbarProps {
  className?: string
}

/**
 * Toolbar controls for the three list kinds.
 */
export function EditorListToolbar({ className }: EditorListToolbarProps) {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return <EditorListToolbarContent editor={editor} className={className} />
}

function EditorListToolbarContent({
  editor,
  className,
}: {
  editor: Editor
  className?: string
}) {
  const state = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      bulletList: instance.isActive('bulletList'),
      orderedList: instance.isActive('orderedList'),
      taskList: instance.isActive('taskList'),
    }),
  })

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      <EditorToolbarButton
        label="Bullet list"
        pressed={state.bulletList}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        <ListIcon />
      </EditorToolbarButton>
      <EditorToolbarButton
        label="Ordered list"
        pressed={state.orderedList}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrderedIcon />
      </EditorToolbarButton>
      <EditorToolbarButton
        label="Task list"
        pressed={state.taskList}
        onPressedChange={() => editor.chain().focus().toggleTaskList().run()}
      >
        <ListTodoIcon />
      </EditorToolbarButton>
    </div>
  )
}
