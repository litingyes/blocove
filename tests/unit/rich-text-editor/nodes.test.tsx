import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EditorBlockquote, EditorBlockquoteToolbar } from '@/components/blocove/rich-text-editor/blockquote'
import { EditorCodeBlock, EditorCodeBlockToolbar } from '@/components/blocove/rich-text-editor/code-block'
import { EditorDetails, EditorDetailsToolbar } from '@/components/blocove/rich-text-editor/details'
import { EditorEmoji, EditorEmojiToolbar } from '@/components/blocove/rich-text-editor/emoji'
import { EditorHardBreak } from '@/components/blocove/rich-text-editor/hard-break'
import { EditorHeading, EditorHeadingToolbar } from '@/components/blocove/rich-text-editor/heading'
import { EditorImage, EditorImageToolbar } from '@/components/blocove/rich-text-editor/image'
import {
  EditorBulletList,
  EditorListToolbar,
  EditorOrderedList,
  EditorTaskList,
} from '@/components/blocove/rich-text-editor/list'
import {
  EditorMathematics,
  EditorMathematicsToolbar,
} from '@/components/blocove/rich-text-editor/mathematics'
import { EditorMention } from '@/components/blocove/rich-text-editor/mention'
import { EditorParagraph } from '@/components/blocove/rich-text-editor/paragraph'
import { EditorTable, EditorTableToolbar } from '@/components/blocove/rich-text-editor/table'
import { EditorText } from '@/components/blocove/rich-text-editor/text'
import { selectBaseUiOption } from '../../helpers/interactions'
import { renderRichTextEditor } from '../../helpers/render-rich-text-editor'

describe('blockquote node', () => {
  it('toggles the blockquote from the toolbar', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Quoted</p>',
      extensions: <EditorBlockquote />,
      toolbar: <EditorBlockquoteToolbar />,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Blockquote' }))

    await waitFor(() => {
      expect(editor.isActive('blockquote')).toBe(true)
    })
    expect(editor.getHTML()).toContain('<blockquote>')

    fireEvent.click(screen.getByRole('button', { name: 'Blockquote' }))

    await waitFor(() => {
      expect(editor.isActive('blockquote')).toBe(false)
    })
    expect(editor.getHTML()).not.toContain('<blockquote>')
  })
})

describe('list nodes', () => {
  it('toggles a bullet list from the toolbar', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Item</p>',
      extensions: <EditorBulletList />,
      toolbar: <EditorListToolbar />,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Bullet list' }))

    await waitFor(() => {
      expect(editor.isActive('bulletList')).toBe(true)
    })
    expect(editor.getHTML()).toContain('<ul>')
  })

  it('toggles an ordered list from the toolbar', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Item</p>',
      extensions: <EditorOrderedList />,
      toolbar: <EditorListToolbar />,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Ordered list' }))

    await waitFor(() => {
      expect(editor.isActive('orderedList')).toBe(true)
    })
    expect(editor.getHTML()).toContain('<ol>')
  })

  it('registers the shared item node once when two lists are declared', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Item</p>',
      extensions: (
        <>
          <EditorBulletList />
          <EditorOrderedList />
        </>
      ),
      toolbar: false,
    })

    expect(
      editor.extensionManager.extensions.filter(extension => extension.name === 'listItem'),
    ).toHaveLength(1)
  })

  it('renders task items with the typeset task list classes', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Item</p>',
      extensions: <EditorTaskList />,
      toolbar: <EditorListToolbar />,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Task list' }))

    await waitFor(() => {
      expect(editor.isActive('taskList')).toBe(true)
    })

    const html = editor.getHTML()

    expect(html).toContain('contains-task-list')
    expect(html).toContain('task-list-item')
  })
})

describe('emoji node', () => {
  it('inserts an emoji from the toolbar picker', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Hello </p>',
      extensions: <EditorEmoji />,
      toolbar: <EditorEmojiToolbar />,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Emoji' }))

    await waitFor(() => {
      expect(document.querySelector('div[aria-label="Emoji"]')).not.toBeNull()
    })

    const palette = document.querySelector('div[aria-label="Emoji"]')!
    const swatch = palette.querySelector('button[aria-label]')

    expect(swatch).not.toBeNull()

    fireEvent.click(swatch!)

    await waitFor(() => {
      expect(editor.getHTML()).toContain('data-type="emoji"')
    })
  })

  it('parses an existing emoji node back into the document', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Hi <span data-type="emoji" data-name="smile"></span></p>',
      extensions: <EditorEmoji />,
      toolbar: false,
    })

    expect(editor.getHTML()).toContain('data-name="smile"')
  })
})

describe('mathematics node', () => {
  it('inserts an inline formula from the toolbar', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Energy </p>',
      extensions: <EditorMathematics />,
      toolbar: <EditorMathematicsToolbar />,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Math' }))
    fireEvent.change(await screen.findByLabelText('LaTeX'), {
      target: { value: 'E = mc^2' },
    })
    fireEvent.click(await screen.findByRole('button', { name: 'Inline math' }))

    await waitFor(() => {
      expect(editor.getHTML()).toContain('data-type="inline-math"')
    })
    expect(editor.getHTML()).toContain('data-latex="E = mc^2"')
  })

  it('inserts a block formula without the KaTeX stylesheet loaded', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Formula</p>',
      extensions: <EditorMathematics />,
      toolbar: <EditorMathematicsToolbar />,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Math' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Block math' }))

    await waitFor(() => {
      expect(editor.getHTML()).toContain('data-type="block-math"')
    })
    // Unit tests never load the katex stylesheet: the node must survive that.
    expect(editor.getHTML()).toContain('data-latex="E = mc^2"')
  })
})

describe('mention node', () => {
  it('round trips a mention through its html attributes', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Hi <span data-type="mention" data-id="ada" data-label="Ada Lovelace"></span></p>',
      extensions: <EditorMention />,
      toolbar: false,
    })

    const html = editor.getHTML()

    expect(html).toContain('data-type="mention"')
    expect(html).toContain('data-id="ada"')
    expect(html).toContain('Ada Lovelace')
  })

  it('inserts a mention node programmatically', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Hi </p>',
      extensions: <EditorMention />,
      toolbar: false,
    })

    act(() => {
      editor.commands.insertContent({
        type: 'mention',
        attrs: { id: 'grace', label: 'Grace Hopper' },
      })
    })

    expect(editor.getHTML()).toContain('data-id="grace"')
  })
})

describe('heading node', () => {
  it('registers the heading schema without a toolbar', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<h2>Title</h2><p>Body</p>',
      extensions: <EditorHeading />,
      toolbar: false,
    })

    expect(editor.getHTML()).toContain('<h2>Title</h2>')
  })

  it('switches the block type from the toolbar selector', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Text</p>',
      extensions: <EditorHeading />,
      toolbar: <EditorHeadingToolbar />,
    })

    fireEvent.click(screen.getByRole('combobox', { name: 'Block type' }))
    selectBaseUiOption('Heading 2')

    await waitFor(() => {
      expect(editor.isActive('heading', { level: 2 })).toBe(true)
    })
    expect(editor.getHTML()).toContain('<h2>Text</h2>')

    fireEvent.click(screen.getByRole('combobox', { name: 'Block type' }))
    selectBaseUiOption('Paragraph')

    await waitFor(() => {
      expect(editor.isActive('paragraph')).toBe(true)
    })
  })
})

describe('code block node', () => {
  it('toggles a preformatted block from the toolbar', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>const value = 1</p>',
      extensions: <EditorCodeBlock />,
      toolbar: <EditorCodeBlockToolbar />,
    })

    act(() => {
      editor.commands.selectAll()
    })
    fireEvent.click(screen.getByRole('button', { name: 'Code block' }))

    await waitFor(() => {
      expect(editor.isActive('codeBlock')).toBe(true)
    })
    expect(editor.getHTML()).toContain('<pre><code>')
  })
})

describe('details node', () => {
  it('wraps the current block in a details node', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Summary</p>',
      extensions: <EditorDetails />,
      toolbar: <EditorDetailsToolbar />,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Details' }))

    await waitFor(() => {
      expect(editor.isActive('details')).toBe(true)
    })
    expect(editor.getHTML()).toContain('<details')
  })
})

describe('image node', () => {
  it('inserts an image with a normalized URL from the toolbar', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Image:</p>',
      extensions: <EditorImage />,
      toolbar: <EditorImageToolbar />,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Image' }))
    fireEvent.change(await screen.findByLabelText('Image URL'), {
      target: { value: 'example.com/picture.png' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Insert image' }))

    await waitFor(() => {
      expect(editor.getHTML()).toContain('<img')
    })
    expect(editor.getHTML()).toContain('src="https://example.com/picture.png"')
  })

  it('upgrades protocol-relative URLs to https', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Image:</p>',
      extensions: <EditorImage />,
      toolbar: <EditorImageToolbar />,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Image' }))
    fireEvent.change(await screen.findByLabelText('Image URL'), {
      target: { value: '//cdn.example.com/picture.png' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Insert image' }))

    await waitFor(() => {
      expect(editor.getHTML()).toContain('src="https://cdn.example.com/picture.png"')
    })
  })
})

describe('table node', () => {
  it('inserts a 3x3 table with a header row and edits it from the toolbar', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Table:</p>',
      extensions: <EditorTable />,
      toolbar: <EditorTableToolbar />,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Table' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Insert 3×3 table' }))

    await waitFor(() => {
      expect(editor.isActive('table')).toBe(true)
    })

    const inserted = editor.getHTML()
    expect(inserted.match(/<tr>/g)).toHaveLength(3)
    expect(inserted.match(/<th/g)).toHaveLength(3)
    expect(inserted.match(/<td/g)).toHaveLength(6)

    fireEvent.click(screen.getByRole('button', { name: 'Table' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Row below' }))
    await waitFor(() => {
      expect(editor.getHTML().match(/<tr>/g)).toHaveLength(4)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Table' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Column right' }))
    await waitFor(() => {
      expect(editor.getHTML().match(/<th/g)).toHaveLength(4)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Table' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Delete table' }))
    await waitFor(() => {
      expect(editor.getHTML()).not.toContain('<table')
    })
  })

  it('disables table commands outside a table', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Text</p>',
      extensions: <EditorTable />,
      toolbar: <EditorTableToolbar />,
    })

    expect(editor.isActive('table')).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: 'Table' }))

    expect((await screen.findByRole('button', { name: 'Row below' }) as HTMLButtonElement).disabled).toBe(true)
    expect((screen.getByRole('button', { name: 'Insert 3×3 table' }) as HTMLButtonElement).disabled).toBe(false)
  })
})

describe('hard break node', () => {
  it('inserts a line break inside the paragraph', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>First</p>',
      basicNodes: false,
      extensions: (
        <>
          <EditorText />
          <EditorParagraph />
          <EditorHardBreak />
        </>
      ),
      toolbar: false,
    })

    act(() => {
      editor.commands.setTextSelection(editor.state.doc.content.size - 1)
      editor.commands.setHardBreak()
    })

    expect(editor.getHTML()).toContain('<br>')
  })
})

describe('base nodes', () => {
  it('renders text through paragraphs', async () => {
    const { editor } = await renderRichTextEditor({
      content: '<p>Plain</p>',
      basicNodes: false,
      extensions: (
        <>
          <EditorText />
          <EditorParagraph />
        </>
      ),
      toolbar: false,
    })

    expect(editor.getHTML()).toBe('<p>Plain</p>')
  })
})
