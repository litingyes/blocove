import { describe, expect, it, vi } from 'vitest'

vi.mock('pele/lazy', () => ({
  mountAsync: vi.fn(async () => ({
    destroy: vi.fn(),
  })),
}))

describe('markdownMermaid helpers', () => {
  it('maps an id to a safe prefix', async () => {
    const { markdownMermaidIdPrefix } = await import('@/lib/blocove/markdown-mermaid')

    expect(markdownMermaidIdPrefix('«r1»')).toBe('diagram-r1')
  })

  it('turns images off and lets mount handle zoom', async () => {
    const { buildMarkdownMermaidOptions } = await import('@/lib/blocove/markdown-mermaid')

    expect(buildMarkdownMermaidOptions('diagram-a')).toEqual({
      idPrefix: 'diagram-a',
      zoom: 'auto',
      images: false,
    })
  })

  it('caches the module promise', async () => {
    vi.resetModules()

    const { loadMarkdownMermaid } = await import('@/lib/blocove/markdown-mermaid')
    const first = loadMarkdownMermaid()
    const second = loadMarkdownMermaid()

    expect(first).toBe(second)
    await expect(first).resolves.toHaveProperty('mountAsync')
  })
})
