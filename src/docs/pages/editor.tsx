import type { DocsPageData } from '@/docs/types'
import EditorDemo from '@/docs/examples/editor'
import editorDemoCode from '@/docs/examples/editor?raw'

const compositionSnippet = `import {
  Editor,
  EditorBubbleMenu,
  EditorCharacterCount,
  EditorContent,
  EditorToolbar,
} from "@/components/ui/editor"
import { EditorBold, EditorBoldToolbar } from "@/components/ui/editor-bold"
import { EditorHardBreak } from "@/components/ui/editor-hard-break"
import { EditorHeading, EditorHeadingToolbar } from "@/components/ui/editor-heading"
import { EditorItalic, EditorItalicToolbar } from "@/components/ui/editor-italic"
import { EditorParagraph } from "@/components/ui/editor-paragraph"
import { EditorText } from "@/components/ui/editor-text"

export function Example() {
  return (
    <Editor defaultValue="<h2>Hello</h2><p>Blocove editor</p>">
      <EditorText />
      <EditorParagraph />
      <EditorHardBreak />
      <EditorHeading />
      <EditorBold />
      <EditorItalic />

      <EditorToolbar>
        <EditorHeadingToolbar />
        <EditorBoldToolbar />
        <EditorItalicToolbar />
      </EditorToolbar>

      <EditorBubbleMenu>
        <EditorBoldToolbar />
        <EditorItalicToolbar />
      </EditorBubbleMenu>

      <EditorContent className="min-h-40" />
      <EditorCharacterCount />
    </Editor>
  )
}`

const typesetSnippet = `/* src/styles.css */
@import "tailwindcss";
@import "./typeset.css";
@import "@fontsource-variable/inter";
@import "@fontsource-variable/jetbrains-mono";

.typeset-docs {
  --typeset-font-body: var(--font-inter);
  --typeset-font-heading: var(--font-inter);
  --typeset-font-mono: var(--font-jetbrains-mono);
  --typeset-size: 16px;
  --typeset-leading: 1.75;
  --typeset-flow: 1.25em;
}`

const typesetCommand = `curl -o src/typeset.css https://ui.shadcn.com/typeset.css`

export const editorDocs: DocsPageData = {
  examples: [
    {
      title: 'Default',
      component: EditorDemo,
      code: editorDemoCode,
    },
  ],
  usage: [
    {
      title: 'Composition',
      code: compositionSnippet,
      language: 'tsx',
    },
    {
      title: 'Install typeset',
      code: typesetCommand,
      language: 'bash',
    },
    {
      title: 'Typeset setup',
      code: typesetSnippet,
      language: 'css',
    },
  ],
  requiresTypeset: true,
  demoDeps: [
    'editor-heading',
    'editor-code-block',
    'editor-bold',
    'editor-italic',
    'editor-underline',
    'editor-strike',
    'editor-code',
    'editor-link',
  ],
  note: 'Typography is rendered inside a shadcn/typeset container. Nodes and marks are separate items: install the ones you compose into the editor.',
  api: [
    {
      name: 'Editor',
      description: 'Root component. Registers the declared extensions and provides the editor context.',
      rows: [
        { prop: 'value', type: 'string', default: '-' },
        { prop: 'defaultValue', type: 'string', default: '-' },
        { prop: 'onChange', type: '(html: string) => void', default: '-' },
        { prop: 'placeholder', type: 'string', default: '"Start writing…"' },
        { prop: 'editable', type: 'boolean', default: 'true' },
        { prop: 'autoFocus', type: 'boolean', default: 'false' },
        { prop: 'characterLimit', type: 'number', default: '-' },
        { prop: 'extensions', type: 'Extensions', default: '-' },
        { prop: 'onReady', type: '(editor: Editor) => void', default: '-' },
        { prop: 'className', type: 'string', default: '-' },
        { prop: 'editorProps', type: 'EditorProps', default: '-' },
        { prop: 'children', type: 'ReactNode', default: '-' },
      ],
    },
    {
      name: 'EditorContent',
      description: 'Editable surface. Wraps the ProseMirror document in the typeset container.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
        { prop: 'typeset', type: 'boolean', default: 'true' },
        { prop: '...props', type: 'React.ComponentProps<\'div\'>', default: '-' },
      ],
    },
    {
      name: 'EditorToolbar',
      description: 'Toolbar with undo/redo, alignment and clear formatting. Children are extension controls.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
        { prop: 'children', type: 'ReactNode', default: '-' },
      ],
    },
    {
      name: 'EditorToolbarButton',
      description: 'Toolbar control with a tooltip and an optional keyboard shortcut. Used by every extension item.',
      rows: [
        { prop: 'label', type: 'string', default: '-' },
        { prop: 'shortcut', type: 'string', default: '-' },
        { prop: 'pressed', type: 'boolean', default: '-' },
        { prop: 'onPressedChange', type: '(pressed: boolean) => void', default: '-' },
        { prop: 'onClick', type: '() => void', default: '-' },
        { prop: 'disabled', type: 'boolean', default: 'false' },
        { prop: 'className', type: 'string', default: '-' },
        { prop: 'children', type: 'ReactNode', default: '-' },
      ],
    },
    {
      name: 'EditorBubbleMenu',
      description: 'Floating menu shown above a text selection. Render mark controls as children.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
        { prop: 'children', type: 'ReactNode', default: '-' },
      ],
    },
    {
      name: 'EditorCharacterCount',
      description: 'Live character and word count for the current document.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
        {
          prop: 'format',
          type: '"characters" | "words" | "both"',
          default: '"characters"',
        },
      ],
    },
    {
      name: 'defineExtensionComponent',
      description: 'Declares a Tiptap extension as a component that the Editor collects from its children.',
      rows: [
        { prop: 'name', type: 'string', default: '-' },
        {
          prop: 'extension',
          type: '(props) => Extensions',
          default: '-',
        },
        {
          prop: 'returns',
          type: 'ExtensionComponent',
          default: '-',
        },
      ],
    },
  ],
}
