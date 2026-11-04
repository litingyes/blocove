import type { DocsPageData } from '@/docs/types'
import EditorHeadingDemo from '@/docs/examples/editor-heading'
import editorHeadingCode from '@/docs/examples/editor-heading?raw'

const usage = `import { Editor, EditorContent, EditorToolbar } from "@/components/ui/editor"
import { EditorText } from "@/components/ui/editor-text"
import { EditorParagraph } from "@/components/ui/editor-paragraph"
import { EditorHardBreak } from "@/components/ui/editor-hard-break"
import { EditorHeading, EditorHeadingToolbar } from "@/components/ui/editor-heading"

export function Example() {
  return (
    <Editor defaultValue="<h1>Title</h1><h2>Section</h2><p>Body</p>">
      <EditorText />
      <EditorParagraph />
      <EditorHardBreak />
      <EditorHeading levels={[1, 2, 3]} />
      <EditorToolbar>
        <EditorHeadingToolbar />
      </EditorToolbar>
      <EditorContent className="min-h-40" />
    </Editor>
  )
}`

export const headingDocs: DocsPageData = {
  examples: [
    {
      title: 'Default',
      component: EditorHeadingDemo,
      code: editorHeadingCode,
    },
  ],
  usage: [
    { title: 'Usage', code: usage, language: 'tsx' },
  ],
  api: [
    {
      name: 'EditorHeading',
      description:
        'Registers the heading node. The toolbar selector only offers the levels registered here.',
      rows: [
        { prop: 'levels', type: 'Level[]', default: '[1, 2, 3]' },
      ],
    },
    {
      name: 'EditorHeadingToolbar',
      description:
        'Block type selector for paragraphs and the registered heading levels.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  requiresTypeset: true,
}
