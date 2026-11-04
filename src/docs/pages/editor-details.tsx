import type { DocsPageData } from '@/docs/types'
import EditorDetailsDemo from '@/docs/examples/editor-details'
import editorDetailsCode from '@/docs/examples/editor-details?raw'

const usage = `import { Editor, EditorContent, EditorToolbar } from "@/components/ui/editor"
import { EditorText } from "@/components/ui/editor-text"
import { EditorParagraph } from "@/components/ui/editor-paragraph"
import { EditorHardBreak } from "@/components/ui/editor-hard-break"
import { EditorDetails, EditorDetailsToolbar } from "@/components/ui/editor-details"

export function Example() {
  return (
    <Editor
      defaultValue={'<details open><summary>Summary</summary><div data-type="detailsContent"><p>Content</p></div></details>'}
    >
      <EditorText />
      <EditorParagraph />
      <EditorHardBreak />
      <EditorDetails />
      <EditorToolbar>
        <EditorDetailsToolbar />
      </EditorToolbar>
      <EditorContent className="min-h-40" />
    </Editor>
  )
}`

export const detailsDocs: DocsPageData = {
  examples: [
    {
      title: 'Default',
      component: EditorDetailsDemo,
      code: editorDetailsCode,
    },
  ],
  usage: [
    { title: 'Usage', code: usage, language: 'tsx' },
  ],
  api: [
    {
      name: 'EditorDetails',
      description:
        'Registers the details, summary and content nodes with a React node view. The open state is stored on the node, so it persists in the document.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<DetailsOptions>',
          default: '{ persist: true }',
        },
      ],
    },
    {
      name: 'EditorDetailsToolbar',
      description: 'Toolbar action that inserts a details block.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  requiresTypeset: true,
}
