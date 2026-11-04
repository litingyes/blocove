import type { HardBreakOptions } from '@tiptap/extension-hard-break'
import { HardBreak } from '@tiptap/extension-hard-break'
import { defineExtensionComponent } from '@/lib/rich-text-editor-extension'

export type EditorHardBreakProps = Partial<HardBreakOptions>

/**
 * Registers the Tiptap HardBreak node, the line break inserted with
 * Shift + Enter.
 */
export const EditorHardBreak = defineExtensionComponent<EditorHardBreakProps>(
  'hardBreak',
  props => [
    HardBreak.configure(props),
  ],
)
