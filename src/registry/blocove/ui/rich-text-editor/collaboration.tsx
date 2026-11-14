import type * as Y from 'yjs'
import type { ExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import { Collaboration } from '@tiptap/extension-collaboration'
import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'

/**
 * A collaborator advertised through the provider's awareness. The caret, the
 * presence bar and the cursor decorations all read this shape.
 */
export interface CollaborationUser {
  name: string
  /** Cursor and avatar colour, as a CSS colour. */
  color?: string
  /** Avatar image URL; initials are rendered without one. */
  avatar?: string
  [key: string]: unknown
}

/** The awareness instance a collaboration provider exposes. */
export interface CollaborationAwareness {
  clientID: number
  getStates: () => Map<number, Record<string, unknown>>
  on: (event: 'change' | 'update', handler: () => void) => void
  off: (event: 'change' | 'update', handler: () => void) => void
}

/**
 * The part of a collaboration provider the editor items read. It is structural
 * on purpose: Hocuspocus, a Tiptap Cloud provider or a local transport all fit,
 * and the items never import a provider package.
 */
export interface CollaborationProvider {
  awareness: CollaborationAwareness | null
  /** Current connection status, when the provider exposes one. */
  status?: string
  on?: (event: 'status', handler: (payload: { status?: string }) => void) => void
  off?: (event: 'status', handler: (payload: { status?: string }) => void) => void
}

export interface EditorCollaborationProps {
  /** The Yjs document every peer syncs into. Create one with `new Y.Doc()`. */
  document: Y.Doc
  /** The field inside the document. Defaults to `"default"`. */
  field?: string
}

/**
 * Binds the editor document to a Yjs document instead of an HTML string.
 *
 * The editor stops seeding its content from `value` or `defaultValue` once this
 * extension is declared: the shared document is the source of truth, and the
 * sync plugin owns the transactions that write to it.
 */
export const EditorCollaboration: ExtensionComponent<EditorCollaborationProps>
  = defineExtensionComponent('collaboration', ({ document, field }) => {
    if (!document) {
      throw new Error(
        '[blocove/rich-text-editor] EditorCollaboration requires the Yjs document every peer syncs into. Create one with `new Y.Doc()` and share it through your provider.',
      )
    }

    return [
      Collaboration.configure({
        document,
        field: field ?? 'default',
      }),
    ]
  })
