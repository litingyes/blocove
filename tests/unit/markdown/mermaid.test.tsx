import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MarkdownMermaid } from '@/components/blocove/markdown/mermaid'

const loadMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/blocove/markdown-mermaid', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/blocove/markdown-mermaid')>()

  return { ...actual, loadMarkdownMermaid: loadMock }
})

const source = 'flowchart LR\n  A --> B'

beforeEach(() => {
  loadMock.mockReset()
})

describe('markdownMermaid', () => {
  it('renders the source while the fence is open and does not load Pele', () => {
    render(<MarkdownMermaid language="mermaid" code={source} complete={false} />)

    expect(screen.getByText(/flowchart LR/)).toBeDefined()
    expect(loadMock).not.toHaveBeenCalled()
  })

  it('maps the shadcn tokens onto the diagram variables', () => {
    render(<MarkdownMermaid language="mermaid" code={source} complete={false} />)

    const card = document.querySelector<HTMLElement>('[data-slot="code-block"]')

    expect(card?.style.getPropertyValue('--pele-bg')).toBe('var(--background)')
    expect(card?.style.getPropertyValue('--pele-series-1')).toBe('var(--chart-1)')
  })

  it('mounts the diagram with the safe options once the fence is complete', async () => {
    const destroy = vi.fn()
    const mountAsync = vi.fn(async () => ({ destroy }))

    loadMock.mockResolvedValue({ mountAsync })

    render(<MarkdownMermaid language="mermaid" code={source} complete />)

    await waitFor(() => expect(mountAsync).toHaveBeenCalledTimes(1))

    const [element, text, options] = mountAsync.mock.calls[0] as unknown as [HTMLElement, string, Record<string, unknown>]

    expect(element).toBeInstanceOf(HTMLElement)
    expect(text).toBe(source)
    expect(options).toMatchObject({ zoom: 'auto', images: false })
    expect(options.idPrefix).toMatch(/^diagram-[\w-]+$/)

    await waitFor(() => expect(document.querySelector('[data-slot="markdown-mermaid-surface"]')).not.toBeNull())
  })

  it('falls back to the source and shows the error when Pele rejects the diagram', async () => {
    loadMock.mockResolvedValue({
      mountAsync: async (_element: HTMLElement, _source: string, options: { onError?: (cause: unknown) => void }) => {
        options.onError?.(new Error('bad diagram'))

        return {
          destroy: vi.fn(),
        }
      },
    })

    render(<MarkdownMermaid language="mermaid" code={source} complete />)

    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('bad diagram'))
    expect(screen.getByText(/flowchart LR/)).toBeDefined()
  })

  it('survives a loader rejection', async () => {
    loadMock.mockRejectedValue(new Error('offline'))

    render(<MarkdownMermaid language="mermaid" code={source} complete />)

    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('offline'))
    expect(screen.getByText(/flowchart LR/)).toBeDefined()
  })

  it('destroys the instance on unmount', async () => {
    const destroy = vi.fn()
    const mountAsync = vi.fn(async () => ({ destroy }))

    loadMock.mockResolvedValue({ mountAsync })

    const { unmount } = render(<MarkdownMermaid language="mermaid" code={source} complete />)

    await waitFor(() => expect(mountAsync).toHaveBeenCalled())
    unmount()

    // The mount promise may settle after the effect cleans up; the disposed
    // guard has to destroy it either way.
    await waitFor(() => expect(destroy).toHaveBeenCalledTimes(1))
  })
})
