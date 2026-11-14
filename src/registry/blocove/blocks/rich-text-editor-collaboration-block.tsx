import type * as Y from 'yjs'
import type { CollaborationProvider, CollaborationUser } from '@/components/blocove/rich-text-editor/collaboration'
import { cn } from 'cn'
import { EditorBold, EditorBoldToolbar } from '@/components/blocove/rich-text-editor/bold'
import { EditorCollaboration } from '@/components/blocove/rich-text-editor/collaboration'
import { EditorCollaborationCaret } from '@/components/blocove/rich-text-editor/collaboration-caret'
import {
  Editor,
  EditorCharacterCount,
  EditorContent,
  EditorToolbar,
} from '@/components/blocove/rich-text-editor/editor'
import { EditorHardBreak } from '@/components/blocove/rich-text-editor/hard-break'
import { EditorItalic, EditorItalicToolbar } from '@/components/blocove/rich-text-editor/italic'
import { EditorLink, EditorLinkToolbar } from '@/components/blocove/rich-text-editor/link'
import { EditorParagraph } from '@/components/blocove/rich-text-editor/paragraph'
import {
  EditorCollaborationStatus,
  EditorPresence,
} from '@/components/blocove/rich-text-editor/presence'
import { EditorText } from '@/components/blocove/rich-text-editor/text'

export interface RichTextEditorCollaborationBlockProps {
  /** The Yjs document every peer syncs into. */
  document: Y.Doc
  /** The connected provider: it carries the cursors, the presence list and the status. */
  provider: CollaborationProvider
  /** The current user advertised to the peers. */
  user: CollaborationUser
  /** Placeholder shown while the shared document is empty. */
  placeholder?: string
  /** Whether the shared document can be edited. Defaults to true. */
  editable?: boolean
  /**
   * Called with the HTML whenever the shared document changes. Remote edits
   * fire it too: every peer sees the same document.
   */
  onChange?: (html: string) => void
  /** How many presence avatars to show before the overflow counter. */
  presenceLimit?: number
  className?: string
}

/**
 * A ready-to-use collaborative editor: the text, paragraph and hard break
 * nodes, the marks most documents need, the cursors and the presence bar.
 *
 * The block owns no transport. Create the Yjs document and the provider in the
 * app, pass them in, and the block renders the shared document; the docs show
 * the Hocuspocus wiring. The shared document is the source of truth, so the
 * block takes no `value` or `defaultValue`: seed the Yjs document instead of
 * the React tree.
 */
export function RichTextEditorCollaborationBlock({
  document,
  provider,
  user,
  placeholder = 'Start writing together…',
  editable = true,
  onChange,
  presenceLimit,
  className,
}: RichTextEditorCollaborationBlockProps) {
  return (
    <Editor
      placeholder={placeholder}
      editable={editable}
      onChange={onChange}
      className={cn('w-full max-w-3xl', className)}
    >
      <EditorText />
      <EditorParagraph />
      <EditorHardBreak />

      <EditorBold />
      <EditorItalic />
      <EditorLink />

      <EditorCollaboration document={document} />
      <EditorCollaborationCaret provider={provider} user={user} />

      <div className="flex items-center justify-end px-3 pt-2">
        <EditorPresence provider={provider} max={presenceLimit} />
      </div>

      <EditorToolbar>
        <EditorBoldToolbar />
        <EditorItalicToolbar />
        <EditorLinkToolbar />
      </EditorToolbar>

      <EditorContent className="min-h-40" />

      <div className="flex items-center justify-between gap-3 border-t px-3 py-1.5">
        <EditorCollaborationStatus provider={provider} />
        <EditorCharacterCount className="border-t-0 px-0 py-0" />
      </div>
    </Editor>
  )
}
