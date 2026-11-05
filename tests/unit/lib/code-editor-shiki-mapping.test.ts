import { describe, expect, it, vi } from 'vitest'

// The style mapping is exercised against a controlled highlighter so every
// font style bit and the color-less token branch stay covered without loading
// real grammars.
const mockTokens = vi.hoisted(() => ({
  value: [] as { content: string, color?: string, fontStyle?: number }[][],
}))

vi.mock('shiki/core', () => ({
  createHighlighterCore: async () => ({
    getLoadedLanguages: () => [],
    loadLanguage: async () => {},
    codeToTokens: () => ({ tokens: mockTokens.value }),
  }),
}))

describe('tokenizeCodeEditor style mapping', () => {
  it('maps color, bold, italic and underline onto the token style', async () => {
    mockTokens.value = [
      [
        { content: 'bold', color: '#111111', fontStyle: 2 },
        { content: 'italic', fontStyle: 1 },
        { content: 'both', color: '#222222', fontStyle: 3 },
        { content: 'under', fontStyle: 4 },
        { content: '', color: '#333333' },
      ],
    ]

    const { tokenizeCodeEditor } = await import('@/lib/blocove/code-editor-shiki')
    const tokens = await tokenizeCodeEditor('bolditalicbothunder', 'javascript', 'dark')

    expect(tokens).toEqual([
      { from: 0, to: 4, style: 'color: #111111;font-weight: 600;' },
      { from: 4, to: 10, style: 'font-style: italic;' },
      { from: 10, to: 14, style: 'color: #222222;font-style: italic;font-weight: 600;' },
      { from: 14, to: 19, style: 'text-decoration: underline;' },
    ])
  })
})
