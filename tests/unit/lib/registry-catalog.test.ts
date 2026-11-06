import type { RegistryItem } from '@/lib/registry-catalog'
import { describe, expect, it } from 'vitest'
import {
  docsItemPath,
  docsKindOfItem,
  docsKinds,
  docsMarkdownPath,
  groupItemsByType,
  installedFilePath,
  itemTypeOrder,
} from '@/lib/registry-catalog'

function makeItem(name: string, type: string): RegistryItem {
  return {
    name,
    type,
    title: name,
    description: '',
    dependencies: [],
    registryDependencies: [],
    categories: [],
    files: [],
  }
}

describe('installedFilePath', () => {
  it('prefers the explicit target', () => {
    expect(
      installedFilePath(
        { type: 'registry:ui' },
        { path: 'ui/rich-text-editor/bold.tsx', target: 'components/blocove/rich-text-editor/bold.tsx' },
      ),
    ).toBe('components/blocove/rich-text-editor/bold.tsx')
  })

  it('keeps nested folders under the ui alias root', () => {
    expect(
      installedFilePath(
        { type: 'registry:ui' },
        { path: 'ui/rich-text-editor/bold.tsx', target: null },
      ),
    ).toBe('components/ui/rich-text-editor/bold.tsx')
  })

  it('keeps lib files flat under lib', () => {
    expect(
      installedFilePath(
        { type: 'registry:lib' },
        { path: 'lib/rich-text-editor-extension.ts', target: null },
      ),
    ).toBe('lib/rich-text-editor-extension.ts')
  })

  it('installs blocks under components', () => {
    expect(
      installedFilePath(
        { type: 'registry:block' },
        { path: 'blocks/rich-text-editor-playground.tsx', target: null },
      ),
    ).toBe('components/rich-text-editor-playground.tsx')
  })

  it('installs hooks under hooks', () => {
    expect(
      installedFilePath(
        { type: 'registry:hook' },
        { path: 'hooks/use-mobile.ts', target: null },
      ),
    ).toBe('hooks/use-mobile.ts')
  })

  it('falls back to the last segment when the alias folder is missing', () => {
    expect(
      installedFilePath(
        { type: 'registry:ui' },
        { path: 'editor/bold.tsx', target: null },
      ),
    ).toBe('components/ui/bold.tsx')
  })

  it('returns the alias root when the path is only the alias folder', () => {
    expect(
      installedFilePath(
        { type: 'registry:hook' },
        { path: 'hooks', target: null },
      ),
    ).toBe('hooks')
  })

  it('returns the source path for types without an alias root', () => {
    expect(
      installedFilePath(
        { type: 'registry:theme' },
        { path: 'styles/theme.css', target: null },
      ),
    ).toBe('styles/theme.css')
  })
})

describe('docs kinds', () => {
  it('documents blocks under their own section and everything else as a component', () => {
    expect(docsKinds).toEqual(['components', 'blocks'])
    expect(docsKindOfItem({ type: 'registry:block' })).toBe('blocks')
    expect(docsKindOfItem({ type: 'registry:ui' })).toBe('components')
    expect(docsKindOfItem({ type: 'registry:lib' })).toBe('components')
  })

  it('builds the page and markdown routes from the kind', () => {
    expect(docsItemPath('components', 'code-editor')).toBe('/components/code-editor')
    expect(docsItemPath('blocks', 'video-hero')).toBe('/blocks/video-hero')
    expect(docsMarkdownPath('components', 'code-editor')).toBe('/components/code-editor.md')
    expect(docsMarkdownPath('blocks', 'video-hero')).toBe('/blocks/video-hero.md')
  })
})

describe('groupItemsByType', () => {
  it('groups items in the documented order', () => {
    const items = [
      makeItem('bold', 'registry:ui'),
      makeItem('base', 'registry:base'),
      makeItem('playground', 'registry:block'),
      makeItem('extension', 'registry:lib'),
    ]

    const groups = groupItemsByType(items)

    expect([
      ...groups.keys(),
    ]).toEqual([
      'registry:base',
      'registry:ui',
      'registry:block',
      'registry:lib',
    ])
    expect(groups.get('registry:ui')?.map(item => item.name)).toEqual(['bold'])
  })

  it('omits empty types and keeps unknown types in an other group', () => {
    const items = [
      makeItem('unknown', 'registry:page'),
      makeItem('bold', 'registry:ui'),
    ]

    const groups = groupItemsByType(items)

    expect(groups.has('registry:block')).toBe(false)
    expect(groups.has('registry:page')).toBe(false)
    expect(groups.get('other')?.map(item => item.name)).toEqual(['unknown'])
    expect(itemTypeOrder).toContain('registry:theme')
  })
})
