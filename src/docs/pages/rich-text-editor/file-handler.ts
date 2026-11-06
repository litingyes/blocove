import type { DocsPage } from '@/docs/types'
import EditorFileHandlerDemo from '@/docs/examples/rich-text-editor/file-handler'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-file-handler',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorFileHandlerDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorFileHandler',
          'EditorImage',
        ],
        content: '<p>Paste or drop an image here.</p>',
      }),
    },
  ],
  usage: [
    {
      title: 'Upload the file yourself',
      code: `import { EditorFileHandler } from "@/components/blocove/rich-text-editor/file-handler"

async function upload(file: File) {
  const body = new FormData()
  body.append("file", file)
  const response = await fetch("/api/upload", { method: "POST", body })
  const { url } = await response.json()
  return url
}

export function UploadEditor() {
  return (
    <Editor>
      <EditorFileHandler onFile={upload} />
      <EditorContent />
    </Editor>
  )
}`,
    },
  ],
  api: [
    {
      name: 'EditorFileHandler',
      description: 'Registers the paste and drop handler for files.',
      rows: [
        { prop: 'allowedMimeTypes', type: 'string[]', default: 'PNG, JPEG, GIF and WebP' },
        { prop: 'onFile', type: '(file: File) => Promise<string> | string', default: 'Reads the file as a data URL' },
      ],
    },
  ],
  note: 'Files are inserted as image nodes, so install the image node too. The default reads the file into a data URL, which keeps the document self-contained; pass `onFile` to upload the file first and insert the returned URL instead.',
}
