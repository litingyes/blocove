import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { docsNav } from '@/docs/nav'
import { codeEditorUsage } from '@/docs/snippets/code-editor'
import { audioPlayerUsage, videoPlayerUsage } from '@/docs/snippets/media'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'
import { codeSamples } from '../../helpers/fixtures'
import { projectRoot, readManifest } from '../../helpers/manifest'

// The docs render the shipped sources, so the generated examples must import
// from the same installed modules the CLI writes.
const richTextModules = import.meta.glob(
  '/src/registry/blocove/ui/rich-text-editor/*.tsx',
  { eager: true },
) as Record<string, Record<string, unknown>>
const codeEditorModules = import.meta.glob(
  '/src/registry/blocove/ui/code-editor/*.tsx',
  { eager: true },
) as Record<string, Record<string, unknown>>
const mediaModules = import.meta.glob(
  '/src/registry/blocove/ui/media/*.tsx',
  { eager: true },
) as Record<string, Record<string, unknown>>

const manifest = readManifest()

function modulesByStem(modules: Record<string, Record<string, unknown>>) {
  const byStem = new Map<string, Record<string, unknown>>()

  for (const [filePath, module] of Object.entries(modules)) {
    const stem = filePath.split('/').pop()?.replace(/\.tsx$/, '')

    if (stem) {
      byStem.set(stem, module)
    }
  }

  return byStem
}

function parseGeneratedImports(code: string) {
  return [
    ...code.matchAll(/^import \{ ([^}]+) \} from "([^"]+)"$/gm),
  ].map(
    match => ({
      names: match[1].split(',').map(name => name.trim()).filter(Boolean),
      specifier: match[2],
    }),
  )
}

function installRootOf(itemName: string): string {
  const item = manifest.items.find(candidate => candidate.name === itemName)
  const target = item?.files?.[0]?.target

  expect(target, `${itemName} ships a targeted file`).toBeTruthy()

  const directory = path.posix.dirname(target!)

  return `@/${directory}`
}

function expectSnippetToResolve(
  code: string,
  root: string,
  modules: Map<string, Record<string, unknown>>,
) {
  const imports = parseGeneratedImports(code)

  expect(imports.length).toBeGreaterThan(0)

  for (const { names, specifier } of imports) {
    expect(specifier.startsWith(`${root}/`), `${specifier} must live under ${root}`).toBe(true)

    const stem = specifier.slice(root.length + 1)
    const module = modules.get(stem)

    expect(module, `${specifier} must resolve to a shipped module`).toBeDefined()

    for (const name of names) {
      expect(module?.[name], `${specifier} must export ${name}`).toBeTypeOf('function')
    }
  }

  // The generated examples always point at the installed namespace.
  expect(code).not.toContain('@/components/ui/rich-text-editor')
  expect(code).not.toContain('@/components/ui/code-editor')
}

describe('docs snippets', () => {
  it('import the shipped rich text editor modules', () => {
    const code = richTextEditorUsage({
      extensions: [
        'EditorText',
        'EditorParagraph',
        'EditorHardBreak',
        'EditorHeading',
        'EditorCodeBlock',
        'EditorDetails',
        'EditorImage',
        'EditorTable',
        'EditorBold',
        'EditorItalic',
        'EditorUnderline',
        'EditorStrike',
        'EditorCode',
        'EditorLink',
      ],
      toolbar: [
        'EditorHeadingToolbar',
        'EditorBoldToolbar',
        'EditorItalicToolbar',
        'EditorUnderlineToolbar',
        'EditorStrikeToolbar',
        'EditorCodeToolbar',
        'EditorCodeBlockToolbar',
        'EditorLinkToolbar',
        'EditorDetailsToolbar',
        'EditorImageToolbar',
        'EditorTableToolbar',
      ],
      bubble: ['EditorBoldToolbar'],
      content: '<p>Hello world</p>',
      characterCount: true,
    })

    expectSnippetToResolve(code, installRootOf('rich-text-editor'), modulesByStem(richTextModules))
  })

  it('import the shipped media modules', () => {
    const video = videoPlayerUsage({
      title: 'Composable media components',
      poster: '/poster.jpg',
      src: '/clip.mp4',
      tracks: [
        {
          src: '/en.vtt',
          label: 'English',
          srcLang: 'en',
          default: true,
        },
      ],
    })
    const audio = audioPlayerUsage({
      title: 'Episode twelve',
      poster: '/cover.jpg',
      src: '/episode.m4a',
    })

    expectSnippetToResolve(video, installRootOf('video-player'), modulesByStem(mediaModules))
    expectSnippetToResolve(audio, installRootOf('audio-player'), modulesByStem(mediaModules))
  })

  it('import the shipped code editor modules', () => {
    const code = codeEditorUsage({
      extensions: [
        'CodeEditorShiki',
        'CodeEditorLanguages',
        'CodeEditorLineNumbers',
        'CodeEditorDiff',
      ],
      language: 'tsx',
      content: codeSamples.typescript,
      original: codeSamples.diffOriginal,
      toolbarActions: ['CodeEditorDiffToolbar'],
    })

    expectSnippetToResolve(code, installRootOf('code-editor'), modulesByStem(codeEditorModules))
  })
})

describe('docs navigation', () => {
  const navItems = docsNav.flatMap(section =>
    section.groups.flatMap(group => group.items),
  )
  const manifestNames = new Set(manifest.items.map(item => item.name))
  const internalNames = new Set(
    manifest.items
      .filter(item => (item.categories ?? []).includes('internal'))
      .map(item => item.name),
  )

  it('links only items the registry ships', () => {
    expect(navItems.filter(name => !manifestNames.has(name))).toEqual([])
  })

  it('lists every public item exactly once', () => {
    const duplicates = navItems.filter(
      (name, index) => navItems.indexOf(name) !== index,
    )
    const publicItems = [...manifestNames].filter(name => !internalNames.has(name))
    const missing = publicItems.filter(name => !navItems.includes(name))

    expect(duplicates).toEqual([])
    expect(missing).toEqual([])
  })

  it('does not link internal helpers', () => {
    expect([...internalNames].filter(name => navItems.includes(name))).toEqual([])
  })

  it('has a docs page for every linked item', () => {
    const pageItems = readDocsPageItems()
    const missingPages = navItems.filter(name => !pageItems.has(name))

    expect(missingPages).toEqual([])
  })

  it('only ships docs pages for linked items', () => {
    const pageItems = readDocsPageItems()

    expect([...pageItems].filter(name => !navItems.includes(name))).toEqual([])
    expect([...pageItems].filter(name => !manifestNames.has(name))).toEqual([])
  })
})

function readDocsPageItems() {
  const pagesRoot = path.join(projectRoot, 'src/docs/pages')
  const items = new Set<string>()

  const walk = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        walk(fullPath)
        continue
      }

      if (!entry.name.endsWith('.ts') || entry.name === 'index.ts') {
        continue
      }

      const source = fs.readFileSync(fullPath, 'utf8')
      const match = source.match(/item:\s*'([^']+)'/)

      if (match) {
        items.add(match[1])
      }
    }
  }

  walk(pagesRoot)

  return items
}
