import type { DocsPage } from '@/docs/types'
import EditorCollaborationCaretDemo from '@/docs/examples/rich-text-editor/collaboration-caret'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-collaboration-caret',
  requiresTypeset: true,
  examples: [
    {
      title: 'Cursors and selections',
      component: EditorCollaborationCaretDemo,
      code: `import { Editor, EditorContent, EditorToolbar } from "@/components/blocove/rich-text-editor/editor"
import { EditorCollaboration } from "@/components/blocove/rich-text-editor/collaboration"
import { EditorCollaborationCaret } from "@/components/blocove/rich-text-editor/collaboration-caret"
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

const user = { name: "Ada Lovelace", color: "#2563eb" }

export function Example() {
  return (
    <Editor>
      <EditorText />
      <EditorParagraph />
      <EditorCollaboration document={sharedDocument} />
      <EditorCollaborationCaret provider={provider} user={user} />
      <EditorToolbar />
      <EditorContent />
    </Editor>
  )
}`,
    },
  ],
  api: [
    {
      name: 'EditorCollaborationCaret',
      description: 'Draws the cursors and the selections of the other peers from the provider awareness.',
      rows: [
        { prop: 'provider', type: 'CollaborationProvider', default: 'required' },
        { prop: 'user', type: 'CollaborationUser', default: 'required' },
        { prop: 'render', type: '(user) => HTMLElement', default: 'Built-in caret' },
        { prop: 'selectionRender', type: '(user) => DecorationAttrs', default: 'Built-in selection' },
      ],
    },
  ],
  demoDeps: [
    'rich-text-editor-collaboration-caret',
    'rich-text-editor-collaboration',
    'rich-text-editor-text',
    'rich-text-editor-paragraph',
    'rich-text-editor-hard-break',
  ],
  note: 'The extension publishes the local user through the provider awareness, so the presence bar reads the same record. It needs a provider with awareness enabled: create the provider before mounting the editor, and pass a `name` and a `color` so the cursor label is readable.',
}
