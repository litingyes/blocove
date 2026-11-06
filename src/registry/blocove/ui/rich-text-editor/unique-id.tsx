import type { UniqueIDOptions } from '@tiptap/extension-unique-id'
import type { ExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import { UniqueID } from '@tiptap/extension-unique-id'
import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'

const defaultTypes: UniqueIDOptions['types'] = 'all'

/**
 * Registers the Tiptap unique id extension. Every block receives a stable
 * `data-id` attribute the first time the document is parsed, so blocks stay
 * addressable while the document is edited or synchronized.
 */
export const EditorUniqueId: ExtensionComponent<Partial<UniqueIDOptions>> = defineExtensionComponent(
  'unique-id',
  props => [
    UniqueID.configure({
      types: defaultTypes,
      ...props,
    }),
  ],
)
