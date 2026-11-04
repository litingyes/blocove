import type { DocsPageData } from '@/docs/types'
import EditorHardBreakDemo from '@/docs/examples/editor-hard-break'
import editorHardBreakCode from '@/docs/examples/editor-hard-break?raw'

const usage = `import { Editor, EditorContent, EditorToolbar } from "@/components/ui/editor"
import { EditorText } from "@/components/ui/editor-text"
import { EditorParagraph } from "@/components/ui/editor-paragraph"
import { EditorHardBreak } from "@/components/ui/editor-hard-break"

export function Example() {
  return (
    <Editor defaultValue="<p>First line<br>Second line</p>">
      <EditorText />
      <EditorParagraph />
      <EditorHardBreak />
      <EditorToolbar />
      <EditorContent className="min-h-40" />
    </Editor>
  )
}`

export const hardBreakDocs: DocsPageData = {
  examples: [
    {
      title: 'Default',
      component: EditorHardBreakDemo,
      code: editorHardBreakCode,
    },
  ],
  usage: [
    { title: 'Usage', code: usage, language: 'tsx' },
  ],
  api: [
    {
      name: 'EditorHardBreak',
      description:
        'Registers the hard break node inserted with Shift + Enter. Options pass through to the Tiptap extension.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<HardBreakOptions>',
          default: '-',
        },
      ],
    },
  ],
  demoDeps: ['editor'],
  requiresTypeset: true,
}
