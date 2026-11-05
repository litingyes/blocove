import type { ThemeState } from '@/lib/theme'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applyTheme, buildThemeVariables, defaultThemeState, THEME_STORAGE_KEY, writeStoredTheme } from '@/lib/theme'
import { themeBootScript } from '@/lib/theme-boot'

type BootMode = 'light' | 'dark'

function stylesOf(element: HTMLElement): Record<string, string> {
  const styles: Record<string, string> = {}
  for (let index = 0; index < element.style.length; index += 1) {
    const name = element.style.item(index)
    styles[name] = element.style.getPropertyValue(name)
  }
  return styles
}

function resetRoot(): void {
  const root = document.documentElement
  root.className = ''
  root.removeAttribute('style')
}

function runBootScript(): void {
  // eslint-disable-next-line no-new-func -- The boot script ships as an inline string; compiling it is the only way to test the exact code the page runs before hydration.
  new Function(themeBootScript)()
}

function expectRootMatches(state: ThemeState, mode: BootMode): void {
  const root = document.documentElement
  const reference = document.createElement('div')

  applyTheme(reference, state, mode)

  expect(root.classList.contains('dark')).toBe(mode === 'dark')
  expect(root.style.colorScheme).toBe(mode)
  expect(stylesOf(root)).toEqual(stylesOf(reference))

  for (const [name, value] of Object.entries(buildThemeVariables(state, mode))) {
    expect(root.style.getPropertyValue(name), name).toBe(value)
  }
}

function expectRootUntouched(): void {
  expect(document.documentElement.className).toBe('')
  expect(document.documentElement.getAttribute('style')).toBeNull()
}

describe('themeBootScript', () => {
  it('is a self-contained inline IIFE', () => {
    expect(typeof themeBootScript).toBe('string')
    expect(themeBootScript.startsWith('(function () {')).toBe(true)
    expect(themeBootScript.endsWith('})()')).toBe(true)
    expect(themeBootScript).toContain(THEME_STORAGE_KEY)
    expect(themeBootScript).toContain('prefers-color-scheme: dark')
    expect(themeBootScript).toContain('document.documentElement')
    expect(themeBootScript).toContain('style.setProperty')
    expect(themeBootScript).not.toContain('import ')
  })
})

describe('theme boot replay', () => {
  beforeEach(() => {
    localStorage.clear()
    resetRoot()
  })

  afterEach(() => {
    resetRoot()
    localStorage.clear()
  })

  it('replays a persisted light theme onto the document element', () => {
    const state: ThemeState = { ...defaultThemeState, mode: 'light' }

    writeStoredTheme(state, 'light')

    runBootScript()

    expectRootMatches(state, 'light')
    expect(document.documentElement.style.getPropertyValue('--background')).toBe('oklch(1 0 0)')
  })

  it('replays a persisted dark theme onto the document element', () => {
    const state: ThemeState = { ...defaultThemeState, mode: 'dark' }

    writeStoredTheme(state, 'dark')

    runBootScript()

    expectRootMatches(state, 'dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.getPropertyValue('--background')).toBe('oklch(0.145 0 0)')
  })

  it('replays a custom state exactly like applyTheme', () => {
    const state: ThemeState = {
      ...defaultThemeState,
      baseColor: 'stone',
      themeColor: 'blue',
      chartColor: 'blue',
      radius: 'large',
      font: 'jetbrains-mono',
      fontHeading: 'lora',
      mode: 'dark',
    }

    writeStoredTheme(state, 'dark')

    runBootScript()

    expectRootMatches(state, 'dark')
  })

  it('re-resolves system mode against the current media query', () => {
    writeStoredTheme({ ...defaultThemeState, mode: 'system' }, 'light')
    vi.spyOn(window, 'matchMedia').mockImplementation(query => ({ matches: true, media: query } as unknown as MediaQueryList))

    runBootScript()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('falls back to light when matchMedia is unavailable', () => {
    writeStoredTheme({ ...defaultThemeState, mode: 'system' }, 'dark')
    const original = window.matchMedia
    Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: undefined })

    try {
      runBootScript()
    }
    finally {
      window.matchMedia = original
    }

    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  it('derives the dark class from the stored mode, not the cached effective mode', () => {
    writeStoredTheme({ ...defaultThemeState, mode: 'dark' }, 'light')

    runBootScript()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('leaves the document untouched when nothing is stored', () => {
    runBootScript()

    expectRootUntouched()
  })

  it('leaves the document untouched for an empty entry', () => {
    localStorage.setItem(THEME_STORAGE_KEY, '')

    runBootScript()

    expectRootUntouched()
  })

  it('leaves the document untouched for corrupt JSON', () => {
    localStorage.setItem(THEME_STORAGE_KEY, '{not-json')

    expect(() => runBootScript()).not.toThrow()
    expectRootUntouched()
  })

  it('leaves the document untouched for a stale version', () => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({
      v: 2,
      state: defaultThemeState,
      vars: buildThemeVariables(defaultThemeState, 'dark'),
    }))

    runBootScript()

    expectRootUntouched()
  })

  it('leaves the document untouched when the state is missing', () => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ v: 1, effectiveMode: 'dark' }))

    runBootScript()

    expectRootUntouched()
  })

  it('applies the mode but skips tokens when the cache is missing', () => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({
      v: 1,
      state: { ...defaultThemeState, mode: 'dark' },
      effectiveMode: 'dark',
    }))

    runBootScript()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(stylesOf(document.documentElement)).toEqual({ 'color-scheme': 'dark' })
  })

  it('applies the mode but skips tokens when the cache is not an object', () => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({
      v: 1,
      state: defaultThemeState,
      effectiveMode: 'light',
      vars: 'nope',
    }))

    runBootScript()

    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(stylesOf(document.documentElement)).toEqual({ 'color-scheme': 'light' })
  })

  it('never throws when storage is unreadable', () => {
    const storageSpy = vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('storage blocked')
    })

    try {
      expect(() => runBootScript()).not.toThrow()
      expectRootUntouched()
    }
    finally {
      storageSpy.mockRestore()
    }
  })
})
