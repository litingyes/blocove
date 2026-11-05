// Theme engine for the docs site customizer. The palette follows the shadcn
// "theme customizer" model: a separate base color tints the neutral surfaces, a
// theme color drives primary/ring, and a chart color drives the chart ramp. Every
// token the app uses is emitted as a CSS custom property so `applyTheme` can
// repaint the page without a stylesheet swap.

export const THEME_STORAGE_KEY = 'blocove:theme'

export const themeModes = ['light', 'dark', 'system'] as const
export const baseColors = [
  'neutral',
  'stone',
  'zinc',
  'gray',
  'mauve',
  'olive',
  'mist',
  'taupe',
] as const
export const themeColors = [
  ...baseColors,
  'amber',
  'blue',
  'cyan',
  'emerald',
  'fuchsia',
  'green',
  'indigo',
  'lime',
  'orange',
  'pink',
  'purple',
  'red',
  'rose',
  'sky',
  'teal',
  'violet',
  'yellow',
] as const
export const radii = ['none', 'small', 'medium', 'large'] as const
export const fonts = [
  'inter',
  'geist',
  'dm-sans',
  'figtree',
  'jetbrains-mono',
] as const
export const headingFonts = ['inherit', 'inter', 'geist', 'lora'] as const

export type ThemeMode = (typeof themeModes)[number]
export type EffectiveMode = 'light' | 'dark'
export type BaseColor = (typeof baseColors)[number]
export type ThemeColor = (typeof themeColors)[number]
export type ChartColor = ThemeColor
export type Radius = (typeof radii)[number]
export type FontName = (typeof fonts)[number]
export type HeadingFont = (typeof headingFonts)[number]

export const chartColors: readonly ChartColor[] = themeColors

export interface ThemeState {
  mode: ThemeMode
  baseColor: BaseColor
  themeColor: ThemeColor
  chartColor: ChartColor
  radius: Radius
  font: FontName
  fontHeading: HeadingFont
}

export interface StoredTheme {
  v: 1
  state: ThemeState
  effectiveMode: EffectiveMode
  vars: Record<string, string>
}

export const modeLabels: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
}

export const radiusLabels: Record<Radius, string> = {
  none: 'None',
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
}

export const fontLabels: Record<FontName, string> = {
  'inter': 'Inter',
  'geist': 'Geist',
  'dm-sans': 'DM Sans',
  'figtree': 'Figtree',
  'jetbrains-mono': 'JetBrains Mono',
}

export const headingFontLabels: Record<HeadingFont, string> = {
  inherit: 'Inherit',
  inter: 'Inter',
  geist: 'Geist',
  lora: 'Lora',
}

export const colorLabels: Record<string, string> = Object.fromEntries(
  themeColors.map(color => [color, `${color.charAt(0).toUpperCase()}${color.slice(1)}`]),
)

export const defaultThemeState: ThemeState = {
  mode: 'system',
  baseColor: 'neutral',
  themeColor: 'neutral',
  chartColor: 'neutral',
  radius: 'medium',
  font: 'inter',
  fontHeading: 'inherit',
}

interface PaletteEntry {
  hue: number
  chroma: number
}

// One hue/chroma pair per color name; the base colors are desaturated, the
// accent colors keep a real chroma so primary and charts read as "colored".
const colorPalette = {
  neutral: { hue: 0, chroma: 0 },
  stone: { hue: 60, chroma: 0.004 },
  zinc: { hue: 240, chroma: 0.004 },
  gray: { hue: 220, chroma: 0.004 },
  mauve: { hue: 330, chroma: 0.007 },
  olive: { hue: 110, chroma: 0.006 },
  mist: { hue: 200, chroma: 0.006 },
  taupe: { hue: 40, chroma: 0.006 },
  amber: { hue: 70, chroma: 0.16 },
  blue: { hue: 260, chroma: 0.21 },
  cyan: { hue: 200, chroma: 0.12 },
  emerald: { hue: 160, chroma: 0.15 },
  fuchsia: { hue: 320, chroma: 0.23 },
  green: { hue: 145, chroma: 0.16 },
  indigo: { hue: 275, chroma: 0.2 },
  lime: { hue: 130, chroma: 0.17 },
  orange: { hue: 55, chroma: 0.18 },
  pink: { hue: 350, chroma: 0.19 },
  purple: { hue: 300, chroma: 0.22 },
  red: { hue: 25, chroma: 0.2 },
  rose: { hue: 355, chroma: 0.17 },
  sky: { hue: 240, chroma: 0.14 },
  teal: { hue: 180, chroma: 0.14 },
  violet: { hue: 285, chroma: 0.23 },
  yellow: { hue: 95, chroma: 0.17 },
} satisfies Record<ThemeColor, PaletteEntry>

const radiusValues: Record<Radius, string> = {
  none: '0rem',
  small: '0.45rem',
  medium: '0.625rem',
  large: '0.875rem',
}

const sansFontStacks: Record<FontName, string> = {
  'inter': `'Inter Variable', ui-sans-serif, system-ui, sans-serif`,
  'geist': `'Geist Variable', ui-sans-serif, system-ui, sans-serif`,
  'dm-sans': `'DM Sans Variable', ui-sans-serif, system-ui, sans-serif`,
  'figtree': `'Figtree Variable', ui-sans-serif, system-ui, sans-serif`,
  'jetbrains-mono': `'JetBrains Mono Variable', ui-monospace, SFMono-Regular, monospace`,
}

const headingFontStacks: Record<HeadingFont, string> = {
  inherit: 'var(--font-sans)',
  inter: sansFontStacks.inter,
  geist: sansFontStacks.geist,
  lora: `'Lora Variable', ui-serif, Georgia, serif`,
}

const fontPackages: Record<FontName, string> = {
  'inter': '@fontsource-variable/inter',
  'geist': '@fontsource-variable/geist',
  'dm-sans': '@fontsource-variable/dm-sans',
  'figtree': '@fontsource-variable/figtree',
  'jetbrains-mono': '@fontsource-variable/jetbrains-mono',
}

const headingFontPackages: Record<Exclude<HeadingFont, 'inherit'>, string> = {
  inter: fontPackages.inter,
  geist: fontPackages.geist,
  lora: '@fontsource-variable/lora',
}

const chartLightnessByMode: Record<EffectiveMode, readonly number[]> = {
  light: [0.646, 0.6, 0.398, 0.828, 0.769],
  dark: [0.488, 0.696, 0.769, 0.627, 0.645],
}

// The neutral chart ramp matches the greys already shipped in src/styles.css, so
// the default theme keeps every chart token identical to the current site.
const neutralChartLightness: readonly number[] = [0.87, 0.556, 0.439, 0.371, 0.269]
const chartHueOffsets: readonly number[] = [0, 40, 80, 160, 240]
const chartChromaFactors: readonly number[] = [1, 0.9, 0.8, 0.85, 0.95]

const effectiveModes: readonly EffectiveMode[] = ['light', 'dark']

// Swatch rendering only. The base colors carry chromas around 0.004-0.007,
// which is invisible on a small dot, so the picker amplifies them for display;
// the emitted tokens always keep the real palette values.
const SWATCH_BASE_LIGHTNESS = 0.9
const SWATCH_BASE_CHROMA_AMPLIFIER = 12
const SWATCH_ACCENT_LIGHTNESS = 0.62
const SWATCH_ACCENT_MIN_CHROMA = 0.07
const SWATCH_FALLBACK = 'oklch(0.62 0 0)'

function oklch(lightness: number, chroma: number, hue: number): string {
  return `oklch(${lightness} ${chroma} ${hue})`
}

function roundChroma(chroma: number): number {
  return Math.round(chroma * 1000) / 1000
}

function isThemeColor(value: string): value is ThemeColor {
  return (themeColors as readonly string[]).includes(value)
}

function buildChartVariables(chart: PaletteEntry, mode: EffectiveMode): Record<string, string> {
  const variables: Record<string, string> = {}
  const lightnesses = chartLightnessByMode[mode]

  for (let index = 0; index < lightnesses.length; index += 1) {
    const name = `--chart-${index + 1}`

    if (chart.chroma === 0) {
      variables[name] = oklch(neutralChartLightness[index], 0, 0)
    }
    else {
      variables[name] = oklch(
        lightnesses[index],
        roundChroma(chart.chroma * chartChromaFactors[index]),
        chart.hue + chartHueOffsets[index],
      )
    }
  }

  return variables
}

function renderThemeVariables(variables: Record<string, string>): string {
  return Object.entries(variables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n')
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function pickOption<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  if (typeof value !== 'string') {
    return fallback
  }

  return options.find(option => option === value) ?? fallback
}

function pickStringRecord(value: Record<string, unknown>): Record<string, string> {
  const result: Record<string, string> = {}

  for (const [name, entry] of Object.entries(value)) {
    if (typeof entry === 'string') {
      result[name] = entry
    }
  }

  return result
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  }
  catch {
    // Storage access can throw when cookies or storage are blocked.
    return null
  }
}

/**
 * A representative color for a color-picker swatch. Unknown names and names
 * outside the requested group fall back to a neutral grey so a bad string can
 * never render an invisible swatch. Chroma is amplified for display only: the
 * base colors are intentionally almost grey as tokens, so a raw swatch would be
 * indistinguishable between neutral, stone, zinc, gray, mauve, olive, mist, and
 * taupe. Tokens built by `buildThemeVariables` keep the real palette values.
 */
export function swatchColor(kind: 'base' | 'theme' | 'chart', name: string): string {
  const allowed: readonly string[] = kind === 'base'
    ? baseColors
    : kind === 'theme'
      ? themeColors
      : chartColors

  if (!isThemeColor(name) || !allowed.includes(name)) {
    return SWATCH_FALLBACK
  }

  const { hue, chroma } = colorPalette[name]

  if (kind === 'base') {
    return oklch(SWATCH_BASE_LIGHTNESS, roundChroma(chroma * SWATCH_BASE_CHROMA_AMPLIFIER), hue)
  }

  return oklch(SWATCH_ACCENT_LIGHTNESS, chroma === 0
    ? 0
    : Math.max(chroma, SWATCH_ACCENT_MIN_CHROMA), hue)
}

/**
 * Every token the site consumes for a state/mode pair. `src/styles.css` ships the
 * same 32 surface tokens for the defaults; the two app font stacks are additive.
 */
export function buildThemeVariables(state: ThemeState, mode: EffectiveMode): Record<string, string> {
  const base = colorPalette[state.baseColor]
  const theme = colorPalette[state.themeColor]
  const chart = colorPalette[state.chartColor]
  const light = mode === 'light'
  const neutralTheme = theme.chroma === 0

  const background = light
    ? 'oklch(1 0 0)'
    : oklch(0.145, base.chroma, base.hue)
  const foreground = light
    ? oklch(0.145, base.chroma, base.hue)
    : 'oklch(0.985 0 0)'
  const card = light
    ? background
    : oklch(0.205, base.chroma, base.hue)
  const sidebar = light
    ? oklch(0.985, base.chroma, base.hue)
    : card
  const secondary = oklch(light ? 0.97 : 0.269, base.chroma, base.hue)
  const secondaryForeground = light
    ? oklch(0.205, base.chroma, base.hue)
    : foreground
  const mutedForeground = oklch(light ? 0.556 : 0.708, base.chroma, base.hue)
  const border = light
    ? oklch(0.922, base.chroma, base.hue)
    : 'oklch(1 0 0 / 10%)'
  const input = light ? border : 'oklch(1 0 0 / 15%)'
  const ring = oklch(light ? 0.708 : 0.556, theme.chroma, theme.hue)
  const destructive = light ? 'oklch(0.577 0.245 27.325)' : 'oklch(0.704 0.191 22.216)'

  let primary: string
  let primaryForeground: string

  if (neutralTheme) {
    primary = light ? 'oklch(0.205 0 0)' : 'oklch(0.922 0 0)'
    primaryForeground = light ? 'oklch(0.985 0 0)' : 'oklch(0.205 0 0)'
  }
  else {
    primary = oklch(light ? 0.55 : 0.63, theme.chroma, theme.hue)
    primaryForeground = 'oklch(0.985 0 0)'
  }

  return {
    '--background': background,
    '--foreground': foreground,
    '--card': card,
    '--card-foreground': foreground,
    '--popover': card,
    '--popover-foreground': foreground,
    '--primary': primary,
    '--primary-foreground': primaryForeground,
    '--secondary': secondary,
    '--secondary-foreground': secondaryForeground,
    '--muted': secondary,
    '--muted-foreground': mutedForeground,
    '--accent': secondary,
    '--accent-foreground': secondaryForeground,
    '--destructive': destructive,
    '--border': border,
    '--input': input,
    '--ring': ring,
    ...buildChartVariables(chart, mode),
    '--radius': radiusValues[state.radius],
    '--sidebar': sidebar,
    '--sidebar-foreground': foreground,
    '--sidebar-primary': primary,
    '--sidebar-primary-foreground': primaryForeground,
    '--sidebar-accent': secondary,
    '--sidebar-accent-foreground': secondaryForeground,
    '--sidebar-border': border,
    '--sidebar-ring': ring,
    '--font-sans': sansFontStacks[state.font],
    '--font-heading': headingFontStacks[state.fontHeading],
  }
}

/**
 * Writes the theme onto a root element: the `dark` class drives Tailwind's
 * variant, `color-scheme` lets the browser paint form controls, and every token
 * becomes an inline custom property on the element.
 */
export function applyTheme(root: HTMLElement, state: ThemeState, mode: EffectiveMode): void {
  root.classList.toggle('dark', mode === 'dark')
  root.style.colorScheme = mode

  for (const [name, value] of Object.entries(buildThemeVariables(state, mode))) {
    root.style.setProperty(name, value)
  }
}

/**
 * Paste-ready CSS for the current state, including the font packages the result
 * depends on. Both modes are emitted so the snippet can replace the two blocks
 * in `src/styles.css` wholesale.
 */
export function themeCssText(state: ThemeState): string {
  const packages = new Set<string>([fontPackages[state.font]])

  if (state.fontHeading !== 'inherit') {
    packages.add(headingFontPackages[state.fontHeading])
  }

  return [
    '/* Blocove theme preset. Paste into src/styles.css.',
    ' * Required font packages:',
    ...[...packages].map(packageName => ` *   ${packageName}`),
    ' */',
    ':root {',
    renderThemeVariables(buildThemeVariables(state, 'light')),
    '}',
    '',
    '.dark {',
    renderThemeVariables(buildThemeVariables(state, 'dark')),
    '}',
    '',
  ].join('\n')
}

export function resolveEffectiveMode(mode: ThemeMode, systemMode: EffectiveMode): EffectiveMode {
  return mode === 'system'
    ? systemMode
    : mode
}

export function resolveSystemMode(): EffectiveMode {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }

  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  catch {
    // Embedded and test environments can throw on matchMedia; light is safe.
    return 'light'
  }
}

/**
 * Reads the persisted theme. A missing, unreadable, corrupt, or non-v1 entry is
 * rejected outright; within a valid v1 entry every field falls back to its
 * default so a partial write can never produce an invalid state.
 */
export function readStoredTheme(): StoredTheme | null {
  const storage = getStorage()

  if (!storage) {
    return null
  }

  let raw: string | null

  try {
    raw = storage.getItem(THEME_STORAGE_KEY)
  }
  catch {
    // Reading can throw in private mode or when storage is partitioned away.
    return null
  }

  if (!raw) {
    return null
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  }
  catch {
    // A corrupt entry is treated as empty instead of breaking the page.
    return null
  }

  if (!isRecord(parsed) || parsed.v !== 1) {
    return null
  }

  const stored = isRecord(parsed.state)
    ? parsed.state
    : {}
  const state: ThemeState = {
    mode: pickOption(stored.mode, themeModes, defaultThemeState.mode),
    baseColor: pickOption(stored.baseColor, baseColors, defaultThemeState.baseColor),
    themeColor: pickOption(stored.themeColor, themeColors, defaultThemeState.themeColor),
    chartColor: pickOption(stored.chartColor, chartColors, defaultThemeState.chartColor),
    radius: pickOption(stored.radius, radii, defaultThemeState.radius),
    font: pickOption(stored.font, fonts, defaultThemeState.font),
    fontHeading: pickOption(stored.fontHeading, headingFonts, defaultThemeState.fontHeading),
  }
  const effectiveMode = pickOption(
    parsed.effectiveMode,
    effectiveModes,
    resolveEffectiveMode(state.mode, resolveSystemMode()),
  )
  const cached = isRecord(parsed.vars)
    ? pickStringRecord(parsed.vars)
    : {}
  const vars = Object.keys(cached).length > 0
    ? cached
    : buildThemeVariables(state, effectiveMode)

  return { v: 1, state, effectiveMode, vars }
}

/** Persists the state plus the resolved mode and the token cache read at boot. */
export function writeStoredTheme(state: ThemeState, mode: EffectiveMode): void {
  const storage = getStorage()

  if (!storage) {
    return
  }

  const stored: StoredTheme = {
    v: 1,
    state,
    effectiveMode: mode,
    vars: buildThemeVariables(state, mode),
  }

  try {
    storage.setItem(THEME_STORAGE_KEY, JSON.stringify(stored))
  }
  catch {
    // Quota and private-mode failures must not break the customizer.
  }
}

export function clearStoredTheme(): void {
  const storage = getStorage()

  if (!storage) {
    return
  }

  try {
    storage.removeItem(THEME_STORAGE_KEY)
  }
  catch {
    // Nothing useful to do when the browser refuses to clear storage.
  }
}
