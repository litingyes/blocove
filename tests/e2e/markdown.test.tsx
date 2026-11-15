import { useState } from 'react'
import { expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { page } from 'vitest/browser'
import { MarkdownChart } from '@/components/blocove/markdown/chart'
import { MarkdownCodeBlock } from '@/components/blocove/markdown/code-block'
import { Markdown } from '@/components/blocove/markdown/markdown'
import { MarkdownMermaid } from '@/components/blocove/markdown/mermaid'

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

const openMermaid = '```mermaid\nflowchart LR\n  A --> B'
const closedMermaid = '```mermaid\nflowchart LR\n  A --> B\n```\n'

/**
 * A fence that closes while the answer is still on screen: the diagram must
 * appear on the closing line, not when the stream ends.
 */
function ClosingMermaid() {
  const [source, setSource] = useState(openMermaid)

  return (
    <>
      <button type="button" onClick={() => setSource(closedMermaid)}>
        Close
      </button>
      {/* The stream is still open: the closing fence alone must draw the diagram. */}
      <Markdown
        source={source}
        streaming
        components={{
          fences: { mermaid: MarkdownMermaid },
        }}
      />
    </>
  )
}

it('draws the mermaid diagram when the fence closes', async () => {
  await render(<ClosingMermaid />)

  expect(document.querySelector('svg.pele')).toBeNull()

  await page.getByRole('button', { name: 'Close' }).click()

  await expect.poll(() => document.querySelector('svg.pele'), { timeout: 15000 }).not.toBeNull()
})

const chartBody = '{"type":"bar","title":"MRR","x":"month","series":[{"key":"mrr","label":"MRR"}],"data":[{"month":"Jan","mrr":120},{"month":"Feb","mrr":140}]}'
const openChart = ['```chart', chartBody].join('\n')
const closedChart = ['```chart', chartBody, '```', ''].join('\n')

/** A chart fence that closes while the answer stays on screen. */
function ClosingChart() {
  const [source, setSource] = useState(openChart)

  return (
    <>
      <button type="button" onClick={() => setSource(closedChart)}>
        Close chart
      </button>
      {/* The stream is still open: the closing fence alone must draw the chart. */}
      <div style={{ width: 640 }}>
        <Markdown
          source={source}
          streaming
          components={{
            fences: { chart: MarkdownChart },
          }}
        />
      </div>
    </>
  )
}

it('draws the chart when the fence closes', async () => {
  // The browser test page loads no Tailwind, so the chart card would collapse
  // to zero height and ResponsiveContainer would never paint. Supply the size
  // the item gets from `h-60` in an application.
  const layout = document.createElement('style')
  layout.textContent = '[data-slot="chart"] { width: 640px; height: 240px; }'
  document.head.append(layout)

  try {
    await render(<ClosingChart />)

    expect(document.querySelector('[data-slot="chart"]')).toBeNull()

    await page.getByRole('button', { name: 'Close chart' }).click()

    await expect.poll(
      () => document.querySelector('.recharts-surface'),
      { timeout: 5000 },
    ).not.toBeNull()
  }
  finally {
    layout.remove()
  }
}, 20000)
