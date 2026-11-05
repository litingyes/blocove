import type { EffectiveMode, StoredTheme, ThemeState } from '@/lib/theme'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  applyTheme,
  baseColors,
  buildThemeVariables,
  chartColors,
  clearStoredTheme,
  colorLabels,
  defaultThemeState,
  fontLabels,
  fonts,
  headingFontLabels,
  headingFonts,
  modeLabels,
  radii,
  radiusLabels,
  readStoredTheme,
  resolveEffectiveMode,
  resolveSystemMode,
  swatchColor,
  THEME_STORAGE_KEY,
  themeColors,
  themeCssText,
  themeModes,
  writeStoredTheme,
} from '@/lib/theme'

const stylesSource = readFileSync(path.join(process.cwd(), 'src/styles.css'), 'utf8')

// The 32 surface tokens src/styles.css ships plus the two app font stacks.
const expectedVariableNames = [
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--popover',
  '--popover-foreground',
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--destructive',
  '--border',
  '--input',
  '--ring',
  '--chart-1',
  '--chart-2',
  '--chart-3',
  '--chart-4',
  '--chart-5',
  '--radius',
  '--sidebar',
  '--sidebar-foreground',
  '--sidebar-primary',
  '--sidebar-primary-foreground',
  '--sidebar-accent',
  '--sidebar-accent-foreground',
  '--sidebar-border',
  '--sidebar-ring',
  '--font-sans',
  '--font-heading',
]

function cssVariables(source: string, selector: string): Record<string, string> {
  const start = source.indexOf(`${selector} {`)
  const end = source.indexOf('}', start)
  if (start < 0 || end < 0) {
    throw new Error(`Missing ${selector} block`)
  }

  const variables: Record<string, string> = {}
  for (const match of source.slice(start, end).matchAll(/(--[\w-]+):([^;]+);/g)) {
    variables[match[1]] = match[2].trim()
  }

  return variables
}

function cssBlock(source: string, selector: string): Record<string, string> {
  const start = source.indexOf(`${selector} {`)
  const end = source.indexOf('\n}', start)
  if (start < 0 || end < 0) {
    throw new Error(`Missing ${selector} block`)
  }

  const variables: Record<string, string> = {}
  for (const line of source.slice(start, end).split('\n').slice(1)) {
    const match = /^ {2}(--[\w-]+): (.+);$/.exec(line)
    if (match) {
      variables[match[1]] = match[2]
    }
  }

  return variables
}

function withOverrides(overrides: Partial<ThemeState>): ThemeState {
  return {
    ...defaultThemeState,
    ...overrides,
  }
}

function expectCompleteVariables(state: ThemeState, mode: EffectiveMode): void {
  const variables = buildThemeVariables(state, mode)
  expect(Object.keys(variables).sort(), `${mode} ${JSON.stringify(state)}`)
    .toEqual([...expectedVariableNames].sort())
}

function stylesOf(element: HTMLElement): Record<string, string> {
  const styles: Record<string, string> = {}
  for (let index = 0; index < element.style.length; index += 1) {
    const name = element.style.item(index)
    styles[name] = element.style.getPropertyValue(name)
  }
  return styles
}

describe('option metadata', () => {
  it('uses the namespaced storage key', () => {
    expect(THEME_STORAGE_KEY).toBe('blocove:theme')
  })

  it('lists every option in the documented order', () => {
    expect(themeModes).toEqual(['light', 'dark', 'system'])
    expect(baseColors).toEqual([
      'neutral',
      'stone',
      'zinc',
      'gray',
      'mauve',
      'olive',
      'mist',
      'taupe',
    ])
    expect(themeColors).toEqual([
      'neutral',
      'stone',
      'zinc',
      'gray',
      'mauve',
      'olive',
      'mist',
      'taupe',
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
    ])
    expect(chartColors).toEqual(themeColors)
    expect(radii).toEqual(['none', 'small', 'medium', 'large'])
    expect(fonts).toEqual([
      'inter',
      'geist',
      'dm-sans',
      'figtree',
      'jetbrains-mono',
    ])
    expect(headingFonts).toEqual(['inherit', 'inter', 'geist', 'lora'])
  })

  it('ships the documented default state', () => {
    expect(defaultThemeState).toEqual({
      mode: 'system',
      baseColor: 'neutral',
      themeColor: 'neutral',
      chartColor: 'neutral',
      radius: 'medium',
      font: 'inter',
      fontHeading: 'inherit',
    })
  })

  it('labels every option', () => {
    expect(modeLabels).toEqual({ light: 'Light', dark: 'Dark', system: 'System' })
    expect(radiusLabels).toEqual({
      none: 'None',
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
    })
    expect(fontLabels).toEqual({
      'inter': 'Inter',
      'geist': 'Geist',
      'dm-sans': 'DM Sans',
      'figtree': 'Figtree',
      'jetbrains-mono': 'JetBrains Mono',
    })
    expect(headingFontLabels).toEqual({
      inherit: 'Inherit',
      inter: 'Inter',
      geist: 'Geist',
      lora: 'Lora',
    })
  })

  it('title-cases every color name and nothing else', () => {
    expect(Object.keys(colorLabels)).toHaveLength(themeColors.length)

    for (const color of themeColors) {
      expect(colorLabels[color]).toBe(`${color.charAt(0).toUpperCase()}${color.slice(1)}`)
    }

    expect(colorLabels['dm-sans']).toBeUndefined()
    expect(colorLabels.lora).toBeUndefined()
  })
})

describe('default parity with src/styles.css', () => {
  const lightVariables = buildThemeVariables(defaultThemeState, 'light')
  const darkVariables = buildThemeVariables(defaultThemeState, 'dark')
  const stylesLight = cssVariables(stylesSource, ':root')
  const stylesDark = cssVariables(stylesSource, '.dark')

  it('emits the styles.css tokens plus the app font stacks', () => {
    // styles.css defines the two font tokens in :root and keeps the radius
    // there only, while the engine emits the full set in both modes.
    const withEngineExtras = (names: string[]) => [
      ...new Set([
        ...names,
        '--radius',
        '--font-heading',
        '--font-sans',
      ]),
    ].sort()

    expect(Object.keys(lightVariables).sort()).toEqual(withEngineExtras(Object.keys(stylesLight)))
    expect(Object.keys(darkVariables).sort()).toEqual(withEngineExtras(Object.keys(stylesDark)))
  })

  it('reproduces every light token byte for byte', () => {
    for (const [name, value] of Object.entries(stylesLight)) {
      expect(lightVariables[name], name).toBe(value)
    }
  })

  it('reproduces every dark token except the documented sidebar-primary pair', () => {
    // styles.css still carries the shadcn leftover blue sidebar-primary pair.
    // The engine normalises both tokens to the theme color, which also keeps
    // primary-foreground readable against the light neutral primary.
    const exceptions = ['--sidebar-primary', '--sidebar-primary-foreground']

    expect(stylesDark['--sidebar-primary']).toBe('oklch(0.488 0.243 264.376)')
    expect(stylesDark['--sidebar-primary-foreground']).toBe('oklch(0.985 0 0)')
    expect(darkVariables['--sidebar-primary']).toBe('oklch(0.922 0 0)')
    expect(darkVariables['--sidebar-primary-foreground']).toBe('oklch(0.205 0 0)')

    for (const [name, value] of Object.entries(stylesDark)) {
      if (exceptions.includes(name)) {
        continue
      }
      expect(darkVariables[name], name).toBe(value)
    }

    const deviations = Object.keys(stylesDark).filter(name => darkVariables[name] !== stylesDark[name])
    expect(deviations.sort()).toEqual(exceptions)
  })
})

describe('buildThemeVariables', () => {
  it('emits all 34 tokens, including the leading -- on every key', () => {
    const variables = buildThemeVariables(defaultThemeState, 'light')

    expect(Object.keys(variables)).toHaveLength(expectedVariableNames.length)
    expect(Object.keys(variables).sort()).toEqual([...expectedVariableNames].sort())

    for (const [name, value] of Object.entries(variables)) {
      expect(name.startsWith('--')).toBe(true)

      if (name !== '--font-sans' && name !== '--font-heading' && name !== '--radius') {
        expect(value).toMatch(/^oklch\(/)
      }
    }
  })

  it('emits the full token set for every option value in both modes', () => {
    for (const mode of ['light', 'dark'] as const) {
      for (const baseColor of baseColors) {
        expectCompleteVariables(withOverrides({ baseColor }), mode)
      }
      for (const themeColor of themeColors) {
        expectCompleteVariables(withOverrides({ themeColor }), mode)
      }
      for (const chartColor of chartColors) {
        expectCompleteVariables(withOverrides({ chartColor }), mode)
      }
      for (const radius of radii) {
        expectCompleteVariables(withOverrides({ radius }), mode)
      }
      for (const font of fonts) {
        expectCompleteVariables(withOverrides({ font }), mode)
      }
      for (const fontHeading of headingFonts) {
        expectCompleteVariables(withOverrides({ fontHeading }), mode)
      }
    }
  })

  it('keeps theme and chart choices independent', () => {
    for (const themeColor of themeColors) {
      for (const chartColor of chartColors) {
        expectCompleteVariables(withOverrides({ themeColor, chartColor }), 'light')
        expectCompleteVariables(withOverrides({ themeColor, chartColor }), 'dark')
      }
    }
  })

  it('keeps the neutral defaults on the styles.css values', () => {
    const light = buildThemeVariables(defaultThemeState, 'light')
    const dark = buildThemeVariables(defaultThemeState, 'dark')

    expect(light['--background']).toBe('oklch(1 0 0)')
    expect(light['--foreground']).toBe('oklch(0.145 0 0)')
    expect(light['--primary']).toBe('oklch(0.205 0 0)')
    expect(light['--ring']).toBe('oklch(0.708 0 0)')
    expect(light['--radius']).toBe('0.625rem')

    expect(dark['--background']).toBe('oklch(0.145 0 0)')
    expect(dark['--foreground']).toBe('oklch(0.985 0 0)')
    expect(dark['--primary']).toBe('oklch(0.922 0 0)')
    expect(dark['--primary-foreground']).toBe('oklch(0.205 0 0)')
    expect(dark['--border']).toBe('oklch(1 0 0 / 10%)')
    expect(dark['--input']).toBe('oklch(1 0 0 / 15%)')
  })

  it('tints the neutral surfaces with the base color', () => {
    const light = buildThemeVariables(withOverrides({ baseColor: 'stone' }), 'light')
    const dark = buildThemeVariables(withOverrides({ baseColor: 'stone' }), 'dark')

    expect(light['--background']).toBe('oklch(1 0 0)')
    expect(light['--foreground']).toBe('oklch(0.145 0.004 60)')
    expect(light['--secondary']).toBe('oklch(0.97 0.004 60)')
    expect(light['--secondary-foreground']).toBe('oklch(0.205 0.004 60)')
    expect(light['--muted-foreground']).toBe('oklch(0.556 0.004 60)')
    expect(light['--border']).toBe('oklch(0.922 0.004 60)')
    expect(light['--sidebar']).toBe('oklch(0.985 0.004 60)')

    expect(dark['--background']).toBe('oklch(0.145 0.004 60)')
    expect(dark['--foreground']).toBe('oklch(0.985 0 0)')
    expect(dark['--card']).toBe('oklch(0.205 0.004 60)')
    expect(dark['--muted-foreground']).toBe('oklch(0.708 0.004 60)')
    expect(dark['--border']).toBe('oklch(1 0 0 / 10%)')
    expect(dark['--sidebar']).toBe('oklch(0.205 0.004 60)')
  })

  it('derives primary and ring from a chromatic theme color', () => {
    const light = buildThemeVariables(withOverrides({ themeColor: 'blue' }), 'light')
    const dark = buildThemeVariables(withOverrides({ themeColor: 'blue' }), 'dark')

    expect(light['--primary']).toBe('oklch(0.55 0.21 260)')
    expect(light['--primary-foreground']).toBe('oklch(0.985 0 0)')
    expect(light['--ring']).toBe('oklch(0.708 0.21 260)')
    expect(light['--sidebar-primary']).toBe('oklch(0.55 0.21 260)')

    expect(dark['--primary']).toBe('oklch(0.63 0.21 260)')
    expect(dark['--primary-foreground']).toBe('oklch(0.985 0 0)')
    expect(dark['--ring']).toBe('oklch(0.556 0.21 260)')
    expect(dark['--sidebar-primary-foreground']).toBe('oklch(0.985 0 0)')
  })

  it('builds the chart ramp from lightness, hue offsets, and chroma factors', () => {
    const light = buildThemeVariables(withOverrides({ chartColor: 'blue' }), 'light')
    const dark = buildThemeVariables(withOverrides({ chartColor: 'blue' }), 'dark')

    expect([
      light['--chart-1'],
      light['--chart-2'],
      light['--chart-3'],
      light['--chart-4'],
      light['--chart-5'],
    ]).toEqual([
      'oklch(0.646 0.21 260)',
      'oklch(0.6 0.189 300)',
      'oklch(0.398 0.168 340)',
      'oklch(0.828 0.179 420)',
      'oklch(0.769 0.199 500)',
    ])

    expect([
      dark['--chart-1'],
      dark['--chart-2'],
      dark['--chart-3'],
      dark['--chart-4'],
      dark['--chart-5'],
    ]).toEqual([
      'oklch(0.488 0.21 260)',
      'oklch(0.696 0.189 300)',
      'oklch(0.769 0.168 340)',
      'oklch(0.627 0.179 420)',
      'oklch(0.645 0.199 500)',
    ])
  })

  it('keeps the neutral chart ramp on the styles.css greys', () => {
    const greys = [
      'oklch(0.87 0 0)',
      'oklch(0.556 0 0)',
      'oklch(0.439 0 0)',
      'oklch(0.371 0 0)',
      'oklch(0.269 0 0)',
    ]

    for (const mode of ['light', 'dark'] as const) {
      const variables = buildThemeVariables(defaultThemeState, mode)
      expect([
        variables['--chart-1'],
        variables['--chart-2'],
        variables['--chart-3'],
        variables['--chart-4'],
        variables['--chart-5'],
      ])
        .toEqual(greys)
    }
  })

  it('keeps the destructive color fixed in both modes', () => {
    expect(buildThemeVariables(defaultThemeState, 'light')['--destructive']).toBe('oklch(0.577 0.245 27.325)')
    expect(buildThemeVariables(defaultThemeState, 'dark')['--destructive']).toBe('oklch(0.704 0.191 22.216)')
  })

  it('maps every radius to its token value', () => {
    expect(radiusValues().none).toBe('0rem')
    expect(radiusValues().small).toBe('0.45rem')
    expect(radiusValues().medium).toBe('0.625rem')
    expect(radiusValues().large).toBe('0.875rem')
  })

  it('maps every sans font to a font stack', () => {
    expect(fontStack('inter')).toBe('\'Inter Variable\', ui-sans-serif, system-ui, sans-serif')
    expect(fontStack('geist')).toBe('\'Geist Variable\', ui-sans-serif, system-ui, sans-serif')
    expect(fontStack('dm-sans')).toBe('\'DM Sans Variable\', ui-sans-serif, system-ui, sans-serif')
    expect(fontStack('figtree')).toBe('\'Figtree Variable\', ui-sans-serif, system-ui, sans-serif')
    expect(fontStack('jetbrains-mono')).toBe('\'JetBrains Mono Variable\', ui-monospace, SFMono-Regular, monospace')
  })

  it('maps every heading font to a font stack', () => {
    expect(headingStack('inherit')).toBe('var(--font-sans)')
    expect(headingStack('inter')).toBe('\'Inter Variable\', ui-sans-serif, system-ui, sans-serif')
    expect(headingStack('geist')).toBe('\'Geist Variable\', ui-sans-serif, system-ui, sans-serif')
    expect(headingStack('lora')).toBe('\'Lora Variable\', ui-serif, Georgia, serif')
  })
})

function radiusValues(): Record<string, string> {
  const variables: Record<string, string> = {}
  for (const radius of radii) {
    variables[radius] = buildThemeVariables(withOverrides({ radius }), 'light')['--radius']
  }
  return variables
}

function fontStack(font: (typeof fonts)[number]): string {
  return buildThemeVariables(withOverrides({ font }), 'light')['--font-sans']
}

function headingStack(fontHeading: (typeof headingFonts)[number]): string {
  return buildThemeVariables(withOverrides({ fontHeading }), 'light')['--font-heading']
}

describe('applyTheme', () => {
  it('applies the dark class, the color scheme, and every token', () => {
    const root = document.createElement('div')

    applyTheme(root, defaultThemeState, 'dark')

    expect(root.classList.contains('dark')).toBe(true)
    expect(root.style.colorScheme).toBe('dark')

    const variables = buildThemeVariables(defaultThemeState, 'dark')
    expect(stylesOf(root)).toEqual({ 'color-scheme': 'dark', ...variables })

    for (const [name, value] of Object.entries(variables)) {
      expect(root.style.getPropertyValue(name), name).toBe(value)
    }
  })

  it('removes the dark class and repaints when switching back to light', () => {
    const root = document.createElement('div')

    applyTheme(root, defaultThemeState, 'dark')
    applyTheme(root, withOverrides({ themeColor: 'blue', radius: 'large' }), 'light')

    expect(root.classList.contains('dark')).toBe(false)
    expect(root.style.colorScheme).toBe('light')
    expect(root.style.getPropertyValue('--primary')).toBe('oklch(0.55 0.21 260)')
    expect(root.style.getPropertyValue('--radius')).toBe('0.875rem')
    expect(root.style.getPropertyValue('--background')).toBe('oklch(1 0 0)')
  })

  it('works on the document element', () => {
    applyTheme(document.documentElement, defaultThemeState, 'dark')

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.getPropertyValue('--background')).toBe('oklch(0.145 0 0)')

    document.documentElement.className = ''
    document.documentElement.removeAttribute('style')
  })
})

describe('themeCssText', () => {
  it('returns paste-ready CSS with both mode blocks', () => {
    const text = themeCssText(defaultThemeState)

    expect(text.startsWith('/* Blocove theme preset.')).toBe(true)
    expect(text).toContain(':root {')
    expect(text).toContain('.dark {')
    expect(cssBlock(text, ':root')).toEqual(buildThemeVariables(defaultThemeState, 'light'))
    expect(cssBlock(text, '.dark')).toEqual(buildThemeVariables(defaultThemeState, 'dark'))
    expect(text.match(/^ {2}--/gm)).toHaveLength(expectedVariableNames.length * 2)
  })

  it('lists the font packages the emitted CSS depends on', () => {
    const text = themeCssText(defaultThemeState)

    expect(text).toContain('Required font packages:')
    expect(text).toContain('@fontsource-variable/inter')
    expect(text).not.toContain('@fontsource-variable/lora')
    expect(text).not.toContain('@fontsource-variable/jetbrains-mono')
  })

  it('lists the packages for a mono body and a serif heading', () => {
    const text = themeCssText(withOverrides({ font: 'jetbrains-mono', fontHeading: 'lora' }))

    expect(text).toContain('@fontsource-variable/jetbrains-mono')
    expect(text).toContain('@fontsource-variable/lora')
    expect(cssBlock(text, ':root')['--font-heading']).toBe('\'Lora Variable\', ui-serif, Georgia, serif')
  })

  it('deduplicates a package shared by the body and heading fonts', () => {
    const text = themeCssText(withOverrides({ font: 'geist', fontHeading: 'geist' }))

    expect(text.split('@fontsource-variable/geist')).toHaveLength(2)
  })
})

describe('swatchColor', () => {
  it('renders base colors as tinted light surfaces with amplified chroma', () => {
    // Display only: the base tokens keep chromas around 0.004-0.007, which would
    // be invisible at swatch size, so the picker multiplies them by 12.
    expect(swatchColor('base', 'neutral')).toBe('oklch(0.9 0 0)')
    expect(swatchColor('base', 'stone')).toBe('oklch(0.9 0.048 60)')
    expect(swatchColor('base', 'zinc')).toBe('oklch(0.9 0.048 240)')
    expect(swatchColor('base', 'gray')).toBe('oklch(0.9 0.048 220)')
    expect(swatchColor('base', 'mauve')).toBe('oklch(0.9 0.084 330)')
    expect(swatchColor('base', 'olive')).toBe('oklch(0.9 0.072 110)')
    expect(swatchColor('base', 'mist')).toBe('oklch(0.9 0.072 200)')
    expect(swatchColor('base', 'taupe')).toBe('oklch(0.9 0.072 40)')
  })

  it('keeps neutral grey while tinting the near-neutral base colors', () => {
    const chromaOf = (value: string) => Number(value.split(' ')[1])

    expect(chromaOf(swatchColor('base', 'neutral'))).toBe(0)
    expect(chromaOf(swatchColor('base', 'mauve'))).toBeGreaterThan(chromaOf(swatchColor('base', 'neutral')))
    expect(chromaOf(swatchColor('base', 'olive'))).toBeGreaterThan(chromaOf(swatchColor('base', 'neutral')))
  })

  it('renders theme and chart swatches at accent lightness with a minimum chroma', () => {
    expect(swatchColor('theme', 'neutral')).toBe('oklch(0.62 0 0)')
    expect(swatchColor('chart', 'neutral')).toBe('oklch(0.62 0 0)')
    expect(swatchColor('theme', 'blue')).toBe('oklch(0.62 0.21 260)')
    expect(swatchColor('chart', 'violet')).toBe('oklch(0.62 0.23 285)')

    // Base colors reused as an accent color get the minimum display chroma.
    expect(swatchColor('theme', 'stone')).toBe('oklch(0.62 0.07 60)')
    expect(swatchColor('theme', 'mauve')).toBe('oklch(0.62 0.07 330)')
    expect(swatchColor('chart', 'mist')).toBe('oklch(0.62 0.07 200)')
  })

  it('accepts every color in the matching group', () => {
    for (const color of baseColors) {
      expect(swatchColor('base', color)).toMatch(/^oklch\(0\.9 [\d.]+ \d+\)$/)
    }
    for (const color of themeColors) {
      expect(swatchColor('theme', color)).toMatch(/^oklch\(0\.62 [\d.]+ \d+\)$/)
      expect(swatchColor('chart', color)).toMatch(/^oklch\(0\.62 [\d.]+ \d+\)$/)
    }
  })

  it('falls back to neutral grey for unknown or out-of-group names', () => {
    expect(swatchColor('base', 'blue')).toBe('oklch(0.62 0 0)')
    expect(swatchColor('base', '')).toBe('oklch(0.62 0 0)')
    expect(swatchColor('theme', 'not-a-color')).toBe('oklch(0.62 0 0)')
    expect(swatchColor('chart', 'Inter')).toBe('oklch(0.62 0 0)')
  })
})

describe('resolveEffectiveMode', () => {
  it('returns the explicit mode as-is', () => {
    expect(resolveEffectiveMode('light', 'dark')).toBe('light')
    expect(resolveEffectiveMode('dark', 'light')).toBe('dark')
  })

  it('follows the system mode only for system', () => {
    expect(resolveEffectiveMode('system', 'dark')).toBe('dark')
    expect(resolveEffectiveMode('system', 'light')).toBe('light')
  })
})

describe('resolveSystemMode', () => {
  it('defaults to light when the media query does not match', () => {
    expect(window.matchMedia('(prefers-color-scheme: dark)').matches).toBe(false)
    expect(resolveSystemMode()).toBe('light')
  })

  it('reports dark when the media query matches', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as unknown as MediaQueryList)

    expect(resolveSystemMode()).toBe('dark')
  })

  it('defaults to light when matchMedia is missing', () => {
    const original = window.matchMedia
    Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: undefined })

    try {
      expect(resolveSystemMode()).toBe('light')
    }
    finally {
      window.matchMedia = original
    }
  })

  it('defaults to light when matchMedia throws', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(() => {
      throw new Error('matchMedia unavailable')
    })

    expect(resolveSystemMode()).toBe('light')
  })
})

describe('theme storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('round-trips a theme through localStorage', () => {
    const state = withOverrides({
      mode: 'dark',
      baseColor: 'stone',
      themeColor: 'blue',
      chartColor: 'violet',
      radius: 'small',
      font: 'geist',
      fontHeading: 'lora',
    })
    const expected: StoredTheme = {
      v: 1,
      state,
      effectiveMode: 'dark',
      vars: buildThemeVariables(state, 'dark'),
    }

    writeStoredTheme(state, 'dark')

    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw ?? '')).toEqual(expected)
    expect(readStoredTheme()).toEqual(expected)
  })

  it('returns null when nothing is stored', () => {
    expect(readStoredTheme()).toBeNull()
  })

  it('clears the stored theme', () => {
    writeStoredTheme(defaultThemeState, 'light')

    clearStoredTheme()

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull()
    expect(readStoredTheme()).toBeNull()
  })

  it('rejects corrupt JSON', () => {
    localStorage.setItem(THEME_STORAGE_KEY, '{not-json')

    expect(readStoredTheme()).toBeNull()
  })

  it('rejects non-object payloads', () => {
    for (const payload of ['null', '"theme"', '42', '[]']) {
      localStorage.setItem(THEME_STORAGE_KEY, payload)
      expect(readStoredTheme(), payload).toBeNull()
    }
  })

  it('rejects a stale version', () => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ v: 2, state: defaultThemeState }))

    expect(readStoredTheme()).toBeNull()
  })

  it('rejects an empty string entry', () => {
    localStorage.setItem(THEME_STORAGE_KEY, '')

    expect(readStoredTheme()).toBeNull()
  })

  it('falls back per field for unknown enum values', () => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({
      v: 1,
      state: {
        mode: 'sepia',
        baseColor: 'zinc',
        themeColor: 'chartreuse',
        chartColor: 'blue',
        radius: 'huge',
        font: 'comic-sans',
        fontHeading: 'lora',
      },
      effectiveMode: 'blue',
      vars: { '--background': 'red' },
    }))

    expect(readStoredTheme()).toEqual({
      v: 1,
      state: {
        mode: 'system',
        baseColor: 'zinc',
        themeColor: 'neutral',
        chartColor: 'blue',
        radius: 'medium',
        font: 'inter',
        fontHeading: 'lora',
      },
      effectiveMode: 'light',
      vars: { '--background': 'red' },
    })
  })

  it('resolves the system mode when the stored effective mode is invalid', () => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ v: 1, state: defaultThemeState, effectiveMode: 'blue' }))
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as unknown as MediaQueryList)

    expect(readStoredTheme()?.effectiveMode).toBe('dark')
  })

  it('rebuilds the token cache when the stored state is not an object', () => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ v: 1, state: 'dark', effectiveMode: 'dark' }))

    expect(readStoredTheme()).toEqual({
      v: 1,
      state: defaultThemeState,
      effectiveMode: 'dark',
      vars: buildThemeVariables(defaultThemeState, 'dark'),
    })
  })

  it('rebuilds the token cache when the stored cache is missing or empty', () => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ v: 1, state: defaultThemeState, effectiveMode: 'light' }))
    expect(readStoredTheme()?.vars).toEqual(buildThemeVariables(defaultThemeState, 'light'))

    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({
      v: 1,
      state: defaultThemeState,
      effectiveMode: 'light',
      vars: {},
    }))
    expect(readStoredTheme()?.vars).toEqual(buildThemeVariables(defaultThemeState, 'light'))

    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({
      v: 1,
      state: defaultThemeState,
      effectiveMode: 'light',
      vars: 'nope',
    }))
    expect(readStoredTheme()?.vars).toEqual(buildThemeVariables(defaultThemeState, 'light'))
  })

  it('keeps only string entries from a stored token cache', () => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({
      v: 1,
      state: defaultThemeState,
      effectiveMode: 'light',
      vars: { '--background': 1, '--foreground': 'oklch(0.145 0 0)' },
    }))

    expect(readStoredTheme()?.vars).toEqual({ '--foreground': 'oklch(0.145 0 0)' })
  })

  it('treats an unreadable localStorage as empty and ignores write failures', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('storage blocked')
    })

    expect(readStoredTheme()).toBeNull()
    expect(() => writeStoredTheme(defaultThemeState, 'light')).not.toThrow()
    expect(() => clearStoredTheme()).not.toThrow()
  })

  it('ignores getItem, setItem, and removeItem failures', () => {
    const failingStorage = {
      getItem: () => {
        throw new Error('read blocked')
      },
      setItem: () => {
        throw new Error('quota exceeded')
      },
      removeItem: () => {
        throw new Error('delete blocked')
      },
    } as unknown as Storage
    vi.spyOn(window, 'localStorage', 'get').mockReturnValue(failingStorage)

    expect(readStoredTheme()).toBeNull()
    expect(() => writeStoredTheme(defaultThemeState, 'light')).not.toThrow()
    expect(() => clearStoredTheme()).not.toThrow()
  })

  it('degrades gracefully without a window', () => {
    vi.stubGlobal('window', undefined)

    try {
      expect(readStoredTheme()).toBeNull()
      expect(() => writeStoredTheme(defaultThemeState, 'light')).not.toThrow()
      expect(() => clearStoredTheme()).not.toThrow()
      expect(resolveSystemMode()).toBe('light')
    }
    finally {
      vi.unstubAllGlobals()
    }
  })
})
