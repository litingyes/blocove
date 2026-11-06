import type { ExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import { Focus, Gapcursor, TrailingNode } from '@tiptap/extensions'
import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'

export interface EditorFocusProps {
  /**
   * The class name added to the focused node.
   * @default 'has-focus'
   */
  className?: string
  /**
   * The mode by which the focused node is determined.
   * @default 'all'
   */
  mode?: 'all' | 'deepest' | 'shallowest'
}

/**
 * Registers the Tiptap focus extension. The focused node receives a class, so
 * the focus ring can be styled from the document stylesheet.
 */
export const EditorFocus: ExtensionComponent<EditorFocusProps> = defineExtensionComponent(
  'focus',
  props => [
    Focus.configure(props),
  ],
)

/**
 * Registers the Tiptap gap cursor extension. The gap cursor lets the caret sit
 * between two blocks, where a regular text cursor cannot go.
 */
export const EditorGapcursor: ExtensionComponent = defineExtensionComponent(
  'gap-cursor',
  () => [Gapcursor],
)

/**
 * Registers the Tiptap trailing node extension. An empty block is kept at the
 * end of the document, so there is always somewhere to keep writing.
 */
export const EditorTrailingNode: ExtensionComponent = defineExtensionComponent(
  'trailing-node',
  () => [TrailingNode],
)
