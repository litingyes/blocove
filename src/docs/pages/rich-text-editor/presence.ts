import type { DocsPage } from '@/docs/types'
import EditorPresenceDemo from '@/docs/examples/rich-text-editor/presence'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-presence',
  requiresTypeset: true,
  examples: [
    {
      title: 'Who is in the document',
      component: EditorPresenceDemo,
      code: `import { Editor, EditorContent, EditorToolbar } from "@/components/blocove/rich-text-editor/editor"
import { EditorCollaboration } from "@/components/blocove/rich-text-editor/collaboration"
import { EditorPresence, EditorCollaborationStatus } from "@/components/blocove/rich-text-editor/presence"
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

provider.setAwarenessField("user", {
  name: "Ada Lovelace",
  color: "#2563eb",
})

export function Example() {
  return (
    <Editor>
      <EditorText />
      <EditorParagraph />
      <EditorCollaboration document={sharedDocument} />

      <div className="flex items-center justify-between gap-3 px-3 pt-2">
        <EditorPresence provider={provider} />
        <EditorCollaborationStatus provider={provider} />
      </div>

      <EditorToolbar />
      <EditorContent />
    </Editor>
  )
}`,
    },
  ],
  api: [
    {
      name: 'EditorPresence',
      description: 'The avatar stack of the peers currently in the document.',
      rows: [
        { prop: 'provider', type: 'CollaborationProvider', default: 'required' },
        { prop: 'max', type: 'number', default: '4' },
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
    {
      name: 'EditorCollaborationStatus',
      description: 'The connection state of the provider: live, connecting or offline.',
      rows: [
        { prop: 'provider', type: 'CollaborationProvider', default: 'required' },
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  demoDeps: [
    'rich-text-editor-presence',
    'rich-text-editor-collaboration',
    'rich-text-editor-text',
    'rich-text-editor-paragraph',
    'rich-text-editor-hard-break',
  ],
  note: 'Both components read the provider awareness and render nothing until a peer advertises itself. The caret publishes the user record for you; when the document has no caret item, set it with `provider.setAwarenessField("user", …)`. The status item is the honest half of a demo: it shows Offline instead of pretending the document is shared when the websocket is down.',
}
