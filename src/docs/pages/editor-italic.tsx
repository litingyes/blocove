import type { DocsPageData } from '@/docs/types'
import EditorItalicDemo from '@/docs/examples/editor-italic'
import editorItalicCode from '@/docs/examples/editor-italic?raw'

const usage = `import {
  Editor,
  EditorBubbleMenu,
  EditorContent,
  EditorToolbar,
} from "@/components/ui/editor"
import { EditorText } from "@/components/ui/editor-text"
import { EditorParagraph } from "@/components/ui/editor-paragraph"
import { EditorHardBreak } from "@/components/ui/editor-hard-break"
import { EditorItalic, EditorItalicToolbar } from "@/components/ui/editor-italic"

export function Example() {
  return (
    <Editor defaultValue="<p><em>Italic</em> text</p>">
      <EditorText />
      <EditorParagraph />
      <EditorHardBreak />
      <EditorItalic />
      <EditorToolbar>
        <EditorItalicToolbar />
      </EditorToolbar>
      <EditorBubbleMenu>
        <EditorItalicToolbar />
      </EditorBubbleMenu>
      <EditorContent className="min-h-40" />
    </Editor>
  )
}`

export const italicDocs: DocsPageData = {
  examples: [
    { title: 'Default', component: EditorItalicDemo, code: editorItalicCode },
  ],
  usage: [
    { title: 'Usage', code: usage, language: 'tsx' },
  ],
  api: [
    {
      name: 'EditorItalic',
      description:
        'Registers the italic mark. Options pass through to the Tiptap extension.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<ItalicOptions>',
          default: '-',
        },
      ],
    },
    {
      name: 'EditorItalicToolbar',
      description:
        'Toolbar toggle for the italic mark, also usable inside the bubble menu.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  requiresTypeset: true,
}
