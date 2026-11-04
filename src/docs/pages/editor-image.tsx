import type { DocsPageData } from '@/docs/types'
import EditorImageDemo from '@/docs/examples/editor-image'
import editorImageCode from '@/docs/examples/editor-image?raw'

const usage = `import { Editor, EditorContent, EditorToolbar } from "@/components/ui/editor"
import { EditorText } from "@/components/ui/editor-text"
import { EditorParagraph } from "@/components/ui/editor-paragraph"
import { EditorHardBreak } from "@/components/ui/editor-hard-break"
import { EditorImage, EditorImageToolbar } from "@/components/ui/editor-image"

export function Example() {
  return (
    <Editor defaultValue={'<p>Before</p><img src="/editor-image.svg" alt="Example"><p>After</p>'}>
      <EditorText />
      <EditorParagraph />
      <EditorHardBreak />
      <EditorImage />
      <EditorToolbar>
        <EditorImageToolbar />
      </EditorToolbar>
      <EditorContent className="min-h-40" />
    </Editor>
  )
}`

export const imageDocs: DocsPageData = {
  examples: [
    {
      title: 'Default',
      component: EditorImageDemo,
      code: editorImageCode,
    },
  ],
  usage: [
    { title: 'Usage', code: usage, language: 'tsx' },
  ],
  api: [
    {
      name: 'EditorImage',
      description:
        'Registers the image node. Options pass through to the Tiptap extension; uploads are not included, the toolbar inserts by URL.',
      rows: [
        {
          prop: '...options',
          type: 'Partial<ImageOptions>',
          default: '-',
        },
      ],
    },
    {
      name: 'EditorImageToolbar',
      description:
        'Toolbar control with a URL popover. Opening it while an image is selected pre-fills the current source.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  requiresTypeset: true,
}
