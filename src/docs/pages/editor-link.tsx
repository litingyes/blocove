import type { DocsPageData } from '@/docs/types'
import EditorLinkDemo from '@/docs/examples/editor-link'
import editorLinkCode from '@/docs/examples/editor-link?raw'

const usage = `import {
  Editor,
  EditorBubbleMenu,
  EditorContent,
  EditorToolbar,
} from "@/components/ui/editor"
import { EditorText } from "@/components/ui/editor-text"
import { EditorParagraph } from "@/components/ui/editor-paragraph"
import { EditorHardBreak } from "@/components/ui/editor-hard-break"
import { EditorLink, EditorLinkToolbar } from "@/components/ui/editor-link"

export function Example() {
  return (
    <Editor defaultValue={'<p><a href="https://ui.shadcn.com">link</a> text</p>'}>
      <EditorText />
      <EditorParagraph />
      <EditorHardBreak />
      <EditorLink />
      <EditorToolbar>
        <EditorLinkToolbar />
      </EditorToolbar>
      <EditorBubbleMenu>
        <EditorLinkToolbar />
      </EditorBubbleMenu>
      <EditorContent className="min-h-40" />
    </Editor>
  )
}`

export const linkDocs: DocsPageData = {
  examples: [
    { title: 'Default', component: EditorLinkDemo, code: editorLinkCode },
  ],
  usage: [
    { title: 'Usage', code: usage, language: 'tsx' },
  ],
  api: [
    {
      name: 'EditorLink',
      description:
        'Registers the link mark. Links do not open on click while editing; the toolbar popover inserts, replaces and removes them.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<LinkOptions>',
          default: '-',
        },
      ],
    },
    {
      name: 'EditorLinkToolbar',
      description:
        'URL popover with Apply and Remove actions. Inputs without a protocol get https://, while mailto: and tel: are kept.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  requiresTypeset: true,
}
