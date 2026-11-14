import { useState } from 'react'
import { expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { page } from 'vitest/browser'
import { MarkdownCodeBlock } from '@/components/blocove/markdown/code-block'
import { Markdown } from '@/components/blocove/markdown/markdown'

// The fence and the tail after it: appending grows the open paragraph while the
// finished fence must keep its DOM, highlighted lines included.
const fenceSource = [
  '# Streaming answers',
  '',
  '```ts',
  'const answer = 42',
  'export default answer',
  '```',
  '',
  'Tail',
].join('\n')

function elementLocator(selector: string) {
  const element = document.querySelector(selector)

  if (!element) {
    throw new Error(`Could not find ${selector}`)
  }

  return page.elementLocator(element)
}

/**
 * A chat-shaped surface: the source arrives in appends and the stream closes
 * separately, the way a model answers.
 */
function GrowingDocument({ initial, appended }: { initial: string, appended: string }) {
  const [source, setSource] = useState(initial)
  const [streaming, setStreaming] = useState(true)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <button type="button" onClick={() => setSource(previous => previous + appended)}>
          Append
        </button>
        <button type="button" onClick={() => setStreaming(false)}>
          Finish
        </button>
      </div>
      <Markdown source={source} streaming={streaming} components={{ code: MarkdownCodeBlock }} />
    </div>
  )
}

it('keeps the finished fence mounted while the source grows', async () => {
  await render(<GrowingDocument initial={fenceSource} appended=" and more" />)

  const surface = document.querySelector<HTMLElement>('.typeset')
  const pre = document.querySelector('[data-slot="code-block-content"]')

  expect(surface, 'the rendered nodes live in a typeset element').not.toBeNull()
  expect(pre, 'the fence renders through the capability item').not.toBeNull()
  expect(surface!.getAttribute('aria-busy')).toBe('true')

  await page.getByRole('button', { name: 'Append' }).click()

  await expect.element(elementLocator('.typeset p')).toMatchTextContent(/Tail and more/)
  expect(document.querySelector('[data-slot="code-block-content"]')).toBe(pre)

  await page.getByRole('button', { name: 'Finish' }).click()

  await expect.poll(() => document.querySelector('.typeset')?.getAttribute('aria-busy')).toBeNull()
})

it('highlights a streamed fence and keeps its nodes across an append', async () => {
  await render(<GrowingDocument initial={fenceSource} appended=" and more" />)

  await expect.poll(
    () => document.querySelector('[data-slot="code-block"]')?.getAttribute('data-language'),
    { timeout: 8000 },
  ).toBe('ts')

  // shiki loads the grammar in the background; the highlighted lines replace the
  // plain text without remounting the fence.
  await expect.poll(
    () => document.querySelectorAll('[data-slot="code-block-line"]').length,
    { timeout: 8000 },
  ).toBeGreaterThan(1)

  await expect.poll(
    () => document.querySelectorAll('[data-slot="code-block-line-content"] span').length,
    { timeout: 8000 },
  ).toBeGreaterThan(0)

  const pre = document.querySelector('[data-slot="code-block-content"]')
  const text = document.querySelector('.typeset')?.textContent ?? ''

  await page.getByRole('button', { name: 'Append' }).click()

  await expect.element(elementLocator('.typeset p')).toMatchTextContent(/Tail and more/)
  expect(document.querySelector('[data-slot="code-block-content"]')).toBe(pre)
  expect(document.querySelector('.typeset')!.textContent!.length).toBeGreaterThan(text.length)
})
