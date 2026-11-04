import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const builtCatalogPath = path.join(root, 'public', 'r', 'registry.json')

if (!fs.existsSync(builtCatalogPath)) {
  console.error(
    'Missing public/r/registry.json. Run `pnpm run registry:build` first.',
  )
  process.exit(1)
}

const built = JSON.parse(fs.readFileSync(builtCatalogPath, 'utf8'))
const sourcePrefix = 'src/registry/blocove/'

const items = (built.items ?? []).map(item => ({
  name: item.name,
  type: item.type,
  title: item.title ?? item.name,
  description: item.description ?? '',
  dependencies: item.dependencies ?? [],
  registryDependencies: item.registryDependencies ?? [],
  categories: item.categories ?? [],
  files: (item.files ?? []).map(file => ({
    path: file.path.startsWith(sourcePrefix)
      ? file.path.slice(sourcePrefix.length)
      : file.path,
    type: file.type,
    target: file.target ?? null,
  })),
}))

const catalog = {
  name: built.name,
  homepage: built.homepage,
  items,
}

const outDir = path.join(root, 'src', 'generated')
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(
  path.join(outDir, 'registry.json'),
  `${JSON.stringify(catalog, null, 2)}\n`,
)

console.log(`Wrote ${items.length} items to src/generated/registry.json`)
