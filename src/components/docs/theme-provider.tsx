import type { ReactNode } from 'react'
import type { EffectiveMode, ThemeState } from '@/lib/theme'
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'
import {
  applyTheme,
  defaultThemeState,
  readStoredTheme,
  resolveEffectiveMode,
  resolveSystemMode,
  THEME_STORAGE_KEY,
  themeCssText,
  writeStoredTheme,
} from '@/lib/theme'

interface ThemeContextValue {
  /** The full theme configuration, the single source of truth for the panel. */
  state: ThemeState
  /** The resolved mode: `mode: 'system'` is reduced to light or dark. */
  effectiveMode: EffectiveMode
  /** Merges a partial theme configuration into the current one. */
  update: (patch: Partial<ThemeState>) => void
  /** Returns every token to its default value. */
  reset: () => void
  /** Whether the current configuration matches the defaults. */
  isDefault: boolean
  /** Paste-ready CSS for the current configuration. */
  cssText: string
}

/** Mirrors the root route's meta tag so the browser chrome follows the mode. */
const themeColorByMode: Record<EffectiveMode, string> = {
  light: '#ffffff',
  dark: '#191a19',
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const systemModeQuery = '(prefers-color-scheme: dark)'

/**
 * Storage is browser-only, so the server always starts from the defaults. The
 * boot script has already painted the persisted theme before hydration, which
 * keeps the first client render a pure state read.
 */
function readInitialState(): ThemeState {
  if (typeof window === 'undefined') {
    return defaultThemeState
  }

  return readStoredTheme()?.state ?? defaultThemeState
}

function subscribeToSystemMode(onChange: () => void): () => void {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return () => {}
  }

  const query = window.matchMedia(systemModeQuery)
  query.addEventListener('change', onChange)

  return () => query.removeEventListener('change', onChange)
}

/**
 * The live OS preference. Reading it on every render is also what validates the
 * effectiveMode cached in storage: the media query may have flipped while the
 * tab was closed, and the live value has to win over the stale cache.
 */
function getSystemMode(): EffectiveMode {
  return resolveSystemMode()
}

function getServerSystemMode(): EffectiveMode {
  return 'light'
}

function isDefaultState(state: ThemeState): boolean {
  return (Object.keys(defaultThemeState) as (keyof ThemeState)[]).every(
    key => state[key] === defaultThemeState[key],
  )
}

/**
 * Owns the docs-site theme. The provider renders no markup of its own, so
 * hydrating it cannot mismatch the server output; consumers style themselves
 * with the tokens applied to `<html>`.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ThemeState>(readInitialState)
  const systemMode = useSyncExternalStore(
    subscribeToSystemMode,
    getSystemMode,
    getServerSystemMode,
  )
  const effectiveMode = resolveEffectiveMode(state.mode, systemMode)

  // Paint the tokens onto <html> and persist them. The boot script already
  // applied the cached variables before hydration, so this keeps React state,
  // the DOM and storage aligned on every change.
  useEffect(() => {
    applyTheme(document.documentElement, state, effectiveMode)
    writeStoredTheme(state, effectiveMode)
  }, [state, effectiveMode])

  // Mirror a theme another tab persisted (or cleared).
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== THEME_STORAGE_KEY) {
        return
      }

      setState(readStoredTheme()?.state ?? defaultThemeState)
    }

    window.addEventListener('storage', handleStorage)

    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Keep the browser chrome colour in sync with the resolved mode.
  useEffect(() => {
    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    )

    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'theme-color'
      document.head.append(meta)
    }

    meta.content = themeColorByMode[effectiveMode]
  }, [effectiveMode])

  const update = useCallback((patch: Partial<ThemeState>) => {
    setState(previous => ({
      ...previous,
      ...patch,
    }))
  }, [])

  const reset = useCallback(() => {
    setState(defaultThemeState)
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      state,
      effectiveMode,
      update,
      reset,
      isDefault: isDefaultState(state),
      cssText: themeCssText(state),
    }),
    [state, effectiveMode, update, reset],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}

// The context stays private so the provider and its hook are one module; that is
// worth a full reload during development instead of splitting the file.
// eslint-disable-next-line react-refresh/only-export-components -- see above.
export function useTheme(): ThemeContextValue {
  const context = use(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}

export type { ThemeContextValue }
