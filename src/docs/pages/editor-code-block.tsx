import type { DocsPageData } from '@/docs/types'
import EditorCodeBlockDemo from '@/docs/examples/editor-code-block'
import editorCodeBlockCode from '@/docs/examples/editor-code-block?raw'

const usage = `import { Editor, EditorContent, EditorToolbar } from "@/components/ui/editor"
import { EditorText } from "@/components/ui/editor-text"
import { EditorParagraph } from "@/components/ui/editor-paragraph"
import { EditorHardBreak } from "@/components/ui/editor-hard-break"
import { EditorCodeBlock, EditorCodeBlockToolbar } from "@/components/ui/editor-code-block"

export function Example() {
  return (
    <Editor defaultValue="<p>Example</p><pre><code>const x = 1</code></pre>">
      <EditorText />
      <EditorParagraph />
      <EditorHardBreak />
      <EditorCodeBlock />
      <EditorToolbar>
        <EditorCodeBlockToolbar />
      </EditorToolbar>
      <EditorContent className="min-h-40" />
    </Editor>
  )
}`

export const codeBlockDocs: DocsPageData = {
  examples: [
    {
      title: 'Default',
      component: EditorCodeBlockDemo,
      code: editorCodeBlockCode,
    },
  ],
  usage: [
    { title: 'Usage', code: usage, language: 'tsx' },
  ],
  api: [
    {
      name: 'EditorCodeBlock',
      description:
        'Registers the code block node. Options pass through to the Tiptap extension.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<CodeBlockOptions>',
          default: '-',
        },
      ],
    },
    {
      name: 'EditorCodeBlockToolbar',
      description: 'Toolbar toggle for the code block node.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  requiresTypeset: true,
}
