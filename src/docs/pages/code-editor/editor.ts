import type { DocsPage } from '@/docs/types'
import { codeEditorDemoContent } from '@/docs/examples/code-editor/content'
import CodeEditorDemo from '@/docs/examples/code-editor/editor'
import CodeEditorReadOnlyDemo from '@/docs/examples/code-editor/readonly'
import { codeEditorUsage } from '@/docs/snippets/code-editor'

const controlledUsage = `import { useState } from "react"
import { CodeEditor, CodeEditorContent, CodeEditorStatusBar, CodeEditorToolbar } from "@/components/ui/code-editor/editor"
import { CodeEditorShiki } from "@/components/ui/code-editor/shiki"

export function Example() {
  const [code, setCode] = useState('const answer = 42')

  return (
    <CodeEditor
      value={code}
      onChange={setCode}
      language="tsx"
      className="h-72"
    >
      <CodeEditorShiki />
      <CodeEditorToolbar />
      <CodeEditorContent />
      <CodeEditorStatusBar />
    </CodeEditor>
  )
}`

export const docsPage: DocsPage = {
  item: 'code-editor',
  demoDeps: [
    'code-editor-shiki',
    'code-editor-languages',
    'code-editor-line-numbers',
  ],
  examples: [
    {
      title: 'Default',
      component: CodeEditorDemo,
      code: codeEditorUsage({
        extensions: [
          'CodeEditorShiki',
          'CodeEditorLanguages',
          'CodeEditorLineNumbers',
        ],
        language: 'tsx',
        content: codeEditorDemoContent.typescript,
      }),
    },
    {
      title: 'Read-only',
      component: CodeEditorReadOnlyDemo,
      code: codeEditorUsage({
        extensions: ['CodeEditorShiki', 'CodeEditorLineNumbers'],
        language: 'tsx',
        content: codeEditorDemoContent.typescript,
        readOnly: true,
      }),
    },
  ],
  usage: [
    {
      title: 'Controlled',
      code: controlledUsage,
    },
  ],
  api: [
    {
      name: 'CodeEditor',
      description:
        'Editor root. Registers the extensions declared by its children and owns the controlled document.',
      rows: [
        { prop: 'value', type: 'string', default: '-' },
        { prop: 'defaultValue', type: 'string', default: '-' },
        { prop: 'onChange', type: '(value: string) => void', default: '-' },
        { prop: 'language', type: 'string', default: '-' },
        { prop: 'placeholder', type: 'string', default: 'Type some code…' },
        { prop: 'editable', type: 'boolean', default: 'true' },
        {
          prop: 'readOnly',
          type: 'boolean',
          default: 'false',
        },
        { prop: 'autoFocus', type: 'boolean', default: 'false' },
        { prop: 'lineWrapping', type: 'boolean', default: 'false' },
        {
          prop: 'onLineWrappingChange',
          type: '(lineWrapping: boolean) => void',
          default: '-',
        },
        { prop: 'extensions', type: 'Extension', default: '-' },
        {
          prop: 'onReady',
          type: '(view: EditorView) => void',
          default: '-',
        },
        { prop: 'className', type: 'string', default: '-' },
        { prop: 'children', type: 'ReactNode', default: '-' },
      ],
    },
    {
      name: 'CodeEditorContent',
      description: 'The editable surface. Creates the CodeMirror view.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
    {
      name: 'CodeEditorToolbar',
      description:
        'Toolbar with the history controls, the line wrapping toggle and a copy action. Item controls can be passed as children.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
        { prop: 'children', type: 'ReactNode', default: '-' },
      ],
    },
    {
      name: 'CodeEditorStatusBar',
      description:
        'Cursor position, selection length and the language set on the root.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
    {
      name: 'useCodeEditor',
      description:
        'Returns the editor context: the view, the resolved configuration and the wrapping state. Use `useCodeEditorState` to re-render a control when the editor state changes.',
      rows: [],
    },
  ],
}
