import type { DocsPageData } from '@/docs/types'
import EditorStrikeDemo from '@/docs/examples/editor-strike'
import editorStrikeCode from '@/docs/examples/editor-strike?raw'

const usage = `import {
  Editor,
  EditorBubbleMenu,
  EditorContent,
  EditorToolbar,
} from "@/components/ui/editor"
import { EditorText } from "@/components/ui/editor-text"
import { EditorParagraph } from "@/components/ui/editor-paragraph"
import { EditorHardBreak } from "@/components/ui/editor-hard-break"
import { EditorStrike, EditorStrikeToolbar } from "@/components/ui/editor-strike"

export function Example() {
  return (
    <Editor defaultValue="<p><s>Struck</s> text</p>">
      <EditorText />
      <EditorParagraph />
      <EditorHardBreak />
      <EditorStrike />
      <EditorToolbar>
        <EditorStrikeToolbar />
      </EditorToolbar>
      <EditorBubbleMenu>
        <EditorStrikeToolbar />
      </EditorBubbleMenu>
      <EditorContent className="min-h-40" />
    </Editor>
  )
}`

export const strikeDocs: DocsPageData = {
  examples: [
    { title: 'Default', component: EditorStrikeDemo, code: editorStrikeCode },
  ],
  usage: [
    { title: 'Usage', code: usage, language: 'tsx' },
  ],
  api: [
    {
      name: 'EditorStrike',
      description:
        'Registers the strikethrough mark. Options pass through to the Tiptap extension.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<StrikeOptions>',
          default: '-',
        },
      ],
    },
    {
      name: 'EditorStrikeToolbar',
      description:
        'Toolbar toggle for the strikethrough mark, also usable inside the bubble menu.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  requiresTypeset: true,
}
