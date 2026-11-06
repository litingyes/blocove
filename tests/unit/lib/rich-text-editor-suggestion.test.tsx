import type { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createSuggestionRenderer,
  EditorSuggestionList,
} from '@/lib/blocove/rich-text-editor-suggestion'
import { renderRichTextEditor } from '../../helpers/render-rich-text-editor'

interface Person {
  id: string
  label: string
}

const people: Person[] = [
  { id: 'ada', label: 'Ada Lovelace' },
  { id: 'alan', label: 'Alan Turing' },
  { id: 'grace', label: 'Grace Hopper' },
]

afterEach(() => {
  cleanup()
})

async function startRenderer(items: Person[] = people) {
  const { editor } = await renderRichTextEditor({ content: '<p>Hello</p>' })
  const command = vi.fn()
  const renderer = createSuggestionRenderer<Person>()()
  const mount = vi.fn((element: HTMLElement) => {
    document.body.appendChild(element)
    return () => element.remove()
  })
  const props = {
    editor,
    items,
    command,
    query: '',
    mount,
  } as unknown as SuggestionProps<Person>

  // ReactRenderer renders into its own React root, so the tree only appears
  // once React flushes that root.
  await act(async () => {
    renderer.onStart?.(props)
    await Promise.resolve()
  })

  return {
    command,
    editor,
    mount,
    renderer,
    props,
  }
}

function keyDown(key: string) {
  return {
    event: new KeyboardEvent('keydown', { key }),
  } as SuggestionKeyDownProps
}

function options() {
  return [
    ...document.querySelectorAll('[role="option"]'),
  ]
}

describe('editorSuggestionList', () => {
  it('renders one option per item and marks the first one active', () => {
    const { container } = render(
      <EditorSuggestionList items={people} command={() => {}} query="" />,
    )
    const listbox = container.querySelector('[role="listbox"]')

    expect(listbox).not.toBeNull()
    expect(container.querySelectorAll('[role="option"]')).toHaveLength(3)
    expect(
      container.querySelectorAll('[role="option"]')[0].getAttribute('aria-selected'),
    ).toBe('true')
    expect(listbox?.getAttribute('aria-activedescendant')).toBe(
      container.querySelectorAll('[role="option"]')[0].id,
    )
  })

  it('calls command with the clicked item', () => {
    const command = vi.fn()
    const { container } = render(
      <EditorSuggestionList items={people} command={command} query="" />,
    )

    act(() => {
      container.querySelectorAll('[role="option"]')[1].dispatchEvent(
        new MouseEvent('click', { bubbles: true }),
      )
    })

    expect(command).toHaveBeenCalledWith(people[1])
  })

  it('moves the active option on hover and keeps focus in the document', () => {
    const { container } = render(
      <EditorSuggestionList items={people} command={() => {}} query="" />,
    )
    const rendered = [
      ...container.querySelectorAll('[role="option"]'),
    ]

    act(() => {
      fireEvent.mouseEnter(rendered[2])
    })
    expect(rendered[2].getAttribute('aria-selected')).toBe('true')

    const mousedown = new MouseEvent('mousedown', { bubbles: true, cancelable: true })

    act(() => {
      rendered[1].dispatchEvent(mousedown)
    })
    // The editor keeps focus while the popup is open.
    expect(mousedown.defaultPrevented).toBe(true)
  })

  it('names the list for assistive technology', () => {
    const { container } = render(
      <EditorSuggestionList items={people} command={() => {}} query="" />,
    )

    expect(
      container.querySelector('[role="listbox"]')?.getAttribute('aria-label'),
    ).toBe('Suggestions')
  })

  it('shows an empty state for no matches', () => {
    const { container } = render(
      <EditorSuggestionList items={[]} command={() => {}} query="zzz" />,
    )

    expect(container.querySelector('[role="option"]')).toBeNull()
    expect(container.querySelector('[role="listbox"]')?.textContent).toContain('No results')
  })
})

describe('createSuggestionRenderer', () => {
  it('mounts the list through the suggestion mount helper on start', async () => {
    const { mount } = await startRenderer()

    expect(mount).toHaveBeenCalledTimes(1)
    expect(document.querySelector('[data-slot="editor-suggestion-list"]')).not.toBeNull()
    expect(options()).toHaveLength(3)
  })

  it('moves the active option with the arrow keys', async () => {
    const { renderer } = await startRenderer()

    await act(async () => {
      expect(renderer.onKeyDown?.(keyDown('ArrowDown'))).toBe(true)
      await Promise.resolve()
    })
    expect(options()[1].getAttribute('aria-selected')).toBe('true')

    await act(async () => {
      renderer.onKeyDown?.(keyDown('ArrowUp'))
      await Promise.resolve()
    })
    expect(options()[0].getAttribute('aria-selected')).toBe('true')
  })

  it('wraps around at both ends', async () => {
    const { renderer } = await startRenderer()

    await act(async () => {
      renderer.onKeyDown?.(keyDown('ArrowUp'))
      await Promise.resolve()
    })
    expect(options()[2].getAttribute('aria-selected')).toBe('true')
  })

  it('selects the active item on enter', async () => {
    const { command, renderer } = await startRenderer()

    await act(async () => {
      renderer.onKeyDown?.(keyDown('ArrowDown'))
      await Promise.resolve()
    })
    await act(async () => {
      expect(renderer.onKeyDown?.(keyDown('Enter'))).toBe(true)
      await Promise.resolve()
    })

    expect(command).toHaveBeenCalledWith(people[1])
  })

  it('tears the popup down on escape and on exit', async () => {
    const { renderer } = await startRenderer()

    await act(async () => {
      expect(renderer.onKeyDown?.(keyDown('Escape'))).toBe(true)
      await Promise.resolve()
    })
    expect(document.querySelector('[data-slot="editor-suggestion-list"]')).toBeNull()

    const second = await startRenderer()
    await act(async () => {
      second.renderer.onExit?.({} as unknown as SuggestionProps<Person>)
      await Promise.resolve()
    })
    expect(document.querySelector('[data-slot="editor-suggestion-list"]')).toBeNull()
  })

  it('re-renders the list when the items change', async () => {
    const { renderer, props } = await startRenderer()

    await act(async () => {
      renderer.onUpdate?.({
        ...props,
        items: [people[2]],
      } as SuggestionProps<Person>)
      await Promise.resolve()
    })

    expect(options()).toHaveLength(1)
    expect(options()[0].textContent).toContain('Grace Hopper')
  })

  it('stays safe on the keyboard without results', async () => {
    const { renderer } = await startRenderer([])

    await act(async () => {
      expect(renderer.onKeyDown?.(keyDown('ArrowDown'))).toBe(true)
      expect(renderer.onKeyDown?.(keyDown('ArrowUp'))).toBe(true)
      expect(renderer.onKeyDown?.(keyDown('Enter'))).toBe(true)
      await Promise.resolve()
    })

    expect(options()).toHaveLength(0)
  })

  it('ignores keys it does not handle', async () => {
    const { renderer } = await startRenderer()

    expect(renderer.onKeyDown?.(keyDown('a'))).toBe(false)
  })
})
