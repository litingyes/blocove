import { MoonIcon, SunIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from './theme-provider'

/**
 * Header control that flips between light and dark. The icons are chosen by CSS
 * instead of React state, so the inline boot script shows the right one before
 * hydration and the button markup is identical on the server.
 */
export function ThemeToggle() {
  const { effectiveMode, update } = useTheme()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={() => {
        update({
          mode: effectiveMode === 'dark'
            ? 'light'
            : 'dark',
        })
      }}
    >
      <SunIcon className="hidden dark:block" />
      <MoonIcon className="block dark:hidden" />
    </Button>
  )
}
