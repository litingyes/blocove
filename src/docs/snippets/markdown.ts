// The markdown family shares one composition builder: every page shows the same
// shell, so imports and capabilities stay in sync with the shipped items.
/** Export name -> module stem inside `components/blocove/markdown`. */
const markdownModules = {
  Markdown: 'markdown',
  MarkdownCodeBlock: 'code-block',
  MarkdownMath: 'math',
} as const

export type MarkdownExport = keyof typeof markdownModules

/** Import order of the modules, matching the docs navigation. */
const moduleOrder = ['markdown', 'code-block', 'math'] as const

const importRoot = '@/components/blocove/markdown'

function importBlock(names: MarkdownExport[]) {
  const used = new Set(names)

  return moduleOrder
    .map(stem => ({
      stem,
      exports: [...used]
        .filter(name => markdownModules[name] === stem)
        .sort((a, b) => a.localeCompare(b)),
    }))
    .filter(group => group.exports.length > 0)
    .map(({ stem, exports }) =>
      `import { ${exports.join(', ')} } from "${importRoot}/${stem}"`,
    )
    .join('\n')
}

/** Escapes a markdown source so it can sit in a template literal. */
function templateLiteral(value: string) {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('`', '\\`')
    .replaceAll('${', '\\${')
}

export interface MarkdownUsageOptions {
  /** The markdown the example renders. */
  source: string
  /** Register the shiki fence renderer. */
  code?: boolean
  /** Register the KaTeX renderer. */
  math?: boolean
}

/**
 * The usage snippet every markdown page shows: the shell, the source constant,
 * and the capability map the demo composes.
 */
export function markdownUsage({ source, code = false, math = false }: MarkdownUsageOptions) {
  const names: MarkdownExport[] = ['Markdown']
  const capabilities: string[] = []

  if (code) {
    names.push('MarkdownCodeBlock')
    capabilities.push('code: MarkdownCodeBlock')
  }

  if (math) {
    names.push('MarkdownMath')
    capabilities.push('math: MarkdownMath')
  }

  const element = capabilities.length > 0
    ? `    <Markdown source={source} components={{ ${capabilities.join(', ')} }} />`
    : '    <Markdown source={source} />'

  return [
    importBlock(names),
    '',
    `const source = \`${templateLiteral(source)}\``,
    '',
    'export function Example() {',
    '  return (',
    element,
    '  )',
    '}',
  ].join('\n')
}

/** The fence item's page: the shell with the highlighted code renderer. */
export function markdownCodeBlockUsage(source: string) {
  return markdownUsage({ source, code: true })
}

/** The math item's page: the shell with the KaTeX renderer. */
export function markdownMathUsage(source: string) {
  return markdownUsage({ source, math: true })
}

/**
 * The streaming demo's page: the source arrives in chunks and the shell
 * re-parses only the block still being written.
 */
export function markdownStreamingUsage(source: string) {
  return [
    'import { useEffect, useState } from "react"',
    importBlock(['Markdown', 'MarkdownCodeBlock']),
    '',
    `const source = \`${templateLiteral(source)}\``,
    '',
    'export function Example() {',
    '  const [received, setReceived] = useState("")',
    '  const [streaming, setStreaming] = useState(true)',
    '',
    '  useEffect(() => {',
    '    let cursor = 0',
    '    const timer = window.setInterval(() => {',
    '      cursor = Math.min(cursor + 4, source.length)',
    '      setReceived(source.slice(0, cursor))',
    '',
    '      if (cursor >= source.length) {',
    '        window.clearInterval(timer)',
    '        setStreaming(false)',
    '      }',
    '    }, 30)',
    '',
    '    return () => window.clearInterval(timer)',
    '  }, [])',
    '',
    '  return (',
    '    <Markdown source={received} streaming={streaming} components={{ code: MarkdownCodeBlock }} />',
    '  )',
    '}',
  ].join('\n')
}
