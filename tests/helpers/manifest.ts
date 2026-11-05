import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

// For every source file, its package name and the version the project installs.
export interface ProjectDependencies {
  [packageName: string]: string
}

export interface ManifestFile {
  path: string
  type: string
  target?: string | null
}

export interface ManifestItem {
  name: string
  type: string
  title: string
  description: string
  dependencies?: string[]
  registryDependencies?: string[]
  categories?: string[]
  files?: ManifestFile[]
}

export interface Manifest {
  name: string
  homepage: string
  items: ManifestItem[]
}

export type ImportTarget
  = | { kind: 'blocove', item: string }
    | { kind: 'official', item: string }
    | { kind: 'unknown' }

export const projectRoot = process.cwd()
export const registryRoot = path.join(projectRoot, 'src/registry/blocove')
export const manifestPath = path.join(registryRoot, 'registry.json')
export const rootManifestPath = path.join(projectRoot, 'registry.json')

export function readManifest(): Manifest {
  const registry = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
    name?: string
    homepage?: string
    items: ManifestItem[]
  }
  // The root manifest owns the registry identity; the item manifest only lists
  // the items, so the tests read both and expose one object.
  const root = JSON.parse(fs.readFileSync(rootManifestPath, 'utf8')) as {
    name: string
    homepage: string
  }

  return {
    name: registry.name ?? root.name,
    homepage: registry.homepage ?? root.homepage,
    items: registry.items,
  }
}

export function readProjectPackage(): {
  dependencies?: ProjectDependencies
} {
  return JSON.parse(
    fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'),
  ) as { dependencies?: ProjectDependencies }
}

/** Every registry source file, as a posix path relative to the registry root. */
export function listSourceFiles(root = registryRoot): string[] {
  const files: string[] = []

  const walk = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        walk(fullPath)
        continue
      }

      if (!/\.(?:ts|tsx)$/.test(entry.name)) {
        continue
      }

      files.push(path.relative(registryRoot, fullPath).split(path.sep).join('/'))
    }
  }

  walk(root)

  return files.sort()
}

export function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(registryRoot, relativePath), 'utf8')
}

/** Every module specifier a file imports, including dynamic imports. */
export function extractImportSpecifiers(source: string): string[] {
  const specifiers = new Set<string>()

  for (const match of source.matchAll(/(?:from\s|import\s*\()\s*['"]([^'"]+)['"]/g)) {
    specifiers.add(match[1])
  }

  return [...specifiers]
}

/**
 * Maps every installed file specifier (`@/` + target without its extension) to
 * the item that ships it, so the checks below follow the manifest targets
 * instead of assuming a folder layout.
 */
export function buildAliasMap(manifest: Manifest): Map<string, string> {
  const aliases = new Map<string, string>()

  for (const item of manifest.items) {
    for (const file of item.files ?? []) {
      if (!file.target) {
        continue
      }

      aliases.set(
        `@/${file.target.replace(/\.tsx?$/, '')}`,
        item.name,
      )
    }
  }

  return aliases
}

export function resolveImport(
  specifier: string,
  aliases: Map<string, string>,
): ImportTarget | null {
  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    return null
  }

  if (specifier.startsWith('@/components/ui/')) {
    return {
      kind: 'official',
      item: specifier.slice('@/components/ui/'.length),
    }
  }

  if (specifier.startsWith('@/hooks/')) {
    return {
      kind: 'official',
      item: specifier.slice('@/hooks/'.length),
    }
  }

  if (!specifier.startsWith('@/')) {
    return null
  }

  const item = aliases.get(specifier)

  return item
    ? { kind: 'blocove', item }
    : { kind: 'unknown' }
}

/** The npm package a bare specifier points at. */
export function packageNameOf(specifier: string): string {
  const segments = specifier.split('/')

  return specifier.startsWith('@') && segments.length > 1
    ? `${segments[0]}/${segments[1]}`
    : segments[0]
}

/** `@tiptap/core@3.32.2` -> `@tiptap/core`. */
export function dependencyName(entry: string): string {
  const match = entry.match(/^(@[^/]+\/[^@]+|[^@]+)@(.+)$/)

  return match ? match[1] : entry
}

/** `@tiptap/core@3.32.2` -> `3.32.2`, `cn` -> null. */
export function dependencyVersion(entry: string): string | null {
  const match = entry.match(/^(@[^/]+\/[^@]+|[^@]+)@(.+)$/)

  return match ? match[2] : null
}

export function registryDependencyNames(item: ManifestItem): string[] {
  return (item.registryDependencies ?? []).map(dependency =>
    dependency.replace(/^litingyes\/blocove\//, ''),
  )
}

export function sourceFileOwners(manifest: Manifest): Map<string, string> {
  const owners = new Map<string, string>()

  for (const item of manifest.items) {
    for (const file of item.files ?? []) {
      owners.set(file.path, item.name)
    }
  }

  return owners
}

/** Imports that resolve to `@/` aliases, grouped by kind. */
export function classifyImports(
  source: string,
  aliases: Map<string, string>,
) {
  const blocove: { item: string, specifier: string }[] = []
  const official: { item: string, specifier: string }[] = []
  const packages: { package: string, specifier: string }[] = []
  const unknown: string[] = []

  for (const specifier of extractImportSpecifiers(source)) {
    const target = resolveImport(specifier, aliases)

    if (target === null) {
      if (!specifier.startsWith('@/')) {
        packages.push({
          package: packageNameOf(specifier),
          specifier,
        })
      }

      continue
    }

    if (target.kind === 'blocove') {
      blocove.push({ item: target.item, specifier })
    }
    else if (target.kind === 'official') {
      official.push({ item: target.item, specifier })
    }
    else {
      unknown.push(specifier)
    }
  }

  return { blocove, official, packages, unknown }
}
