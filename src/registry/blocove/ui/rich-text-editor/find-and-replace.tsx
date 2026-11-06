import type { FindAndReplaceOptions } from '@tiptap/extension-find-and-replace'
import type { Editor } from '@tiptap/react'
import type { ExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import { FindAndReplace } from '@tiptap/extension-find-and-replace'
import { useCurrentEditor, useEditorState } from '@tiptap/react'
import { SearchIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { EditorToolbarButton } from '@/components/blocove/rich-text-editor/editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'

/**
 * Registers the find and replace extension. Every search and replace action is
 * a command, so the toolbar below is only one way to drive it.
 */
export const EditorFindAndReplace: ExtensionComponent<Partial<FindAndReplaceOptions>> = defineExtensionComponent(
  'find-and-replace',
  props => [
    FindAndReplace.configure(props),
  ],
)

export interface EditorFindAndReplaceToolbarProps {
  className?: string
}

/**
 * Toolbar control for searching and replacing inside the document.
 */
export function EditorFindAndReplaceToolbar({
  className,
}: EditorFindAndReplaceToolbarProps) {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return <EditorFindAndReplaceToolbarContent editor={editor} className={className} />
}

interface FindAndReplaceStorage {
  results: unknown[]
  currentIndex: number | null
  caseSensitive: boolean
  useRegex: boolean
  wholeWord: boolean
}

function EditorFindAndReplaceToolbarContent({
  editor,
  className,
}: {
  editor: Editor
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [replacement, setReplacement] = useState('')
  // An input method composes text before it commits it, so searching on every
  // intermediate value would move the highlights while the user is still
  // choosing a character.
  const composingRef = useRef(false)
  const state = useEditorState({
    editor,
    selector: ({ editor: instance }) => {
      const storage = instance.storage.findAndReplace as FindAndReplaceStorage

      return {
        matches: storage.results.length,
        current: storage.currentIndex === null
          ? 0
          : storage.currentIndex + 1,
      }
    },
  })

  function searchFor(value: string) {
    if (composingRef.current) {
      return
    }

    editor.commands.setSearchTerm(value)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* `EditorToolbarButton` does not forward the trigger props Base UI hands
          out, so the popup is anchored to a presentational wrapper. */}
      <PopoverTrigger
        nativeButton={false}
        render={<span className="inline-flex" role="presentation" tabIndex={-1} />}
      >
        <EditorToolbarButton label="Find and replace" className={className}>
          <SearchIcon />
        </EditorToolbarButton>
      </PopoverTrigger>
      <PopoverContent aria-label="Find and replace" align="start" className="w-80">
        <div className="flex flex-col gap-2">
          <Input
            aria-label="Find"
            placeholder="Find"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              searchFor(event.target.value)
            }}
            onCompositionStart={() => {
              composingRef.current = true
            }}
            onCompositionEnd={(event) => {
              composingRef.current = false
              searchFor(event.currentTarget.value)
            }}
          />
          <Input
            aria-label="Replace with"
            placeholder="Replace with"
            value={replacement}
            onChange={(event) => {
              setReplacement(event.target.value)
              editor.commands.setReplaceTerm(event.target.value)
            }}
          />
          <p aria-live="polite" className="text-xs text-muted-foreground">
            {state.matches === 0
              ? 'No results'
              : `${state.current} of ${state.matches}`}
          </p>
          <div className="flex flex-wrap items-center justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.commands.goToPreviousResult()}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.commands.goToNextResult()}
            >
              Next
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => editor.commands.replace()}
            >
              Replace
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => editor.commands.replaceAll()}
            >
              Replace all
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <Button type="button" variant="ghost" size="sm" aria-label="Match case" onClick={() => editor.commands.setCaseSensitive(!(editor.storage.findAndReplace as FindAndReplaceStorage).caseSensitive)}>
                Aa
              </Button>
              <Button type="button" variant="ghost" size="sm" aria-label="Use regular expression" onClick={() => editor.commands.setUseRegex(!(editor.storage.findAndReplace as FindAndReplaceStorage).useRegex)}>
                .*
              </Button>
              <Button type="button" variant="ghost" size="sm" aria-label="Match whole word" onClick={() => editor.commands.setWholeWord(!(editor.storage.findAndReplace as FindAndReplaceStorage).wholeWord)}>
                Word
              </Button>
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch('')
                editor.commands.clearSearch()
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
