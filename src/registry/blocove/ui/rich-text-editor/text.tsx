import { Text } from '@tiptap/extension-text'
import { defineExtensionComponent } from '@/lib/rich-text-editor-extension'

/**
 * Registers the Tiptap Text extension. Required by every editor document.
 */
export const EditorText = defineExtensionComponent('text', () => [Text])
