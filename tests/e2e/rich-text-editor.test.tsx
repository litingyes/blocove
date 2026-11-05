import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { page, userEvent } from 'vitest/browser'
import {
  Editor,
  EditorContent,
} from '@/components/blocove/rich-text-editor/editor'
import { EditorParagraph } from '@/components/blocove/rich-text-editor/paragraph'
import { EditorText } from '@/components/blocove/rich-text-editor/text'
import { RichTextEditorPlayground } from '@/registry/blocove/blocks/rich-text-editor-playground'

function toolbar() {
  return page.getByRole('toolbar', { name: 'Formatting' })
}

function editableSurface() {
  return page.getByRole('textbox', { name: 'Rich text editor' })
}

function bubbleMenuElement() {
  return document.querySelector('[data-slot="editor-bubble-menu"]')
}

/** ProseMirror listens for the platform modifier, not a fixed Control key. */
function selectAllKeys() {
  return navigator.userAgent.includes('Mac')
    ? '{Meta>}a{/Meta}'
    : '{Control>}a{/Control}'
}

it('typing updates the document and the character count', async () => {
  await render(<RichTextEditorPlayground defaultValue="<p>Hello</p>" />)

  await editableSurface().click()
  await userEvent.keyboard('{End} world')

  await expect.element(editableSurface()).toMatchTextContent(/Hello world/)
  await expect.element(page.getByText('11 characters')).toBeVisible()
})

it('toggles marks from the toolbar for the current selection', async () => {
  await render(<RichTextEditorPlayground defaultValue="<p>Hello</p>" />)

  await editableSurface().click()
  await userEvent.keyboard(selectAllKeys())

  const bold = toolbar().getByRole('button', { name: 'Bold' })
  await bold.click()

  await expect.element(bold).toHaveAttribute('aria-pressed', 'true')
  await vi.waitFor(() => {
    expect(document.querySelector('[aria-label="Rich text editor"] strong')).not.toBeNull()
  })

  await bold.click()
  await expect.element(bold).not.toHaveAttribute('aria-pressed', 'true')
})

it('changes the block type through the select', async () => {
  await render(<RichTextEditorPlayground defaultValue="<p>Hello</p>" />)

  await editableSurface().click()
  await userEvent.keyboard(selectAllKeys())

  await toolbar().getByRole('combobox', { name: 'Block type' }).click()
  await page.getByRole('option', { name: 'Heading 2' }).click()

  await expect.element(page.getByRole('heading', { level: 2, name: 'Hello' })).toBeVisible()
})

it('applies a normalized link from the popover', async () => {
  await render(<RichTextEditorPlayground defaultValue="<p>Hello</p>" />)

  await editableSurface().click()
  await userEvent.keyboard(selectAllKeys())

  await toolbar().getByRole('button', { name: 'Link' }).click()
  await page.getByLabelText('Link URL').click()
  await userEvent.keyboard('example.com/docs')
  await page.getByRole('button', { name: 'Apply' }).click()

  await expect
    .element(page.getByRole('link', { name: 'Hello' }))
    .toHaveAttribute('href', 'https://example.com/docs')
})

it('undoes and redoes document edits', async () => {
  await render(<RichTextEditorPlayground defaultValue="<p>Hello</p>" />)

  await editableSurface().click()
  await userEvent.keyboard('{End} world')
  await expect.element(editableSurface()).toMatchTextContent(/Hello world/)

  await toolbar().getByRole('button', { name: 'Undo' }).click()
  await expect.element(editableSurface()).not.toMatchTextContent(/Hello world/)

  await toolbar().getByRole('button', { name: 'Redo' }).click()
  await expect.element(editableSurface()).toMatchTextContent(/Hello world/)
})

it('shows the bubble menu for a selection and hides it when collapsed', async () => {
  await render(<RichTextEditorPlayground defaultValue="<p>Hello world</p>" />)

  await editableSurface().click()
  await userEvent.keyboard(selectAllKeys())

  // The bubble menu is only appended to the DOM while it is visible.
  await vi.waitFor(() => {
    expect(bubbleMenuElement()).not.toBeNull()
  }, { timeout: 5000 })
  await expect.element(page.elementLocator(bubbleMenuElement()!)).toBeVisible()

  await editableSurface().click()
  await vi.waitFor(() => {
    expect(bubbleMenuElement()).toBeNull()
  }, { timeout: 5000 })
})

it('inserts a table from the toolbar popover', async () => {
  await render(<RichTextEditorPlayground defaultValue="<p>Hello</p>" />)

  await editableSurface().click()
  await toolbar().getByLabelText('Table').click()
  await page.getByRole('button', { name: 'Insert 3×3 table' }).click()

  await expect.element(page.getByRole('table')).toBeVisible()
})

it('refuses input when the editor is read-only', async () => {
  await render(
    <Editor defaultValue="<p>Read only</p>" editable={false}>
      <EditorText />
      <EditorParagraph />
      <EditorContent />
    </Editor>,
  )

  const readOnly = page.getByRole('textbox', { name: 'Rich text editor' })
  await expect.element(readOnly).toHaveAttribute('contenteditable', 'false')

  await readOnly.click()
  await userEvent.keyboard('{End} nope')

  await expect.element(readOnly).not.toMatchTextContent(/nope/)
})
