import type { SuggestionKeyDownProps, SuggestionOptions, SuggestionProps } from '@tiptap/suggestion'
import type { Ref } from 'react'
import { ReactRenderer } from '@tiptap/react'
import { cn } from 'cn'
import { useId, useImperativeHandle, useRef, useState } from 'react'

export interface SuggestionItem {
  id: string
  label: string
}

/** The props the list component receives; a subset of the suggestion props. */
export interface SuggestionListProps<T extends SuggestionItem = SuggestionItem> {
  items: T[]
  command: (item: T) => void
  query: string
  ariaLabel?: string
}

export interface SuggestionListHandle {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean
}

export interface EditorSuggestionListProps extends SuggestionListProps<any> {
  ref?: Ref<SuggestionListHandle>
}

/**
 * The popup rendered for a suggestion. It keeps the active option in local
 * state so the arrow keys can move through the list without a round trip
 * through the editor, and exposes the keyboard handler to the suggestion
 * renderer through a ref.
 *
 * The list only needs an id and a label, so it accepts every suggestion item
 * shape and leaves the concrete item type to the caller.
 */
export function EditorSuggestionList({
  items,
  command,
  query,
  ariaLabel = 'Suggestions',
  ref,
}: EditorSuggestionListProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeIndexRef = useRef(activeIndex)
  const listId = useId()
  const currentIndex = items.length === 0
    ? -1
    : Math.min(activeIndex, items.length - 1)

  activeIndexRef.current = currentIndex

  function move(delta: number) {
    if (items.length === 0) {
      return
    }

    const nextIndex = (currentIndex + delta + items.length) % items.length
    activeIndexRef.current = nextIndex
    setActiveIndex(nextIndex)
  }

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowDown') {
        move(1)
        return true
      }

      if (event.key === 'ArrowUp') {
        move(-1)
        return true
      }

      if (event.key === 'Enter') {
        const item = items[activeIndexRef.current]

        if (item) {
          command(item)
        }

        return true
      }

      return false
    },
  }))

  return (
    <div
      data-slot="editor-suggestion-list"
      role="listbox"
      aria-label={ariaLabel}
      aria-activedescendant={currentIndex === -1
        ? undefined
        : `${listId}-option-${currentIndex}`}
      className="flex max-h-72 w-64 flex-col overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
    >
      {items.length === 0
        ? (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">
              No results for
              {' '}
              <span className="font-medium">{query}</span>
            </p>
          )
        : items.map((item, index) => (
            <button
              key={item.id}
              id={`${listId}-option-${index}`}
              type="button"
              role="option"
              aria-selected={index === currentIndex}
              className={cn(
                'flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm outline-none',
                index === currentIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'text-popover-foreground',
              )}
              onMouseEnter={() => setActiveIndex(index)}
              // The editor keeps focus while the popup is open, so the click
              // must not move it away from the document.
              onMouseDown={event => event.preventDefault()}
              onClick={() => command(item)}
            >
              {item.label}
            </button>
          ))}
    </div>
  )
}

export interface SuggestionRendererOptions {
  /** Accessible name of the popup list. */
  ariaLabel?: string
}

/**
 * Builds the render callbacks the Tiptap suggestion plugin needs. The plugin
 * mounts and positions the element through `props.mount`, so the renderer only
 * owns the React tree and the keyboard handling.
 */
export function createSuggestionRenderer<T extends SuggestionItem = SuggestionItem>(
  options: SuggestionRendererOptions = {},
): NonNullable<SuggestionOptions<T, T>['render']> {
  return () => {
    let component: ReactRenderer<SuggestionListHandle, SuggestionListProps<T>> | undefined
    let unmount: (() => void) | undefined

    function destroy() {
      unmount?.()
      component?.destroy()
      unmount = undefined
      component = undefined
    }

    return {
      onStart: (props) => {
        component = new ReactRenderer<SuggestionListHandle, SuggestionListProps<T>>(
          EditorSuggestionList,
          {
            props: {
              items: props.items,
              command: props.command,
              query: props.query,
              ariaLabel: options.ariaLabel,
            },
            editor: props.editor,
          },
        )
        unmount = props.mount(component.element)
      },
      onUpdate: (props) => {
        component?.updateProps({
          items: props.items,
          command: props.command,
          query: props.query,
          ariaLabel: options.ariaLabel,
        })
      },
      onKeyDown: (props: SuggestionKeyDownProps) => {
        if (props.event.key === 'Escape') {
          destroy()
          return true
        }

        return component?.ref?.onKeyDown(props) ?? false
      },
      onExit: () => {
        destroy()
      },
    }
  }
}

export type { SuggestionProps }
