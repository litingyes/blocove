// The rich text editor docs share one composition builder: every page shows the
// same shell, so imports and children stay in sync with the shipped items.
/** Export name -> module stem inside `components/blocove/rich-text-editor`. */
const richTextEditorModules = {
  // Shell
  Editor: 'editor',
  EditorContent: 'editor',
  EditorToolbar: 'editor',
  EditorToolbarButton: 'editor',
  EditorBubbleMenu: 'editor',
  EditorCharacterCount: 'editor',
  // Nodes
  EditorText: 'text',
  EditorParagraph: 'paragraph',
  EditorHardBreak: 'hard-break',
  EditorHeading: 'heading',
  EditorHeadingToolbar: 'heading',
  EditorCodeBlock: 'code-block',
  EditorCodeBlockToolbar: 'code-block',
  EditorDetails: 'details',
  EditorDetailsToolbar: 'details',
  EditorImage: 'image',
  EditorImageToolbar: 'image',
  EditorTable: 'table',
  EditorTableToolbar: 'table',
  // Marks
  EditorBold: 'bold',
  EditorBoldToolbar: 'bold',
  EditorItalic: 'italic',
  EditorItalicToolbar: 'italic',
  EditorUnderline: 'underline',
  EditorUnderlineToolbar: 'underline',
  EditorStrike: 'strike',
  EditorStrikeToolbar: 'strike',
  EditorCode: 'code',
  EditorCodeToolbar: 'code',
  EditorLink: 'link',
  EditorLinkToolbar: 'link',
} as const

export type RichTextEditorExport = keyof typeof richTextEditorModules

/** Import order of the modules, matching the docs navigation. */
const moduleOrder = [
  'editor',
  'text',
  'paragraph',
  'hard-break',
  'heading',
  'code-block',
  'details',
  'image',
  'table',
  'bold',
  'italic',
  'underline',
  'strike',
  'code',
  'link',
] as const

const importRoot = '@/components/blocove/rich-text-editor'

function importBlock(names: RichTextEditorExport[]) {
  const used = new Set(names)

  return moduleOrder
    .map(stem => ({
      stem,
      exports: [...used]
        .filter(name => richTextEditorModules[name] === stem)
        .sort((a, b) => a.localeCompare(b)),
    }))
    .filter(group => group.exports.length > 0)
    .map(({ stem, exports }) =>
      `import { ${exports.join(', ')} } from "${importRoot}/${stem}"`,
    )
    .join('\n')
}

function controlBlock(
  tag: string,
  children: RichTextEditorExport[],
  indent: string,
) {
  if (children.length === 0) {
    return `${indent}<${tag} />`
  }

  return [
    `${indent}<${tag}>`,
    ...children.map(child => `${indent}  <${child} />`),
    `${indent}</${tag}>`,
  ].join('\n')
}

/**
 * Picks the shortest JSX form for the `defaultValue` attribute: a plain string
 * attribute, or a single-quoted expression when the HTML contains double quotes.
 */
function defaultValueAttribute(value: string) {
  if (value.includes('"')) {
    return `{'${value
      .replaceAll('\\', '\\\\')
      .replaceAll('\'', '\\\'')}'}`
  }

  return `"${value}"`
}

export interface RichTextEditorUsageOptions {
  /** Extension components declared inside `<Editor>`, in order. */
  extensions: RichTextEditorExport[]
  /**
   * Toolbar controls. Pass an empty array for the default history and alignment
   * toolbar, omit it to render no toolbar.
   */
  toolbar?: RichTextEditorExport[]
  /** Bubble menu controls. The bubble menu is omitted when empty. */
  bubble?: RichTextEditorExport[]
  /** HTML rendered through `defaultValue`. */
  content: string
  /** Render the character counter. */
  characterCount?: boolean
}

/**
 * The copy-pasteable example shown on a rich text editor docs page. One builder
 * keeps the imports and the composition of every page identical, so the code
 * panel never drifts from the shipped items.
 */
export function richTextEditorUsage({
  extensions,
  toolbar,
  bubble,
  content,
  characterCount = false,
}: RichTextEditorUsageOptions) {
  const componentNames: RichTextEditorExport[] = ['Editor', ...extensions]

  if (toolbar) {
    componentNames.push('EditorToolbar', ...toolbar)
  }

  if (bubble && bubble.length > 0) {
    componentNames.push('EditorBubbleMenu', ...bubble)
  }

  if (characterCount) {
    componentNames.push('EditorCharacterCount')
  }

  componentNames.push('EditorContent')

  const body: string[] = extensions.map(name => `      <${name} />`)

  if (toolbar) {
    body.push('', controlBlock('EditorToolbar', toolbar, '      '))
  }

  if (bubble && bubble.length > 0) {
    body.push('', controlBlock('EditorBubbleMenu', bubble, '      '))
  }

  body.push('', '      <EditorContent className="min-h-40" />')

  if (characterCount) {
    body.push('      <EditorCharacterCount />')
  }

  return [
    importBlock([
      ...new Set(componentNames),
    ]),
    '',
    'export function Example() {',
    '  return (',
    `    <Editor defaultValue=${defaultValueAttribute(content)}>`,
    ...body,
    '    </Editor>',
    '  )',
    '}',
  ].join('\n')
}
