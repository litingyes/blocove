import type { DocsPageData } from '@/docs/types'
import EditorUnderlineDemo from '@/docs/examples/editor-underline'
import editorUnderlineCode from '@/docs/examples/editor-underline?raw'

const usage = `import {
  Editor,
  EditorBubbleMenu,
  EditorContent,
  EditorToolbar,
} from "@/components/ui/editor"
import { EditorText } from "@/components/ui/editor-text"
import { EditorParagraph } from "@/components/ui/editor-paragraph"
import { EditorHardBreak } from "@/components/ui/editor-hard-break"
import { EditorUnderline, EditorUnderlineToolbar } from "@/components/ui/editor-underline"

export function Example() {
  return (
    <Editor defaultValue="<p><u>Underline</u> text</p>">
      <EditorText />
      <EditorParagraph />
      <EditorHardBreak />
      <EditorUnderline />
      <EditorToolbar>
        <EditorUnderlineToolbar />
      </EditorToolbar>
      <EditorBubbleMenu>
        <EditorUnderlineToolbar />
      </EditorBubbleMenu>
      <EditorContent className="min-h-40" />
    </Editor>
  )
}`

export const underlineDocs: DocsPageData = {
  examples: [
    {
      title: 'Default',
      component: EditorUnderlineDemo,
      code: editorUnderlineCode,
    },
  ],
  usage: [
    { title: 'Usage', code: usage, language: 'tsx' },
  ],
  api: [
    {
      name: 'EditorUnderline',
      description:
        'Registers the underline mark. Options pass through to the Tiptap extension.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<UnderlineOptions>',
          default: '-',
        },
      ],
    },
    {
      name: 'EditorUnderlineToolbar',
      description:
        'Toolbar toggle for the underline mark, also usable inside the bubble menu.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  requiresTypeset: true,
}
