import type { ComponentProps } from 'react'
import type { ThemeMode } from '@/lib/theme'
import type { ThemeTransitionOrigin } from '@/lib/theme-transition'
import { cn } from 'cn'
import { CheckIcon, CopyIcon, MonitorIcon, MoonIcon, PaletteIcon, SunIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  baseColors,
  chartColors,
  colorLabels,
  fontLabels,
  fonts,
  headingFontLabels,
  headingFonts,
  modeLabels,
  radii,
  radiusLabels,
  swatchColor,
  themeColors,
  themeModes,
} from '@/lib/theme'
import { originFromEvent } from '@/lib/theme-transition'
import { useTheme } from './theme-provider'

const fontOptions = fonts.map(font => ({ label: fontLabels[font], value: font }))
const headingFontOptions = headingFonts.map(font => ({
  label: headingFontLabels[font],
  value: font,
}))

const chartColorClasses = [
  'bg-chart-1',
  'bg-chart-2',
  'bg-chart-3',
  'bg-chart-4',
  'bg-chart-5',
]

function ModeIcon({ mode }: { mode: ThemeMode }) {
  if (mode === 'light') {
    return <SunIcon />
  }

  if (mode === 'dark') {
    return <MoonIcon />
  }

  return <MonitorIcon />
}

type SwatchKind = 'base' | 'theme' | 'chart'

interface SwatchProps {
  kind: SwatchKind
  name: string
  selected: boolean
  onSelect: () => void
}

function Swatch({ kind, name, selected, onSelect }: SwatchProps) {
  const label = colorLabels[name]

  return (
    <button
      type="button"
      title={label}
      aria-pressed={selected}
      data-slot="theme-swatch"
      data-color={name}
      onClick={onSelect}
      className={cn(
        'size-6 rounded-full border border-foreground/10 transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover',
        selected && 'ring-2 ring-foreground ring-offset-2 ring-offset-popover',
      )}
      style={{
        backgroundColor: swatchColor(kind, name),
      }}
    >
      <span className="sr-only">{label}</span>
    </button>
  )
}

interface SwatchGridProps<T extends string> {
  label: string
  kind: SwatchKind
  names: readonly T[]
  selected: T
  onSelect: (name: T) => void
}

function SwatchGrid<T extends string>({
  label,
  kind,
  names,
  selected,
  onSelect,
}: SwatchGridProps<T>) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-8 gap-2">
      {names.map(name => (
        <Swatch
          key={name}
          kind={kind}
          name={name}
          selected={name === selected}
          onSelect={() => onSelect(name)}
        />
      ))}
    </div>
  )
}

type PanelSectionProps = ComponentProps<'section'> & {
  'label': string
  'data-section': string
}

function PanelSection({ label, children, ...props }: PanelSectionProps) {
  return (
    <section
      data-slot="theme-customizer-section"
      className="flex flex-col gap-3 border-t p-4"
      {...props}
    >
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </h3>
      {children}
    </section>
  )
}

/**
 * A miniature of the docs surfaces so the tokens are visible while the panel is
 * open: primary/secondary actions, the card surface, muted text and the charts.
 */
function ThemePreview() {
  return (
    <section
      data-slot="theme-preview"
      aria-label="Theme preview"
      className="p-4"
    >
      <div className="rounded-lg border bg-card p-3 text-card-foreground">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="font-heading text-sm font-medium">Preview</span>
            <span className="text-xs text-muted-foreground">
              Tokens update as you pick.
            </span>
          </div>
          <span aria-hidden="true" className="size-6 rounded-full bg-primary" />
        </div>
        {/* Decorative samples: kept out of the focus order so the panel's real
            controls come first. */}
        <div
          aria-hidden="true"
          className="mt-3 flex flex-wrap items-center gap-1.5"
        >
          <span className={buttonVariants({ size: 'xs' })}>Primary</span>
          <span className={buttonVariants({ size: 'xs', variant: 'secondary' })}>
            Secondary
          </span>
        </div>
        <div aria-hidden="true" className="mt-3 flex items-center gap-1">
          {chartColorClasses.map(className => (
            <span
              key={className}
              className={cn('h-1.5 flex-1 rounded-full', className)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Header trigger plus the right-hand panel that edits the docs theme. The panel
 * reads and writes the provider state directly, so nothing is duplicated here.
 */
export function ThemeCustomizer() {
  const { state, update, reset, isDefault, cssText } = useTheme()
  const [copied, setCopied] = useState(false)
  // The point of the click that picked a mode. Captured in the capture phase so
  // it is already known when Base UI reports the value change, and used to grow
  // the light/dark reveal out of the toggle that was pressed.
  const modeOriginRef = useRef<ThemeTransitionOrigin | undefined>(undefined)

  useEffect(() => {
    if (!copied) {
      return
    }

    const timeout = setTimeout(setCopied, 2000, false)

    return () => clearTimeout(timeout)
  }, [copied])

  const handleModeChange = (groupValue: string[]) => {
    const mode = themeModes.find(candidate => candidate === groupValue[0])

    if (mode) {
      update({ mode }, modeOriginRef.current)
    }
  }

  const handleRadiusChange = (groupValue: string[]) => {
    const radius = radii.find(candidate => candidate === groupValue[0])

    if (radius) {
      update({ radius })
    }
  }

  const handleFontChange = (value: string | null) => {
    const font = fonts.find(candidate => candidate === value)

    if (font) {
      update({ font })
    }
  }

  const handleHeadingFontChange = (value: string | null) => {
    const fontHeading = headingFonts.find(candidate => candidate === value)

    if (fontHeading) {
      update({ fontHeading })
    }
  }

  const handleCopyCss = () => {
    navigator.clipboard
      .writeText(cssText)
      .then(() => setCopied(true))
      .catch(() => {})
  }

  return (
    <Sheet>
      <SheetTrigger
        aria-label="Customize theme"
        title="Customize theme"
        render={<Button variant="ghost" size="icon-sm" />}
      >
        <PaletteIcon />
      </SheetTrigger>
      <SheetContent
        side="right"
        className="gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="border-b pr-10">
          <SheetTitle>Customize</SheetTitle>
          <SheetDescription>
            Preview and adjust the theme tokens used by the docs.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ThemePreview />
          <PanelSection label="Mode" data-section="mode">
            <ToggleGroup
              aria-label="Color mode"
              className="w-full"
              size="sm"
              variant="outline"
              value={[state.mode]}
              onClickCapture={(event) => {
                modeOriginRef.current = originFromEvent(event)
              }}
              onValueChange={handleModeChange}
            >
              {themeModes.map(mode => (
                <ToggleGroupItem
                  key={mode}
                  className="flex-1 aria-pressed:border-foreground aria-pressed:bg-secondary aria-pressed:font-semibold aria-pressed:text-secondary-foreground"
                  value={mode}
                >
                  <ModeIcon mode={mode} />
                  {modeLabels[mode]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </PanelSection>
          <PanelSection label="Base color" data-section="base-color">
            <SwatchGrid
              label="Base colors"
              kind="base"
              names={baseColors}
              selected={state.baseColor}
              onSelect={baseColor => update({ baseColor })}
            />
            <p className="text-xs text-muted-foreground">
              {colorLabels[state.baseColor]}
            </p>
          </PanelSection>
          <PanelSection label="Theme color" data-section="theme-color">
            <SwatchGrid
              label="Theme colors"
              kind="theme"
              names={themeColors}
              selected={state.themeColor}
              onSelect={themeColor => update({ themeColor })}
            />
            <p className="text-xs text-muted-foreground">
              {colorLabels[state.themeColor]}
            </p>
          </PanelSection>
          <PanelSection label="Chart color" data-section="chart-color">
            <SwatchGrid
              label="Chart colors"
              kind="chart"
              names={chartColors}
              selected={state.chartColor}
              onSelect={chartColor => update({ chartColor })}
            />
            <p className="text-xs text-muted-foreground">
              {colorLabels[state.chartColor]}
            </p>
          </PanelSection>
          <PanelSection label="Radius" data-section="radius">
            <ToggleGroup
              aria-label="Corner radius"
              className="w-full"
              size="sm"
              variant="outline"
              value={[state.radius]}
              onValueChange={handleRadiusChange}
            >
              {radii.map(radius => (
                <ToggleGroupItem
                  key={radius}
                  className="flex-1 aria-pressed:border-foreground aria-pressed:bg-secondary aria-pressed:font-semibold aria-pressed:text-secondary-foreground"
                  value={radius}
                >
                  {radiusLabels[radius]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </PanelSection>
          <PanelSection label="Typography" data-section="typography">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">Font</span>
              <Select
                items={fontOptions}
                value={state.font}
                onValueChange={handleFontChange}
              >
                <SelectTrigger aria-label="Font" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-muted-foreground">
                Heading font
              </span>
              <Select
                items={headingFontOptions}
                value={state.fontHeading}
                onValueChange={handleHeadingFontChange}
              >
                <SelectTrigger aria-label="Heading font" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {headingFontOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </PanelSection>
        </div>
        <SheetFooter className="flex-row items-center justify-between border-t">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isDefault}
            onClick={event => reset(originFromEvent(event))}
          >
            Reset
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-copied={copied || undefined}
            onClick={handleCopyCss}
          >
            {copied
              ? <CheckIcon />
              : <CopyIcon />}
            {copied ? 'Copied' : 'Copy CSS'}
          </Button>
          <span aria-live="polite" className="sr-only">
            {copied ? 'Copied' : ''}
          </span>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
