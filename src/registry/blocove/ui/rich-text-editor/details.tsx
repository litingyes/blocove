import type { DetailsOptions } from '@tiptap/extension-details'
import type { Editor, ReactNodeViewProps } from '@tiptap/react'
import type { ExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details'
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  useCurrentEditor,
  useEditorState,
} from '@tiptap/react'
import { cn } from 'cn'
import { ChevronRightIcon, ListCollapseIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { EditorToolbarButton } from '@/components/blocove/rich-text-editor/editor'
import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'

export type EditorDetailsProps = Partial<DetailsOptions>

function DetailsNodeView({
  editor,
  getPos,
  node,
  updateAttributes,
}: ReactNodeViewProps<HTMLDivElement>) {
  const open = Boolean(node.attrs.open)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const content = wrapperRef.current?.querySelector<HTMLElement>(
      '[data-type="detailsContent"]',
    )

    content?.toggleAttribute('hidden', !open)
  }, [open])

  return (
    <NodeViewWrapper
      ref={wrapperRef}
      data-type="details"
      className={cn(
        'flex w-full items-start gap-2 rounded-lg border bg-muted/20 px-2 py-2',
        '[&_summary]:min-h-6 [&_summary]:list-none [&_summary]:pr-1',
        '[&_summary]:leading-6 [&_summary]:font-medium [&_summary]:outline-none',
        '[&_summary::-webkit-details-marker]:hidden',
        open
          ? '[&_[data-type=detailsContent]]:mt-2 [&_[data-type=detailsContent]]:border-t [&_[data-type=detailsContent]]:pt-2'
          : '[&_[data-type=detailsContent]]:hidden',
      )}
    >
      <button
        type="button"
        contentEditable={false}
        aria-expanded={open}
        aria-label={open ? 'Collapse details' : 'Expand details'}
        data-slot="editor-details-toggle"
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        onClick={() => {
          if (!editor.isEditable || typeof getPos() !== 'number') {
            return
          }

          updateAttributes({ open: !open })
        }}
        onMouseDown={event => event.preventDefault()}
      >
        <ChevronRightIcon
          className={cn(
            'size-4 transition-transform duration-150 motion-reduce:transition-none',
            open && 'rotate-90',
          )}
        />
      </button>
      <NodeViewContent
        as="div"
        className="min-w-0 flex-1 [&_[data-type=detailsContent]]:pb-1"
      />
    </NodeViewWrapper>
  )
}

const ExtendedDetails = Details.extend({
  addNodeView: () => ReactNodeViewRenderer(DetailsNodeView),
})

/**
 * Registers collapsible Details blocks made of a summary and editable content.
 */
export const EditorDetails: ExtensionComponent<EditorDetailsProps>
  = defineExtensionComponent(
    'details',
    props => [
      ExtendedDetails.configure({ persist: true, ...props }),
      DetailsSummary,
      DetailsContent,
    ],
  )

export interface EditorDetailsToolbarProps {
  className?: string
}

export function EditorDetailsToolbar({
  className,
}: EditorDetailsToolbarProps) {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return <EditorDetailsToolbarContent editor={editor} className={className} />
}

function EditorDetailsToolbarContent({
  editor,
  className,
}: {
  editor: Editor
  className?: string
}) {
  const canSetDetails = useEditorState({
    editor,
    selector: ({ editor: instance }) => instance.can().setDetails(),
  })

  return (
    <EditorToolbarButton
      label="Details"
      onClick={() => editor.chain().focus().setDetails().run()}
      disabled={!canSetDetails}
      className={className}
    >
      <ListCollapseIcon />
    </EditorToolbarButton>
  )
}
