import type { MentionNodeAttrs } from '@tiptap/extension-mention'
import type { ExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import { Mention } from '@tiptap/extension-mention'
import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import { createSuggestionRenderer } from '@/lib/blocove/rich-text-editor-suggestion'

export interface MentionUser {
  id: string
  label: string
}

const defaultUsers: MentionUser[] = [
  { id: 'ada', label: 'Ada Lovelace' },
  { id: 'alan', label: 'Alan Turing' },
  { id: 'grace', label: 'Grace Hopper' },
]

const suggestionLimit = 8

export interface EditorMentionProps {
  /** Records the suggestion list can insert. */
  users?: MentionUser[]
  /** Character that opens the suggestion list. */
  char?: string
  /** Accessible name of the suggestion list. */
  ariaLabel?: string
  /** HTML attributes applied to every mention node. */
  HTMLAttributes?: Record<string, string>
}

/**
 * Registers the Tiptap mention node. The suggestion list is built from the
 * `users` prop, so the item only exposes plain data.
 */
export const EditorMention: ExtensionComponent<EditorMentionProps> = defineExtensionComponent(
  'mention',
  ({
    users = defaultUsers,
    char = '@',
    ariaLabel = 'Mention',
    HTMLAttributes = {},
  }: EditorMentionProps) => [
    Mention.configure({
      HTMLAttributes,
      suggestion: {
        char,
        items: ({ query }: { query: string }) =>
          users
            .filter(user => user.label.toLowerCase().includes(query.toLowerCase()))
            .slice(0, suggestionLimit),
        render: createSuggestionRenderer({ ariaLabel }),
        command: ({ editor, range, props }) => {
          editor
            .chain()
            .focus()
            .insertContentAt(range, [
              { type: 'mention', attrs: props as MentionNodeAttrs },
              { type: 'text', text: ' ' },
            ])
            .run()
        },
      },
    }),
  ],
)
