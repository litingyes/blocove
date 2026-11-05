import { describe, expect, it } from 'vitest'
import { installedFilePath, itemTypeOrder } from '@/lib/registry-catalog'
import {
  buildAliasMap,
  classifyImports,
  dependencyName,
  dependencyVersion,
  listSourceFiles,
  readManifest,
  readProjectPackage,
  readSource,
  registryDependencyNames,
  sourceFileOwners,
} from '../../helpers/manifest'

const manifest = readManifest()
const aliasMap = buildAliasMap(manifest)
const sourceFiles = listSourceFiles()
const owners = sourceFileOwners(manifest)
const projectPackage = readProjectPackage()

// React is a peer every consumer already has, so items never declare it.
const implicitPackages = new Set(['react', 'react-dom'])

const namespaceRoots: Record<string, string> = {
  'registry:ui': 'components/blocove/',
  'registry:lib': 'lib/blocove/',
  'registry:block': 'components/blocove/',
  'registry:component': 'components/blocove/',
}

const itemTypes = new Set([
  ...itemTypeOrder,
  'registry:page',
  'registry:file',
])

function shippableItems() {
  return manifest.items.filter(item => (item.files ?? []).length > 0)
}

describe('manifest structure', () => {
  it('keeps the registry identity', () => {
    expect(manifest.name).toBe('blocove')
    expect(manifest.homepage).toMatch(/^https:\/\//)
  })

  it('has unique item names', () => {
    const names = manifest.items.map(item => item.name)
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index)

    expect(duplicates).toEqual([])
  })

  it('gives every item a title, a description and a known type', () => {
    const problems: string[] = []

    for (const item of manifest.items) {
      if (!item.title?.trim()) {
        problems.push(`${item.name}: missing title`)
      }

      if (!item.description?.trim()) {
        problems.push(`${item.name}: missing description`)
      }

      if (!itemTypes.has(item.type)) {
        problems.push(`${item.name}: unknown type "${item.type}"`)
      }
    }

    expect(problems).toEqual([])
  })

  it('ships a base item without files', () => {
    const base = manifest.items.find(item => item.type === 'registry:base')

    expect(base).toBeDefined()
    expect(base?.files ?? []).toEqual([])
  })
})

describe('files and targets', () => {
  it('references only files that exist on disk', () => {
    const missing: string[] = []

    for (const item of manifest.items) {
      for (const file of item.files ?? []) {
        if (!sourceFiles.includes(file.path)) {
          missing.push(`${item.name}: ${file.path}`)
        }
      }
    }

    expect(missing).toEqual([])
  })

  it('ships every source file from exactly one item', () => {
    const orphans = sourceFiles.filter(file => !owners.has(file))
    const counts = new Map<string, number>()

    for (const item of manifest.items) {
      for (const file of item.files ?? []) {
        counts.set(file.path, (counts.get(file.path) ?? 0) + 1)
      }
    }

    const duplicated = [
      ...counts.entries(),
    ]
      .filter(([, count]) => count > 1)
      .map(([file]) => file)

    expect(orphans).toEqual([])
    expect(duplicated).toEqual([])
  })

  it('gives every file a unique target under the Blocove namespace', () => {
    const problems: string[] = []
    const targets = new Set<string>()

    for (const item of manifest.items) {
      for (const file of item.files ?? []) {
        const namespaceRoot = namespaceRoots[file.type]

        if (!namespaceRoot) {
          problems.push(`${item.name}: ${file.path} has no Blocove namespace for "${file.type}"`)
          continue
        }

        if (!file.target) {
          problems.push(`${item.name}: ${file.path} has no target`)
          continue
        }

        if (targets.has(file.target)) {
          problems.push(`${file.target} is targeted by more than one file`)
        }

        targets.add(file.target)

        if (!file.target.startsWith(namespaceRoot)) {
          problems.push(`${item.name}: ${file.target} must start with ${namespaceRoot}`)
        }

        if (file.target.split('/').includes('..')) {
          problems.push(`${item.name}: ${file.target} escapes the project`)
        }

        if (file.target.split('/').pop() !== file.path.split('/').pop()) {
          problems.push(`${item.name}: ${file.path} targets a differently named file`)
        }

        if (installedFilePath(item, { path: file.path, target: file.target ?? null }) !== file.target) {
          problems.push(`${item.name}: installed path does not match ${file.target}`)
        }
      }
    }

    expect(problems).toEqual([])
  })
})

describe('dependency declarations', () => {
  it('declares every import it uses', () => {
    const problems: string[] = []

    for (const item of shippableItems()) {
      const registryDependencies = new Set(registryDependencyNames(item))
      const dependencies = new Set((item.dependencies ?? []).map(dependencyName))

      for (const file of item.files ?? []) {
        const imports = classifyImports(readSource(file.path), aliasMap)

        for (const specifier of imports.unknown) {
          problems.push(`${item.name}: ${file.path} imports ${specifier}, which no item ships`)
        }

        for (const { item: dependency, specifier } of imports.blocove) {
          // A file that ships in the same item does not need a dependency on itself.
          if (dependency !== item.name && !registryDependencies.has(dependency)) {
            problems.push(
              `${item.name}: ${file.path} imports ${specifier}; add litingyes/blocove/${dependency} to registryDependencies`,
            )
          }
        }

        for (const { item: dependency, specifier } of imports.official) {
          if (!registryDependencies.has(dependency)) {
            problems.push(
              `${item.name}: ${file.path} imports ${specifier}; add "${dependency}" to registryDependencies`,
            )
          }
        }

        for (const { package: packageName, specifier } of imports.packages) {
          if (implicitPackages.has(packageName) || dependencies.has(packageName)) {
            continue
          }

          problems.push(
            `${item.name}: ${file.path} imports ${specifier}; add "${packageName}" to dependencies`,
          )
        }
      }
    }

    expect(problems).toEqual([])
  })

  it('points every Blocove registry dependency at an existing item', () => {
    const names = new Set(manifest.items.map(item => item.name))
    const problems: string[] = []

    for (const item of manifest.items) {
      for (const dependency of item.registryDependencies ?? []) {
        if (!dependency.startsWith('litingyes/blocove/')) {
          continue
        }

        const name = dependency.slice('litingyes/blocove/'.length)

        if (!names.has(name)) {
          problems.push(`${item.name}: unknown Blocove dependency "${name}"`)
        }
      }
    }

    expect(problems).toEqual([])
  })

  it('pins the same versions the project installs', () => {
    const problems: string[] = []

    for (const item of manifest.items) {
      for (const dependency of item.dependencies ?? []) {
        const version = dependencyVersion(dependency)

        if (!version) {
          continue
        }

        const name = dependencyName(dependency)
        const installed = projectPackage.dependencies?.[name]

        if (installed !== version) {
          problems.push(
            `${item.name}: ${dependency} does not match package.json (${installed ?? 'missing'})`,
          )
        }
      }
    }

    expect(problems).toEqual([])
  })
})
