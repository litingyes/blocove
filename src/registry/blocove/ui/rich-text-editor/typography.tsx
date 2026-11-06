import type { TypographyOptions } from '@tiptap/extension-typography'
import type { ExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import { Typography } from '@tiptap/extension-typography'
import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'

/**
 * Registers the Tiptap typography extension. The input rules rewrite dashes,
 * ellipses, quotes and other patterns as they are typed.
 */
export const EditorTypography: ExtensionComponent<Partial<TypographyOptions>> = defineExtensionComponent(
  'typography',
  props => [
    Typography.configure(props),
  ],
)
