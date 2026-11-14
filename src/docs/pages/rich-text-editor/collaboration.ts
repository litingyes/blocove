import type { DocsPage } from '@/docs/types'
import EditorCollaborationDemo from '@/docs/examples/rich-text-editor/collaboration'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-collaboration',
  requiresTypeset: true,
  examples: [
    {
      title: 'Two peers, one document',
      component: EditorCollaborationDemo,
      code: `import { Editor, EditorContent, EditorToolbar } from "@/components/blocove/rich-text-editor/editor"
import { EditorCollaboration } from "@/components/blocove/rich-text-editor/collaboration"
import { EditorParagraph } from "@/components/blocove/rich-text-editor/paragraph"
import { EditorText } from "@/components/blocove/rich-text-editor/text"
import { HocuspocusProvider } from "@hocuspocus/provider"
import * as Y from "yjs"

const sharedDocument = new Y.Doc()

const provider = new HocuspocusProvider({
  url: "wss://collab.example.com",
  name: "product-launch",
  document: sharedDocument,
})

export function Example() {
  return (
    <Editor>
      <EditorText />
      <EditorParagraph />
      <EditorCollaboration document={sharedDocument} />
      <EditorToolbar />
      <EditorContent />
    </Editor>
  )
}`,
    },
  ],
  api: [
    {
      name: 'EditorCollaboration',
      description: 'Binds the editor to a Yjs document through the collaboration extension.',
      rows: [
        { prop: 'document', type: 'Y.Doc', default: 'required' },
        { prop: 'field', type: 'string', default: '"default"' },
      ],
    },
  ],
  demoDeps: [
    'rich-text-editor-collaboration',
    'rich-text-editor-text',
    'rich-text-editor-paragraph',
    'rich-text-editor-hard-break',
  ],
  note: 'The Yjs document is the source of truth: once this extension is declared the editor stops seeding its content from `value` or `defaultValue`, and the local undo history steps aside for the one collaboration owns. Create the document and the provider in your app, connect them to a Hocuspocus server, and pass the same document to every editor.',
}
