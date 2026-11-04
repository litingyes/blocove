import type { DocsPageData } from '@/docs/types'
import EditorBoldDemo from '@/docs/examples/editor-bold'
import editorBoldCode from '@/docs/examples/editor-bold?raw'

const usage = `import {
  Editor,
  EditorBubbleMenu,
  EditorContent,
  EditorToolbar,
} from "@/components/ui/editor"
import { EditorText } from "@/components/ui/editor-text"
import { EditorParagraph } from "@/components/ui/editor-paragraph"
import { EditorHardBreak } from "@/components/ui/editor-hard-break"
import { EditorBold, EditorBoldToolbar } from "@/components/ui/editor-bold"

export function Example() {
  return (
    <Editor defaultValue="<p><strong>Bold</strong> text</p>">
      <EditorText />
      <EditorParagraph />
      <EditorHardBreak />
      <EditorBold />
      <EditorToolbar>
        <EditorBoldToolbar />
      </EditorToolbar>
      <EditorBubbleMenu>
        <EditorBoldToolbar />
      </EditorBubbleMenu>
      <EditorContent className="min-h-40" />
    </Editor>
  )
}`

export const boldDocs: DocsPageData = {
  examples: [
    { title: 'Default', component: EditorBoldDemo, code: editorBoldCode },
  ],
  usage: [
    { title: 'Usage', code: usage, language: 'tsx' },
  ],
  api: [
    {
      name: 'EditorBold',
      description: 'Registers the bold mark.',
      rows: [],
    },
    {
      name: 'EditorBoldToolbar',
      description:
        'Toolbar toggle for the bold mark, also usable inside the bubble menu.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  requiresTypeset: true,
}
