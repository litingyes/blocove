import type { EmojiItem, EmojiOptions } from '@tiptap/extension-emoji'
import type { Editor } from '@tiptap/react'
import type { ExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import { emojis as defaultEmojis, Emoji } from '@tiptap/extension-emoji'
import { useCurrentEditor } from '@tiptap/react'
import { SmileIcon } from 'lucide-react'
import { useState } from 'react'
import { EditorToolbarButton } from '@/components/blocove/rich-text-editor/editor'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import { createSuggestionRenderer } from '@/lib/blocove/rich-text-editor-suggestion'

// The extension ships the insertion command and the trigger guard in its own
// default suggestion, so the configured one only adds the item list and the
// popup that renders it.
const defaultSuggestion = Emoji.options.suggestion

const toolbarPaletteSize = 120
const suggestionLimit = 12

function matchesQuery(item: EmojiItem, query: string) {
  const needle = query.toLowerCase()

  if (needle === '') {
    return true
  }

  return (
    item.name.toLowerCase().includes(needle)
    || item.shortcodes.some(shortcode => shortcode.toLowerCase().includes(needle))
    || item.tags.some(tag => tag.toLowerCase().includes(needle))
  )
}

export interface EditorEmojiProps extends Partial<Omit<EmojiOptions, 'suggestion'>> {
  /** Character that opens the picker while typing. */
  char?: string
  /** Accessible name of the picker and of the suggestion list. */
  ariaLabel?: string
}

/** An emoji item carrying the shape the shared suggestion list renders. */
interface EmojiSuggestionItem extends EmojiItem {
  id: string
  label: string
}

/**
 * The suggestion list renders `id` and `label`; the emoji command inserts the
 * whole item as node attributes, and ProseMirror drops the attributes the
 * emoji node does not declare.
 */
function toSuggestionItem(item: EmojiItem): EmojiSuggestionItem {
  return { ...item, id: item.name, label: item.name }
}

/**
 * Registers the Tiptap emoji node. Typing the trigger character opens the
 * suggestion list; the toolbar exposes the same data as a picker.
 */
export const EditorEmoji: ExtensionComponent<EditorEmojiProps> = defineExtensionComponent(
  'emoji',
  ({ char = ':', ariaLabel = 'Emoji', ...options }: EditorEmojiProps) => {
    const items = options.emojis ?? defaultEmojis

    return [
      Emoji.configure({
        ...options,
        emojis: items,
        suggestion: {
          ...defaultSuggestion,
          char,
          items: ({ query }: { query: string }) =>
            items
              .filter(item => matchesQuery(item, query))
              .slice(0, suggestionLimit)
              .map(toSuggestionItem),
          render: createSuggestionRenderer<EmojiSuggestionItem>({ ariaLabel }),
        },
      }),
    ]
  },
)

export interface EditorEmojiToolbarProps {
  className?: string
}

/**
 * Toolbar picker for the emoji node.
 */
export function EditorEmojiToolbar({ className }: EditorEmojiToolbarProps) {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return <EditorEmojiToolbarContent editor={editor} className={className} />
}

function EditorEmojiToolbarContent({
  editor,
  className,
}: {
  editor: Editor
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const storage = editor.storage.emoji as { emojis?: EmojiItem[] } | undefined
  const palette = (storage?.emojis ?? defaultEmojis).slice(0, toolbarPaletteSize)

  function insert(item: EmojiItem) {
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'emoji',
        attrs: { name: item.name },
      })
      .run()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* `EditorToolbarButton` does not forward the trigger props Base UI hands
          out, so the popup is anchored to a presentational wrapper. */}
      <PopoverTrigger
        nativeButton={false}
        render={<span className="inline-flex" role="presentation" tabIndex={-1} />}
      >
        <EditorToolbarButton label="Emoji" className={className}>
          <SmileIcon />
        </EditorToolbarButton>
      </PopoverTrigger>
      <PopoverContent aria-label="Emoji" align="start" className="w-auto p-2">
        <div className="grid max-h-56 grid-cols-8 gap-0.5 overflow-y-auto">
          {palette.map(item => (
            <button
              key={item.name}
              type="button"
              aria-label={item.name}
              className="flex size-7 items-center justify-center rounded text-base transition-colors hover:bg-accent"
              onClick={() => insert(item)}
            >
              {item.emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
