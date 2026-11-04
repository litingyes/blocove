import type { DocsPageData } from '@/docs/types'
import EditorParagraphDemo from '@/docs/examples/editor-paragraph'
import editorParagraphCode from '@/docs/examples/editor-paragraph?raw'

const usage = `import { Editor, EditorContent, EditorToolbar } from "@/components/ui/editor"
import { EditorText } from "@/components/ui/editor-text"
import { EditorParagraph } from "@/components/ui/editor-paragraph"
import { EditorHardBreak } from "@/components/ui/editor-hard-break"

export function Example() {
  return (
    <Editor defaultValue="<p>First paragraph</p><p>Second paragraph</p>">
      <EditorText />
      <EditorParagraph />
      <EditorHardBreak />
      <EditorToolbar />
      <EditorContent className="min-h-40" />
    </Editor>
  )
}`

export const paragraphDocs: DocsPageData = {
  examples: [
    {
      title: 'Default',
      component: EditorParagraphDemo,
      code: editorParagraphCode,
    },
  ],
  usage: [
    { title: 'Usage', code: usage, language: 'tsx' },
  ],
  api: [
    {
      name: 'EditorParagraph',
      description:
        'Registers the paragraph block. Options pass through to the Tiptap extension, including shared HTML attributes.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<ParagraphOptions>',
          default: '-',
        },
      ],
    },
  ],
  demoDeps: ['editor'],
  requiresTypeset: true,
}
