import type { ThemeState } from '@/lib/theme'
import { fireEvent, render, screen } from '@testing-library/react'
import { act } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider, useTheme } from '@/components/docs/theme-provider'
import {
  buildThemeVariables,
  defaultThemeState,
  THEME_STORAGE_KEY,
  writeStoredTheme,
} from '@/lib/theme'

function ThemeProbe() {
  const { effectiveMode, update, reset, isDefault, cssText } = useTheme()

  return (
    <div>
      <span data-testid="effective-mode">{effectiveMode}</span>
      <span data-testid="is-default">{String(isDefault)}</span>
      <span data-testid="css-text">{cssText}</span>
      <button type="button" onClick={() => update({ mode: 'dark' })}>
        Make dark
      </button>
      <button type="button" onClick={() => update({ themeColor: 'blue' })}>
        Use blue
      </button>
      <button type="button" onClick={reset}>
        Reset
      </button>
    </div>
  )
}

function renderProvider() {
  return render(
    <ThemeProvider>
      <ThemeProbe />
    </ThemeProvider>,
  )
}

function readStored() {
  return JSON.parse(window.localStorage.getItem(THEME_STORAGE_KEY) ?? 'null')
}

function themeColorMeta() {
  return document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
}

/**
 * A controllable `(prefers-color-scheme: dark)` list. happy-dom owns matchMedia
 * but never matches the query, so system-mode coverage needs this stand-in.
 */
function stubColorScheme(initialDark: boolean) {
  let dark = initialDark
  const listeners = new Set<(event: MediaQueryListEvent) => void>()

  const queryList = {
    get matches() {
      return dark
    },
    media: '',
    onchange: null,
    addEventListener: (
      _type: string,
      listener: (event: MediaQueryListEvent) => void,
    ) => {
      listeners.add(listener)
    },
    removeEventListener: (
      _type: string,
      listener: (event: MediaQueryListEvent) => void,
    ) => {
      listeners.delete(listener)
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => true,
  }

  vi.spyOn(window, 'matchMedia').mockImplementation((query) => {
    queryList.media = query

    return queryList as unknown as MediaQueryList
  })

  return {
    setDark(next: boolean) {
      dark = next

      for (const listener of listeners) {
        listener({ matches: next } as MediaQueryListEvent)
      }
    },
  }
}

beforeEach(() => {
  window.localStorage.clear()
  document.documentElement.className = ''
  document.documentElement.removeAttribute('style')

  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    meta.remove()
  }
})

describe('theme provider', () => {
  it('applies the default theme to the document element', () => {
    renderProvider()

    const variables = buildThemeVariables(defaultThemeState, 'light')

    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('light')
    expect(document.documentElement.style.getPropertyValue('--primary'))
      .toBe(variables['--primary'])
    expect(document.documentElement.style.getPropertyValue('--background'))
      .toBe(variables['--background'])
    expect(screen.getByTestId('effective-mode').textContent).toBe('light')
    expect(screen.getByTestId('is-default').textContent).toBe('true')
  })

  it('applies and persists a mode change', () => {
    renderProvider()

    fireEvent.click(screen.getByRole('button', { name: 'Make dark' }))

    const state: ThemeState = { ...defaultThemeState, mode: 'dark' }
    const variables = buildThemeVariables(state, 'dark')

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(document.documentElement.style.getPropertyValue('--primary'))
      .toBe(variables['--primary'])
    expect(screen.getByTestId('effective-mode').textContent).toBe('dark')

    const stored = readStored()

    expect(stored).toMatchObject({
      v: 1,
      state,
      effectiveMode: 'dark',
    })
    expect(stored.vars['--primary']).toBe(variables['--primary'])
  })

  it('restores a persisted theme on mount', () => {
    const state: ThemeState = {
      ...defaultThemeState,
      mode: 'dark',
      themeColor: 'blue',
      radius: 'large',
      font: 'figtree',
    }

    writeStoredTheme(state, 'dark')
    renderProvider()

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.getPropertyValue('--primary'))
      .toBe(buildThemeVariables(state, 'dark')['--primary'])
    expect(document.documentElement.style.getPropertyValue('--radius'))
      .toBe('0.875rem')
    expect(document.documentElement.style.getPropertyValue('--font-sans'))
      .toContain('Figtree Variable')
  })

  it('follows the system preference while the mode is system', () => {
    const media = stubColorScheme(false)

    renderProvider()
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    act(() => {
      media.setDark(true)
    })

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')
  })

  it('ignores the system preference when a mode is pinned', () => {
    const media = stubColorScheme(false)

    renderProvider()
    fireEvent.click(screen.getByRole('button', { name: 'Make dark' }))

    act(() => {
      media.setDark(false)
    })

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(screen.getByTestId('effective-mode').textContent).toBe('dark')
  })

  it('mirrors a theme another tab persisted', () => {
    renderProvider()

    const state: ThemeState = { ...defaultThemeState, themeColor: 'rose' }

    writeStoredTheme(state, 'light')

    const storageEvent = new Event('storage')
    Object.defineProperty(storageEvent, 'key', {
      value: THEME_STORAGE_KEY,
    })

    act(() => {
      window.dispatchEvent(storageEvent)
    })

    expect(document.documentElement.style.getPropertyValue('--primary'))
      .toBe(buildThemeVariables(state, 'light')['--primary'])
  })

  it('resets every token to the default', () => {
    renderProvider()
    fireEvent.click(screen.getByRole('button', { name: 'Make dark' }))
    fireEvent.click(screen.getByRole('button', { name: 'Use blue' }))

    expect(screen.getByTestId('is-default').textContent).toBe('false')

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))

    expect(screen.getByTestId('is-default').textContent).toBe('true')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.style.getPropertyValue('--primary'))
      .toBe(buildThemeVariables(defaultThemeState, 'light')['--primary'])
    expect(readStored().state).toEqual(defaultThemeState)
  })

  it('keeps the browser chrome colour in sync with the mode', () => {
    renderProvider()

    expect(themeColorMeta()?.content).toBe('#ffffff')

    fireEvent.click(screen.getByRole('button', { name: 'Make dark' }))

    expect(themeColorMeta()?.content).toBe('#191a19')
  })

  it('exposes paste-ready CSS for the current state', () => {
    renderProvider()

    const variables = buildThemeVariables(defaultThemeState, 'light')
    const cssText = screen.getByTestId('css-text').textContent ?? ''

    expect(cssText).toContain('src/styles.css')
    expect(cssText).toContain(':root {')
    expect(cssText).toContain('.dark {')
    expect(cssText).toContain(variables['--primary'])
  })

  it('throws a clear error outside the provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<ThemeProbe />)).toThrow(
      'useTheme must be used within a ThemeProvider',
    )

    consoleError.mockRestore()
  })
})
