import { THEME_STORAGE_KEY } from './theme'

/**
 * Inline script for the document head. It runs before hydration and before the
 * first paint, so a persisted theme never flashes the default palette: the
 * cached tokens are replayed onto `<html>` and the `dark` class is derived from
 * the stored mode (re-resolving "system" against the current OS preference).
 *
 * Kept as a hand-written string with no imports beyond the storage key so the
 * same code path can be injected by the router's head config.
 */
export const themeBootScript = `(function () {
  try {
    var root = document.documentElement
    var raw = window.localStorage.getItem('${THEME_STORAGE_KEY}')
    if (!raw) return
    var saved = JSON.parse(raw)
    if (!saved || saved.v !== 1 || !saved.state) return
    var mode = saved.state.mode
    if (mode === 'system') {
      var media = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')
      mode = media && media.matches ? 'dark' : 'light'
    }
    if (mode !== 'dark') mode = 'light'
    root.classList.toggle('dark', mode === 'dark')
    root.style.colorScheme = mode
    var vars = saved.vars
    if (!vars || typeof vars !== 'object') return
    for (var name in vars) {
      if (Object.prototype.hasOwnProperty.call(vars, name)) root.style.setProperty(name, vars[name])
    }
  } catch {
    // The boot script must never break the page.
  }
})()`
