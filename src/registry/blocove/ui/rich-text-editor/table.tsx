import type { TableKitOptions } from '@tiptap/extension-table'
import type { Editor } from '@tiptap/react'
import type { ReactNode } from 'react'
import type { ExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import { TableKit } from '@tiptap/extension-table'
import { useCurrentEditor, useEditorState } from '@tiptap/react'
import { cn } from 'cn'
import {
  ArrowDownToLineIcon,
  ArrowLeftToLineIcon,
  ArrowRightToLineIcon,
  ArrowUpToLineIcon,
  Grid3x3Icon,
  TableIcon,
  Trash2Icon,
} from 'lucide-react'
import { useState } from 'react'
import { EditorToolbarButton } from '@/components/blocove/rich-text-editor/editor'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'

/**
 * Registers the Tiptap table node family through the table kit. Options pass
 * straight through to the kit, e.g. `<EditorTable table={{ resizable: true }} />`.
 */
export const EditorTable: ExtensionComponent<Partial<TableKitOptions>> = defineExtensionComponent(
  'table',
  props => [
    TableKit.configure(props),
  ],
)

export interface EditorTableToolbarProps {
  className?: string
}

/**
 * Toolbar control for tables. The popover groups every table command and
 * disables the ones that cannot run for the current selection.
 */
export function EditorTableToolbar({ className }: EditorTableToolbarProps) {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return <EditorTableToolbarContent editor={editor} className={className} />
}

const insertTableOptions = { rows: 3, cols: 3, withHeaderRow: true }

function EditorTableToolbarContent({
  editor,
  className,
}: {
  editor: Editor
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const state = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      inTable: instance.isActive('table'),
      canInsertTable: instance.can().insertTable(insertTableOptions),
      canAddRowBefore: instance.can().addRowBefore(),
      canAddRowAfter: instance.can().addRowAfter(),
      canDeleteRow: instance.can().deleteRow(),
      canAddColumnBefore: instance.can().addColumnBefore(),
      canAddColumnAfter: instance.can().addColumnAfter(),
      canDeleteColumn: instance.can().deleteColumn(),
      canDeleteTable: instance.can().deleteTable(),
    }),
  })

  const run = (command: () => boolean) => () => {
    command()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/*
        Base UI anchors the popup to the trigger element and needs its ref, so
        the trigger is a host element that renders the toolbar button inside it.
      */}
      <PopoverTrigger
        nativeButton={false}
        tabIndex={-1}
        render={<span className="inline-flex" />}
      >
        <EditorToolbarButton
          label="Table"
          className={cn(state.inTable && 'bg-muted text-foreground', className)}
        >
          <TableIcon />
        </EditorToolbarButton>
      </PopoverTrigger>
      <PopoverContent
        className="gap-1 p-1.5"
        finalFocus={() => {
          editor.chain().focus().run()
          return false
        }}
      >
        <div className="grid grid-cols-2 gap-1">
          <TableToolbarAction
            label="Insert 3×3 table"
            disabled={!state.canInsertTable}
            className="col-span-2"
            onClick={run(() =>
              editor.chain().focus().insertTable(insertTableOptions).run())}
          >
            <Grid3x3Icon />
          </TableToolbarAction>
          <TableToolbarAction
            label="Row above"
            disabled={!state.canAddRowBefore}
            onClick={run(() => editor.chain().focus().addRowBefore().run())}
          >
            <ArrowUpToLineIcon />
          </TableToolbarAction>
          <TableToolbarAction
            label="Row below"
            disabled={!state.canAddRowAfter}
            onClick={run(() => editor.chain().focus().addRowAfter().run())}
          >
            <ArrowDownToLineIcon />
          </TableToolbarAction>
          <TableToolbarAction
            label="Column left"
            disabled={!state.canAddColumnBefore}
            onClick={run(() => editor.chain().focus().addColumnBefore().run())}
          >
            <ArrowLeftToLineIcon />
          </TableToolbarAction>
          <TableToolbarAction
            label="Column right"
            disabled={!state.canAddColumnAfter}
            onClick={run(() => editor.chain().focus().addColumnAfter().run())}
          >
            <ArrowRightToLineIcon />
          </TableToolbarAction>
          <TableToolbarAction
            label="Delete row"
            disabled={!state.canDeleteRow}
            onClick={run(() => editor.chain().focus().deleteRow().run())}
          >
            <Trash2Icon />
          </TableToolbarAction>
          <TableToolbarAction
            label="Delete column"
            disabled={!state.canDeleteColumn}
            onClick={run(() => editor.chain().focus().deleteColumn().run())}
          >
            <Trash2Icon />
          </TableToolbarAction>
          <TableToolbarAction
            label="Delete table"
            variant="destructive"
            disabled={!state.canDeleteTable}
            className="col-span-2"
            onClick={run(() => editor.chain().focus().deleteTable().run())}
          >
            <Trash2Icon />
          </TableToolbarAction>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function TableToolbarAction({
  label,
  variant = 'ghost',
  disabled,
  className,
  onClick,
  children,
}: {
  label: string
  variant?: 'ghost' | 'destructive'
  disabled: boolean
  className?: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn('justify-start', className)}
    >
      {children}
      {label}
    </Button>
  )
}
