// The code editor docs share one composition builder: every page shows the same
// shell, so imports and children stay in sync with the shipped items.
/** Export name -> module stem inside `components/blocove/code-editor`. */
const codeEditorModules = {
  CodeEditor: 'editor',
  CodeEditorContent: 'editor',
  CodeEditorToolbar: 'editor',
  CodeEditorToolbarButton: 'editor',
  CodeEditorStatusBar: 'editor',
  CodeEditorShiki: 'shiki',
  CodeEditorLanguages: 'languages',
  CodeEditorLineNumbers: 'line-numbers',
  CodeEditorDiff: 'diff',
  CodeEditorDiffToolbar: 'diff',
} as const

export type CodeEditorExport = keyof typeof codeEditorModules

/** Import order of the modules, matching the docs navigation. */
const moduleOrder = [
  'editor',
  'shiki',
  'languages',
  'line-numbers',
  'diff',
] as const

const importRoot = '@/components/blocove/code-editor'

function importBlock(names: CodeEditorExport[]) {
  const used = new Set(names)

  return moduleOrder
    .map(stem => ({
      stem,
      exports: [...used]
        .filter(name => codeEditorModules[name] === stem)
        .sort((a, b) => a.localeCompare(b)),
    }))
    .filter(group => group.exports.length > 0)
    .map(({ stem, exports }) =>
      `import { ${exports.join(', ')} } from "${importRoot}/${stem}"`,
    )
    .join('\n')
}

/** Escapes the document so it can be embedded in a template literal. */
function templateLiteral(value: string) {
  const escaped = value
    .replaceAll('\\', '\\\\')
    .replaceAll('`', '\\`')
    .replaceAll('${', '\\${')

  return `\`${escaped}\``
}

export interface CodeEditorUsageOptions {
  /** Extension components declared inside `<CodeEditor>`, in order. */
  extensions: CodeEditorExport[]
  /** Language set once on the editor root. */
  language: string
  /** Document rendered through `defaultValue`. */
  content: string
  /**
   * Document the diff extension compares against. Renders as a named
   * `original` constant and as the `original` prop of `CodeEditorDiff`.
   */
  original?: string
  /** Extra attributes rendered on `CodeEditorDiff`, mirroring the demo. */
  diffProps?: string[]
  /** Render the toolbar. */
  toolbar?: boolean
  /** Controls rendered inside the toolbar, next to the built-in ones. */
  toolbarActions?: CodeEditorExport[]
  /** Render the status bar. */
  statusBar?: boolean
  /** Render the editor read-only. */
  readOnly?: boolean
}

/**
 * The copy-pasteable example shown on a code editor docs page. One builder
 * keeps the imports and the composition of every page identical, so the code
 * panel never drifts from the shipped items.
 */
export function codeEditorUsage({
  extensions,
  language,
  content,
  original,
  diffProps,
  toolbar = true,
  toolbarActions,
  statusBar = true,
  readOnly = false,
}: CodeEditorUsageOptions) {
  const componentNames: CodeEditorExport[] = ['CodeEditor', ...extensions]

  if (toolbar) {
    componentNames.push('CodeEditorToolbar', ...(toolbarActions ?? []))
  }

  componentNames.push('CodeEditorContent')

  if (statusBar) {
    componentNames.push('CodeEditorStatusBar')
  }

  const declaration = (name: CodeEditorExport) => {
    if (name !== 'CodeEditorDiff') {
      return `      <${name} />`
    }

    const attributes = [
      ...(original
        ? ['original={original}']
        : []),
      ...(diffProps ?? []),
    ]

    return attributes.length > 0
      ? `      <${name} ${attributes.join(' ')} />`
      : `      <${name} />`
  }

  const body: string[] = extensions.map(declaration)

  if (toolbar) {
    if (toolbarActions && toolbarActions.length > 0) {
      body.push(
        '      <CodeEditorToolbar>',
        ...toolbarActions.map(name => `        <${name} />`),
        '      </CodeEditorToolbar>',
      )
    }
    else {
      body.push('      <CodeEditorToolbar />')
    }
  }

  body.push('      <CodeEditorContent />')

  if (statusBar) {
    body.push('      <CodeEditorStatusBar />')
  }

  return [
    importBlock([
      ...new Set(componentNames),
    ]),
    '',
    ...(original
      ? [
          `const original = ${templateLiteral(original)}`,
          '',
        ]
      : []),
    'export function Example() {',
    '  return (',
    '    <CodeEditor',
    `      defaultValue={${templateLiteral(content)}}`,
    `      language="${language}"`,
    ...(readOnly
      ? ['      readOnly']
      : []),
    '      className="h-72"',
    '    >',
    ...body,
    '    </CodeEditor>',
    '  )',
    '}',
  ].join('\n')
}
