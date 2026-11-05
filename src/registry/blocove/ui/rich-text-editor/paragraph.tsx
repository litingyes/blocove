import type { ParagraphOptions } from '@tiptap/extension-paragraph'
import { Paragraph } from '@tiptap/extension-paragraph'
import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'

export type EditorParagraphProps = Partial<ParagraphOptions>

/**
 * Registers the Tiptap Paragraph node. Every editor needs at least one text
 * block, so the paragraph is the default block for most documents.
 */
export const EditorParagraph = defineExtensionComponent<EditorParagraphProps>(
  'paragraph',
  props => [
    Paragraph.configure(props),
  ],
)
