import type { DecorationAttrs } from '@tiptap/pm/view'
import type { CollaborationProvider, CollaborationUser } from '@/components/blocove/rich-text-editor/collaboration'
import type { ExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import { CollaborationCaret } from '@tiptap/extension-collaboration-caret'
import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'

const fallbackColor = '#3b82f6'

function caretColor(user: Record<string, unknown>) {
  return typeof user.color === 'string'
    ? user.color
    : fallbackColor
}

function caretName(user: Record<string, unknown>) {
  return typeof user.name === 'string' && user.name.trim()
    ? user.name
    : 'Anonymous'
}

/**
 * The default cursor: a coloured caret with the collaborator's name above it.
 * It is built with inline styles so it works without a stylesheet.
 */
export function renderCollaborationCaret(user: Record<string, unknown>) {
  const color = caretColor(user)
  const caret = document.createElement('span')
  caret.className = 'collaboration-carets__caret'
  caret.style.borderLeft = `2px solid ${color}`
  caret.style.marginLeft = '-1px'
  caret.style.marginRight = '-1px'
  caret.style.pointerEvents = 'none'
  caret.style.position = 'relative'
  caret.style.wordBreak = 'normal'

  const label = document.createElement('span')
  label.className = 'collaboration-carets__label'
  label.style.backgroundColor = color
  label.style.borderRadius = '3px'
  label.style.color = '#fff'
  label.style.fontSize = '11px'
  label.style.fontStyle = 'normal'
  label.style.fontWeight = '600'
  label.style.left = '-1px'
  label.style.lineHeight = 'normal'
  label.style.padding = '1px 4px'
  label.style.position = 'absolute'
  label.style.top = '-1.5em'
  label.style.userSelect = 'none'
  label.style.whiteSpace = 'nowrap'
  label.textContent = caretName(user)

  caret.append(label)

  return caret
}

/**
 * The default remotely selected range: the collaborator's colour at low
 * opacity, so the text stays readable under it.
 */
export function renderCollaborationSelection(
  user: Record<string, unknown>,
): DecorationAttrs {
  return {
    'nodeName': 'span',
    'class': 'collaboration-carets__selection',
    'style': `background-color: ${caretColor(user)}33`,
    'data-user': caretName(user),
  }
}

export interface EditorCollaborationCaretProps {
  /** The connected provider. Its awareness carries the cursors. */
  provider: CollaborationProvider
  /** The current user advertised to the peers. */
  user: CollaborationUser
  /** Replace the default cursor element. */
  render?: (user: Record<string, unknown>) => HTMLElement
  /** Replace the default selection decoration. */
  selectionRender?: (user: Record<string, unknown>) => DecorationAttrs
}

/**
 * Renders the cursors and selections of the other collaborators. The extension
 * publishes the local user through awareness, which is also what the presence
 * bar reads.
 */
export const EditorCollaborationCaret: ExtensionComponent<EditorCollaborationCaretProps>
  = defineExtensionComponent('collaboration-caret', ({ provider, user, render, selectionRender }) => {
    if (!provider) {
      throw new Error(
        '[blocove/rich-text-editor] EditorCollaborationCaret requires the provider that syncs the shared document.',
      )
    }

    if (!provider.awareness) {
      throw new Error(
        '[blocove/rich-text-editor] EditorCollaborationCaret requires awareness. Create the provider with awareness enabled before mounting the editor.',
      )
    }

    return [
      CollaborationCaret.configure({
        provider,
        user,
        render: render ?? renderCollaborationCaret,
        selectionRender: selectionRender ?? renderCollaborationSelection,
      }),
    ]
  })
