import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { page } from 'vitest/browser'
import { ThemeCustomizer } from '@/components/docs/theme-customizer'
import { ThemeProvider } from '@/components/docs/theme-provider'
import { ThemeToggle } from '@/components/docs/theme-toggle'
import {
  buildThemeVariables,
  defaultThemeState,
  readStoredTheme,
  resolveEffectiveMode,
  resolveSystemMode,
  themeCssText,
} from '@/lib/theme'

function renderCustomizer() {
  return render(
    <ThemeProvider>
      <ThemeCustomizer />
    </ThemeProvider>,
  )
}

function panel() {
  return page.getByRole('dialog')
}

function swatch(section: string, color: string) {
  const element = document.querySelector(
    `[data-section="${section}"] [data-color="${color}"]`,
  )

  if (!element) {
    throw new Error(`Could not find the ${color} swatch in ${section}`)
  }

  return page.elementLocator(element)
}

function token(name: string) {
  return document.documentElement.style.getPropertyValue(name)
}

function effectiveMode() {
  return resolveEffectiveMode(defaultThemeState.mode, resolveSystemMode())
}

async function openPanel() {
  await page.getByRole('button', { name: 'Customize theme' }).click()
  await expect.element(panel()).toBeVisible()
}

/**
 * The component test page does not load the docs stylesheet, so Base UI's modal
 * backdrop (`position: fixed` with no z-index from Tailwind) stays on top of the
 * portalled panel and swallows pointer events. Panel layout and surface styling
 * are verified against the running docs site; this suite drives behaviour, so it
 * lets pointer events fall through the unstyled backdrop.
 */
function allowPointerEventsThroughBackdrop() {
  const style = document.createElement('style')
  style.textContent = '[data-base-ui-inert]{pointer-events:none}'
  document.head.append(style)

  return style
}

let backdropShim: HTMLStyleElement

beforeEach(() => {
  backdropShim = allowPointerEventsThroughBackdrop()
  window.localStorage.clear()
  document.documentElement.className = ''
  document.documentElement.removeAttribute('style')

  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    meta.remove()
  }
})

afterEach(() => {
  backdropShim.remove()
  vi.restoreAllMocks()
})

it('opens a right-hand panel with every theme control', async () => {
  await renderCustomizer()
  await openPanel()

  await expect.element(panel()).toHaveAttribute('data-side', 'right')
  await expect.element(page.getByRole('heading', { name: 'Customize' }))
    .toBeVisible()

  for (const label of [
    'Mode',
    'Base color',
    'Theme color',
    'Chart color',
    'Radius',
    'Typography',
  ]) {
    await expect.element(page.getByRole('heading', { name: label }))
      .toBeVisible()
  }

  const swatches = (section: string) =>
    document.querySelectorAll(
      `[data-section="${section}"] [data-slot="theme-swatch"]`,
    ).length

  expect(swatches('base-color')).toBe(8)
  expect(swatches('theme-color')).toBe(25)
  expect(swatches('chart-color')).toBe(25)

  await expect.element(page.getByRole('button', { name: 'Light' })).toBeVisible()
  await expect.element(page.getByRole('button', { name: 'Reset' })).toBeVisible()
})

it('paints base, theme and chart colors as they are picked', async () => {
  await renderCustomizer()
  await openPanel()

  const mode = effectiveMode()

  await swatch('theme-color', 'blue').click()

  const blue = buildThemeVariables(
    { ...defaultThemeState, themeColor: 'blue' },
    mode,
  )

  await expect.poll(() => token('--primary')).toBe(blue['--primary'])
  await expect.element(swatch('theme-color', 'blue')).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  expect(document.querySelector('[data-section="theme-color"] p')?.textContent)
    .toBe('Blue')

  await swatch('base-color', 'stone').click()

  const stone = buildThemeVariables(
    { ...defaultThemeState, baseColor: 'stone', themeColor: 'blue' },
    mode,
  )

  await expect.poll(() => token('--secondary')).toBe(stone['--secondary'])
  await expect.element(swatch('base-color', 'stone')).toHaveAttribute(
    'aria-pressed',
    'true',
  )

  await swatch('chart-color', 'amber').click()

  const amber = buildThemeVariables(
    {
      ...defaultThemeState,
      baseColor: 'stone',
      chartColor: 'amber',
      themeColor: 'blue',
    },
    mode,
  )

  await expect.poll(() => token('--chart-1')).toBe(amber['--chart-1'])

  const stored = readStoredTheme()

  expect(stored?.state).toMatchObject({
    baseColor: 'stone',
    chartColor: 'amber',
    themeColor: 'blue',
  })
  expect(stored?.vars['--primary']).toBe(blue['--primary'])
  expect(stored?.vars['--chart-1']).toBe(amber['--chart-1'])
})

it('switches to dark and restores the theme after a remount', async () => {
  const first = await renderCustomizer()
  await openPanel()

  await page.getByRole('button', { name: 'Dark' }).click()

  const dark = buildThemeVariables({ ...defaultThemeState, mode: 'dark' }, 'dark')

  await expect.poll(() => document.documentElement.classList.contains('dark'))
    .toBe(true)
  await expect.poll(() => token('--primary')).toBe(dark['--primary'])
  await expect.element(page.getByRole('button', { name: 'Dark' }))
    .toHaveAttribute('aria-pressed', 'true')

  await swatch('theme-color', 'rose').click()

  const rose = buildThemeVariables(
    { ...defaultThemeState, mode: 'dark', themeColor: 'rose' },
    'dark',
  )

  await expect.poll(() => token('--primary')).toBe(rose['--primary'])

  await first.unmount()
  document.documentElement.className = ''
  document.documentElement.removeAttribute('style')

  await renderCustomizer()

  await expect.poll(() => document.documentElement.classList.contains('dark'))
    .toBe(true)
  await expect.poll(() => token('--primary')).toBe(rose['--primary'])

  const stored = readStoredTheme()

  expect(stored?.state).toMatchObject({ mode: 'dark', themeColor: 'rose' })
  expect(stored?.effectiveMode).toBe('dark')
})

it('resets the theme to the defaults', async () => {
  await renderCustomizer()
  await openPanel()

  await page.getByRole('button', { name: 'Dark' }).click()
  await swatch('theme-color', 'blue').click()

  const reset = page.getByRole('button', { name: 'Reset' })

  await expect.element(reset).toBeEnabled()
  await reset.click()

  const mode = effectiveMode()
  const defaults = buildThemeVariables(defaultThemeState, mode)

  await expect.poll(() => document.documentElement.classList.contains('dark'))
    .toBe(mode === 'dark')
  await expect.poll(() => token('--primary')).toBe(defaults['--primary'])
  await expect.element(reset).toBeDisabled()
  expect(readStoredTheme()?.state).toEqual(defaultThemeState)
})

it('copies the paste-ready CSS', async () => {
  const writeText = vi
    .spyOn(navigator.clipboard, 'writeText')
    .mockResolvedValue(undefined)

  await renderCustomizer()
  await openPanel()

  await page.getByRole('button', { name: 'Copy CSS' }).click()

  await expect.element(page.getByRole('button', { name: 'Copied' })).toBeVisible()
  expect(writeText).toHaveBeenCalledWith(themeCssText(defaultThemeState))
})

it('reveals a light/dark switch through the View Transitions API', async () => {
  const startViewTransition = vi
    .spyOn(document, 'startViewTransition')
    .mockImplementation((callbackOptions) => {
      // The real browser invokes the update callback itself and resolves both
      // promises once the snapshots exist. The stub calls it synchronously and
      // resolves immediately so the assertion does not wait on an animation.
      (callbackOptions as ViewTransitionUpdateCallback | undefined)?.()

      return {
        ready: Promise.resolve(),
        finished: Promise.resolve(),
      } as unknown as ViewTransition
    })

  await render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  )

  await page.getByRole('button', { name: 'Toggle theme' }).click()

  expect(startViewTransition).toHaveBeenCalledTimes(1)
  await expect.poll(() => document.documentElement.classList.contains('dark'))
    .toBe(true)
})
