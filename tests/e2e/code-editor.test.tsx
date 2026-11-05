import { expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { page, userEvent } from 'vitest/browser'
import { CodeEditorDiff, CodeEditorDiffToolbar } from '@/components/blocove/code-editor/diff'
import {
  CodeEditor,
  CodeEditorContent,
  CodeEditorStatusBar,
  CodeEditorToolbar,
} from '@/components/blocove/code-editor/editor'
import { CodeEditorLanguages } from '@/components/blocove/code-editor/languages'
import { CodeEditorLineNumbers } from '@/components/blocove/code-editor/line-numbers'
import { CodeEditorShiki } from '@/components/blocove/code-editor/shiki'

function elementLocator(selector: string) {
  const element = document.querySelector(selector)

  if (!element) {
    throw new Error(`Could not find ${selector}`)
  }

  return page.elementLocator(element)
}

function content() {
  return elementLocator('.cm-content')
}

function statusBar() {
  return elementLocator('[data-slot="code-editor-status"]')
}

it('types code and tracks the cursor in the status bar', async () => {
  await render(
    <CodeEditor defaultValue="" language="typescript">
      <CodeEditorLanguages />
      <CodeEditorLineNumbers />
      <CodeEditorToolbar />
      <CodeEditorContent />
      <CodeEditorStatusBar />
    </CodeEditor>,
  )

  await content().click()
  await userEvent.keyboard('const answer = 42')

  await expect.element(content()).toMatchTextContent(/const answer = 42/)
  await expect.element(statusBar()).toMatchTextContent(/Ln 1, Col 18/)
  await expect.element(elementLocator('.cm-lineNumbers')).toBeVisible()
})

it('toggles soft wrapping from the toolbar', async () => {
  await render(
    <CodeEditor defaultValue="const answer = 42">
      <CodeEditorToolbar />
      <CodeEditorContent />
    </CodeEditor>,
  )

  const toggle = page.getByRole('button', { name: 'Soft wrap' })
  await toggle.click()

  await expect.element(toggle).toHaveAttribute('aria-pressed', 'true')
  await expect.element(content()).toHaveClass(/cm-lineWrapping/)
})

it('undoes and redoes document edits', async () => {
  await render(
    <CodeEditor defaultValue="">
      <CodeEditorToolbar />
      <CodeEditorContent />
    </CodeEditor>,
  )

  await content().click()
  await userEvent.keyboard('let value = 1')

  await page.getByRole('button', { name: 'Undo' }).click()
  await expect.element(content()).not.toMatchTextContent(/let value = 1/)

  await page.getByRole('button', { name: 'Redo' }).click()
  await expect.element(content()).toMatchTextContent(/let value = 1/)
})

it('copies the document and confirms it briefly', async () => {
  const writeText = vi
    .spyOn(navigator.clipboard, 'writeText')
    .mockResolvedValue(undefined)

  await render(
    <CodeEditor defaultValue="const answer = 42">
      <CodeEditorToolbar />
      <CodeEditorContent />
    </CodeEditor>,
  )

  await page.getByRole('button', { name: 'Copy code' }).click()

  await expect.element(page.getByRole('button', { name: 'Copied' })).toBeVisible()
  expect(writeText).toHaveBeenCalledWith('const answer = 42')
})

it('highlights the document with shiki', async () => {
  await render(
    <CodeEditor defaultValue="const answer = 42" language="tsx">
      <CodeEditorShiki delay={0} />
      <CodeEditorContent />
    </CodeEditor>,
  )

  await vi.waitFor(() => {
    expect(document.querySelector('.cm-line span[style*="color"]')).not.toBeNull()
  })
})

it('reviews and accepts a diff chunk', async () => {
  await render(
    <CodeEditor defaultValue={'const answer = 42\n'} language="typescript">
      <CodeEditorDiff original={'const answer = 41\n'} />
      <CodeEditorToolbar>
        <CodeEditorDiffToolbar />
      </CodeEditorToolbar>
      <CodeEditorContent />
    </CodeEditor>,
  )

  const review = page.getByRole('group', { name: 'Diff review' })
  await expect.element(review).toMatchTextContent(/1 of 1/)

  await page.getByRole('button', { name: 'Accept change' }).click()

  await expect.element(review).toMatchTextContent(/No changes/)
})

it('renders read-only documents without accepting input', async () => {
  await render(
    <CodeEditor defaultValue="const answer = 42" readOnly>
      <CodeEditorToolbar />
      <CodeEditorContent />
      <CodeEditorStatusBar />
    </CodeEditor>,
  )

  await expect.element(content()).toHaveAttribute('contenteditable', 'false')
  await expect.element(statusBar()).toMatchTextContent(/Read only/)

  await content().click()
  await userEvent.keyboard('{End} nope')

  await expect.element(content()).not.toMatchTextContent(/nope/)
})
