import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { projectRoot, readManifest, readSource } from '../../helpers/manifest'

// These checks run against the artifacts `registry:prepare` writes; CI runs that
// step before the tests. A local run without the artifacts skips them instead of
// failing, and the source based contract suite still runs.
const manifest = readManifest()
const generatedCatalogPath = path.join(projectRoot, 'src/generated/registry.json')
const builtRegistryRoot = path.join(projectRoot, 'public/r')
const generatedExists = fs.existsSync(generatedCatalogPath)
const builtExists = fs.existsSync(path.join(builtRegistryRoot, 'registry.json'))

function manifestProjection() {
  return {
    name: manifest.name,
    homepage: manifest.homepage,
    items: manifest.items.map(item => ({
      name: item.name,
      type: item.type,
      title: item.title,
      description: item.description,
      dependencies: item.dependencies ?? [],
      registryDependencies: item.registryDependencies ?? [],
      categories: item.categories ?? [],
      files: (item.files ?? []).map(file => ({
        path: file.path,
        type: file.type,
        target: file.target ?? null,
      })),
    })),
  }
}

describe.skipIf(!generatedExists)('generated catalog', () => {
  it('mirrors the source manifest', () => {
    const generated = JSON.parse(fs.readFileSync(generatedCatalogPath, 'utf8'))

    expect(generated).toEqual(manifestProjection())
  })
})

describe.skipIf(!builtExists)('built registry payloads', () => {
  it('serves one payload per item', () => {
    const missing = manifest.items
      .map(item => path.join(builtRegistryRoot, `${item.name}.json`))
      .filter(filePath => !fs.existsSync(filePath))

    expect(missing).toEqual([])
  })

  it('serves no stale payloads', () => {
    const expected = new Set(manifest.items.map(item => `${item.name}.json`))
    const extra = fs
      .readdirSync(builtRegistryRoot)
      .filter(name => name.endsWith('.json') && name !== 'registry.json' && !expected.has(name))

    expect(extra).toEqual([])
  })

  for (const item of manifest.items) {
    it(`inlines the shipped sources of ${item.name}`, () => {
      const payload = JSON.parse(
        fs.readFileSync(path.join(builtRegistryRoot, `${item.name}.json`), 'utf8'),
      )

      expect(payload.name).toBe(item.name)
      expect(payload.type).toBe(item.type)
      expect(payload.title).toBe(item.title)
      expect(payload.description).toBe(item.description)
      expect(payload.dependencies ?? []).toEqual(item.dependencies ?? [])
      expect(payload.registryDependencies ?? []).toEqual(item.registryDependencies ?? [])
      expect(payload.files ?? []).toHaveLength((item.files ?? []).length)

      for (const [index, file] of (payload.files ?? []).entries()) {
        const source = item.files![index]

        expect(file.path).toBe(`src/registry/blocove/${source.path}`)
        expect(file.target).toBe(source.target)
        expect(file.content).toBe(readSource(source.path))
      }
    })
  }
})
