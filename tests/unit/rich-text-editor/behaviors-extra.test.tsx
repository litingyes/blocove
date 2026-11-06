import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  EditorFocus,
  EditorGapcursor,
  EditorTrailingNode,
} from '@/components/blocove/rich-text-editor/behavior'
import {
  EditorInvisibleCharacters,
  EditorInvisibleCharactersToolbar,
} from '@/components/blocove/rich-text-editor/invisible-characters'
import { EditorTypography } from '@/components/blocove/rich-text-editor/typography'
import { EditorUniqueId } from '@/components/blocove/rich-text-editor/unique-id'
import { renderRichTextEditor } from '../../helpers/render-rich-text-editor'

describe('behavior extensions', () => {
  it('registers the focus extension', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Focused</p>',
      extensions: <EditorFocus />,
      toolbar: false,
    })

    expect(
      editor.extensionManager.extensions.some(extension => extension.name === 'focus'),
    ).toBe(true)
  })

  it('registers the gap cursor extension', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Between</p>',
      extensions: <EditorGapcursor />,
      toolbar: false,
    })

    expect(
      editor.extensionManager.extensions.some(extension => extension.name === 'gapCursor'),
    ).toBe(true)
  })

  it('registers the trailing node extension', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Trailing</p>',
      extensions: <EditorTrailingNode />,
      toolbar: false,
    })

    expect(
      editor.extensionManager.extensions.some(extension => extension.name === 'trailingNode'),
    ).toBe(true)
  })
})

describe('typography extension', () => {
  it('rewrites two hyphens as an em dash while typing', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p></p>',
      extensions: <EditorTypography />,
      toolbar: false,
    })

    act(() => {
      editor.commands.insertContent('--', { applyInputRules: true })
    })

    await waitFor(() => {
      expect(editor.getText()).toContain('—')
    })
  })
})

describe('unique id extension', () => {
  it('gives every block a distinct id', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>One</p><p>Two</p>',
      extensions: <EditorUniqueId />,
      toolbar: false,
    })

    await waitFor(() => {
      expect(editor.getHTML().match(/data-id="[^"]+"/g)).toHaveLength(2)
    })

    const ids = [
      ...editor.getHTML().matchAll(/data-id="([^"]+)"/g),
    ]
      .map(match => match[1])

    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('invisible characters extension', () => {
  it('toggles the visibility from the toolbar', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Reveal me</p>',
      extensions: <EditorInvisibleCharacters />,
      toolbar: <EditorInvisibleCharactersToolbar />,
    })

    const initial = editor.storage.invisibleCharacters.visibility()

    fireEvent.click(screen.getByRole('button', { name: 'Invisible characters' }))

    await waitFor(() => {
      expect(editor.storage.invisibleCharacters.visibility()).toBe(!initial)
    })
  })
})
