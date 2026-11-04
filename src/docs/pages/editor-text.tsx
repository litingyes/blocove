import type { DocsPageData } from '@/docs/types'
import EditorTextDemo from '@/docs/examples/editor-text'
import editorTextCode from '@/docs/examples/editor-text?raw'

const usage = `import { Editor, EditorContent, EditorToolbar } from "@/components/ui/editor"
import { EditorText } from "@/components/ui/editor-text"
import { EditorParagraph } from "@/components/ui/editor-paragraph"
import { EditorHardBreak } from "@/components/ui/editor-hard-break"

export function Example() {
  return (
    <Editor defaultValue="<p>Hello</p>">
      <EditorText />
      <EditorParagraph />
      <EditorHardBreak />
      <EditorToolbar />
      <EditorContent className="min-h-40" />
    </Editor>
  )
}`

export const textDocs: DocsPageData = {
  examples: [
    {
      title: 'Default',
      component: EditorTextDemo,
      code: editorTextCode,
    },
  ],
  usage: [
    { title: 'Usage', code: usage, language: 'tsx' },
  ],
  api: [
    {
      name: 'EditorText',
      description:
        'Registers the Tiptap Text node. Every editor document needs it, so the Editor item installs it with the basic nodes.',
      rows: [],
    },
  ],
  demoDeps: ['editor'],
  requiresTypeset: true,
}
