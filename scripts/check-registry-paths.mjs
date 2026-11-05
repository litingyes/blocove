import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

// Blocove owns its own install namespace. Items must never fall back to the
// shadcn/ui aliases, which is what happens when a file has no `target`: the CLI
// writes registry:ui files into `components/ui`. This check runs after
// `shadcn build` and fails the build when an item drifts.

const root = process.cwd()
const registryPath = path.join(
  root,
  'src',
  'registry',
  'blocove',
  'registry.json',
)
const sourceRoot = path.join(root, 'src', 'registry', 'blocove')

const namespaceRoots = {
  'registry:lib': 'lib/blocove/',
  'registry:ui': 'components/blocove/',
  'registry:block': 'components/blocove/',
  'registry:component': 'components/blocove/',
}

// Specifiers that only exist in the old `components/ui` install layout.
const legacySpecifiers = [
  '@/components/ui/rich-text-editor/',
  '@/components/ui/code-editor/',
  '@/components/ui/media/',
  '@/lib/rich-text-editor-extension',
  '@/lib/code-editor-extension',
  '@/lib/code-editor-shiki',
  '@/lib/media-theme',
]

const errors = []

function walk(dir) {
  const files = []

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...walk(fullPath))
    }
    else if (/\.(?:ts|tsx)$/.test(entry.name)) {
      files.push(fullPath)
    }
  }

  return files
}

let targetCount = 0
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'))

for (const item of registry.items ?? []) {
  for (const file of item.files ?? []) {
    targetCount++

    const namespaceRoot = namespaceRoots[file.type]

    if (!namespaceRoot) {
      errors.push(
        `${item.name}: ${file.path} has type "${file.type}", which has no Blocove namespace`,
      )
      continue
    }

    if (!file.target) {
      errors.push(
        `${item.name}: ${file.path} has no target (expected under ${namespaceRoot})`,
      )
      continue
    }

    if (file.target.split('/').includes('..')) {
      errors.push(`${item.name}: ${file.path} target escapes the project: ${file.target}`)
      continue
    }

    if (!file.target.startsWith(namespaceRoot)) {
      errors.push(
        `${item.name}: ${file.path} targets ${file.target} (expected under ${namespaceRoot})`,
      )
    }

    const sourceName = path.posix.basename(file.path)
    const targetName = path.posix.basename(file.target)

    if (sourceName !== targetName) {
      errors.push(
        `${item.name}: ${file.path} targets ${file.target}; file names must match`,
      )
    }
  }
}

for (const sourcePath of walk(sourceRoot)) {
  const source = fs.readFileSync(sourcePath, 'utf8')

  for (const specifier of legacySpecifiers) {
    if (!source.includes(specifier)) {
      continue
    }

    errors.push(
      `${path.relative(root, sourcePath)}: imports ${specifier} (use the Blocove namespace)`,
    )
  }
}

if (errors.length > 0) {
  console.error('Registry namespace check failed:')
  console.error('')

  for (const error of errors) {
    console.error(`  - ${error}`)
  }

  console.error('')
  console.error(
    'Every file needs a target under components/blocove/ or lib/blocove/.',
  )
  process.exit(1)
}

console.log(
  `Registry namespace check passed: ${targetCount} files target components/blocove/ or lib/blocove/.`,
)
