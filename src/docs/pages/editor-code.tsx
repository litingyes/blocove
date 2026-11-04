import type { DocsPageData } from '@/docs/types'
import EditorCodeDemo from '@/docs/examples/editor-code'
import editorCodeCode from '@/docs/examples/editor-code?raw'

const usage = `import {
  Editor,
  EditorBubbleMenu,
  EditorContent,
  EditorToolbar,
} from "@/components/ui/editor"
import { EditorText } from "@/components/ui/editor-text"
import { EditorParagraph } from "@/components/ui/editor-paragraph"
import { EditorHardBreak } from "@/components/ui/editor-hard-break"
import { EditorCode, EditorCodeToolbar } from "@/components/ui/editor-code"

export function Example() {
  return (
    <Editor defaultValue="<p><code>inline code</code> text</p>">
      <EditorText />
      <EditorParagraph />
      <EditorHardBreak />
      <EditorCode />
      <EditorToolbar>
        <EditorCodeToolbar />
      </EditorToolbar>
      <EditorBubbleMenu>
        <EditorCodeToolbar />
      </EditorBubbleMenu>
      <EditorContent className="min-h-40" />
    </Editor>
  )
}`

export const codeDocs: DocsPageData = {
  examples: [
    { title: 'Default', component: EditorCodeDemo, code: editorCodeCode },
  ],
  usage: [
    { title: 'Usage', code: usage, language: 'tsx' },
  ],
  api: [
    {
      name: 'EditorCode',
      description:
        'Registers the inline code mark. Code blocks are a separate node item.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<CodeOptions>',
          default: '-',
        },
      ],
    },
    {
      name: 'EditorCodeToolbar',
      description:
        'Toolbar toggle for the inline code mark, also usable inside the bubble menu.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  requiresTypeset: true,
}
