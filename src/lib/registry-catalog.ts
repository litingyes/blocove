export interface RegistryFile {
  path: string
  type: string
  target: string | null
}

export interface RegistryItem {
  name: string
  type: string
  title: string
  description: string
  dependencies: string[]
  registryDependencies: string[]
  categories: string[]
  files: RegistryFile[]
}

export interface RegistryCatalog {
  name: string
  homepage: string
  items: RegistryItem[]
}

export const itemTypeOrder = [
  'registry:base',
  'registry:ui',
  'registry:block',
  'registry:theme',
  'registry:lib',
  'registry:hook',
] as const

export const itemTypeLabels: Record<string, string> = {
  'registry:base': 'Base',
  'registry:ui': 'UI',
  'registry:block': 'Blocks',
  'registry:theme': 'Theme',
  'registry:lib': 'Lib',
  'registry:hook': 'Hooks',
}

/**
 * The two documented item kinds. The docs navigation, the header and the routes
 * are split the same way: components are the `registry:ui` pieces, blocks are
 * the `registry:block` compositions built from them.
 */
export const docsKinds = ['components', 'blocks'] as const

export type DocsKind = (typeof docsKinds)[number]

/**
 * The docs section an item belongs to. Only blocks are their own section;
 * everything else that ships a page (the UI items and the helper libs) is a
 * component.
 */
export function docsKindOfItem(item: Pick<RegistryItem, 'type'>): DocsKind {
  return item.type === 'registry:block'
    ? 'blocks'
    : 'components'
}

/** Route of an item's docs page. */
export function docsItemPath(kind: DocsKind, name: string): string {
  return `/${kind}/${name}`
}

/** Route of the plain-markdown form of an item's docs page. */
export function docsMarkdownPath(kind: DocsKind, name: string): string {
  return `/${kind}/${name}.md`
}

// Alias root the CLI falls back to for files without an explicit target. See
// `resolveNestedFilePath` in @shadcn/registry: the installed path keeps
// everything after the alias folder, so nested registry folders survive
// installation. Blocove items always set a target under `components/blocove`
// or `lib/blocove`, so this only covers future items that omit one.
const installedRoots: Record<string, string> = {
  'registry:ui': 'components/ui',
  'registry:lib': 'lib',
  'registry:hook': 'hooks',
  'registry:block': 'components',
  'registry:component': 'components',
}

/**
 * The path a registry file lands on in a consumer project. Mirrors the CLI
 * resolution so the manual installation steps match what `shadcn add` writes.
 */
export function installedFilePath(
  item: Pick<RegistryItem, 'type'>,
  file: Pick<RegistryFile, 'path' | 'target'>,
) {
  if (file.target) {
    return file.target
  }

  const root = installedRoots[item.type]

  if (!root) {
    return file.path
  }

  const segments = file.path.split('/').filter(Boolean)
  const anchor = root.split('/').pop()
  const anchorIndex = anchor
    ? segments.indexOf(anchor)
    : -1
  const relative = anchorIndex === -1
    ? segments.pop()
    : segments.slice(anchorIndex + 1).join('/')

  return relative
    ? `${root}/${relative}`
    : root
}

export function groupItemsByType(items: RegistryItem[]) {
  const groups = new Map<string, RegistryItem[]>()

  for (const type of itemTypeOrder) {
    const group = items.filter(item => item.type === type)
    if (group.length > 0) {
      groups.set(type, group)
    }
  }

  const other = items.filter(
    item =>
      !itemTypeOrder.includes(item.type as (typeof itemTypeOrder)[number]),
  )
  if (other.length > 0) {
    groups.set('other', other)
  }

  return groups
}
