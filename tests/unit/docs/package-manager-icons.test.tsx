import type { PackageManager } from '@/lib/docs-commands'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PackageManagerIcon } from '@/components/docs/package-manager-icons'
import { packageManagers } from '@/lib/docs-commands'

/**
 * Renders one mark and returns its wrapper, failing loudly if the component
 * ever stops emitting the slot the installation tabs style against.
 */
function renderIcon(manager: PackageManager, className?: string) {
  const { container } = render(
    <PackageManagerIcon manager={manager} className={className} />,
  )
  const wrapper = container.querySelector<HTMLElement>(
    '[data-slot="package-manager-icon"]',
  )

  if (!wrapper) {
    throw new Error(`PackageManagerIcon rendered no wrapper for ${manager}`)
  }

  return wrapper
}

function pathData(wrapper: HTMLElement) {
  const paths = Array.from(wrapper.querySelectorAll('path'))

  return paths.map(path => path.getAttribute('d') ?? '')
}

describe('packageManagerIcon', () => {
  it('renders a decorative brand mark for every package manager', () => {
    for (const manager of packageManagers) {
      const wrapper = renderIcon(manager)
      const svg = wrapper.querySelector('svg')

      expect(wrapper.getAttribute('aria-hidden')).toBe('true')
      expect(wrapper.dataset.manager).toBe(manager)
      expect(svg).not.toBeNull()
      expect(svg?.getAttribute('aria-hidden')).toBe('true')
      expect(svg?.getAttribute('viewBox')).toBe('0 0 32 32')
      // Sizing belongs to Tailwind class names, never to the SVG attributes.
      expect(svg?.hasAttribute('width')).toBe(false)
      expect(svg?.hasAttribute('height')).toBe(false)
      expect(pathData(wrapper).length).toBeGreaterThan(0)
    }
  })

  it('draws different artwork for each package manager', () => {
    const marks = packageManagers.map(manager =>
      pathData(renderIcon(manager)).join('|'))

    expect(new Set(marks).size).toBe(packageManagers.length)
  })

  it('lets the caller override the size through the wrapper', () => {
    const wrapper = renderIcon('bun', 'size-6')

    expect(wrapper.className).toContain('inline-flex')
    expect(wrapper.className).toContain('size-6')
    expect(wrapper.className).not.toContain('size-4')
  })
})
