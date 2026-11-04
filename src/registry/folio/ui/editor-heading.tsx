import type { Level } from '@tiptap/extension-heading'
import type { Editor } from '@tiptap/react'
import { Heading } from '@tiptap/extension-heading'
import { useCurrentEditor, useEditorState } from '@tiptap/react'
import { cn } from 'cn'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { defineExtensionComponent } from '@/lib/editor-extension'

const defaultLevels: Level[] = [1, 2, 3]

const paragraphValue = 'paragraph'

interface BlockTypeOption {
  label: string
  value: string
}

export interface EditorHeadingProps {
  /**
   * The heading levels registered with the node.
   * @default [1, 2, 3]
   */
  levels?: Level[]
}

/**
 * Registers the Tiptap Heading node.
 */
export const EditorHeading = defineExtensionComponent<EditorHeadingProps>(
  'heading',
  ({ levels = defaultLevels, ...options }) => [
    Heading.configure({ ...options, levels }),
  ],
)

export interface EditorHeadingToolbarProps {
  className?: string
}

/**
 * Toolbar selector for the current block type: a paragraph or one of the
 * registered heading levels.
 */
export function EditorHeadingToolbar({
  className,
}: EditorHeadingToolbarProps) {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return <EditorHeadingToolbarContent editor={editor} className={className} />
}

function EditorHeadingToolbarContent({
  editor,
  className,
}: {
  editor: Editor
  className?: string
}) {
  const levels = getHeadingLevels(editor)
  const hasParagraph = Boolean(editor.schema.nodes.paragraph)
  const state = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      activeLevel: getActiveHeadingLevel(instance, levels),
      paragraphActive: instance.isActive('paragraph'),
    }),
  })
  const options = getBlockTypeOptions(levels, hasParagraph)
  const value = resolveBlockTypeValue(state.activeLevel, state.paragraphActive)

  const handleValueChange = (nextValue: string | null) => {
    if (!nextValue) {
      return
    }

    if (nextValue === paragraphValue) {
      editor.chain().focus().setParagraph().run()
      return
    }

    const level = levels.find(candidate => String(candidate) === nextValue)

    if (level) {
      editor.chain().focus().setHeading({ level }).run()
    }
  }

  return (
    <Select value={value} onValueChange={handleValueChange} items={options}>
      <SelectTrigger
        size="sm"
        aria-label="Block type"
        className={cn('w-28', className)}
      >
        <SelectValue placeholder="Text" />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * Reads the levels actually registered by the Heading extension, so the
 * selector never offers a level the schema cannot create.
 */
function getHeadingLevels(editor: Editor): Level[] {
  const extension = editor.extensionManager.extensions.find(
    item => item.name === 'heading',
  )
  const levels = extension?.options.levels as Level[] | undefined

  return levels ?? []
}

/**
 * Builds the selector options: the paragraph block when the schema has one,
 * then every registered heading level.
 */
function getBlockTypeOptions(
  levels: Level[],
  hasParagraph: boolean,
): BlockTypeOption[] {
  const headingOptions = levels.map(level => ({
    label: `Heading ${level}`,
    value: String(level),
  }))

  if (!hasParagraph) {
    return headingOptions
  }

  return [
    { label: 'Paragraph', value: paragraphValue },
    ...headingOptions,
  ]
}

function getActiveHeadingLevel(editor: Editor, levels: Level[]): Level | null {
  return levels.find(level => editor.isActive('heading', { level })) ?? null
}

function resolveBlockTypeValue(
  activeLevel: Level | null,
  paragraphActive: boolean,
): string | null {
  if (activeLevel !== null) {
    return String(activeLevel)
  }

  return paragraphActive ? paragraphValue : null
}
