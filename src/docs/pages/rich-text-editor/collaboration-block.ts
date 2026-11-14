import type { DocsPage } from '@/docs/types'
import RichTextEditorCollaborationBlockDemo from '@/docs/examples/rich-text-editor/collaboration-block'
import { getRegistrySource } from '@/lib/registry-source'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-collaboration-block',
  requiresTypeset: true,
  examples: [
    {
      title: 'Collaborative editor',
      component: RichTextEditorCollaborationBlockDemo,
      // The block is a single file, so the code panel shows exactly what the
      // CLI installs instead of a generated snippet.
      code: getRegistrySource('blocks/rich-text-editor-collaboration-block.tsx') ?? '',
    },
  ],
  usage: [
    {
      title: 'Use the block',
      code: `import { RichTextEditorCollaborationBlock } from "@/components/blocove/rich-text-editor-collaboration-block"
import { HocuspocusProvider } from "@hocuspocus/provider"
import * as Y from "yjs"

const sharedDocument = new Y.Doc()

const provider = new HocuspocusProvider({
  url: "wss://collab.example.com",
  name: "product-launch",
  document: sharedDocument,
})

const user = { name: "Ada Lovelace", color: "#2563eb" }

export function DocumentEditor() {
  return (
    <RichTextEditorCollaborationBlock
      document={sharedDocument}
      provider={provider}
      user={user}
      onChange={html => console.log(html)}
    />
  )
}`,
    },
  ],
  demoDeps: [
    'rich-text-editor-collaboration-block',
    'rich-text-editor-bold',
    'rich-text-editor-italic',
    'rich-text-editor-link',
    'rich-text-editor-collaboration',
    'rich-text-editor-collaboration-caret',
    'rich-text-editor-presence',
  ],
  api: [
    {
      name: 'RichTextEditorCollaborationBlock',
      description:
        'The shared document, the cursors, the presence bar and the connection status, composed in one file.',
      rows: [
        { prop: 'document', type: 'Y.Doc', default: 'required' },
        { prop: 'provider', type: 'CollaborationProvider', default: 'required' },
        { prop: 'user', type: 'CollaborationUser', default: 'required' },
        { prop: 'placeholder', type: 'string', default: '"Start writing together…"' },
        { prop: 'editable', type: 'boolean', default: 'true' },
        { prop: 'onChange', type: '(html: string) => void', default: '-' },
        { prop: 'presenceLimit', type: 'number', default: '4' },
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  note: 'The block owns no transport: create the Yjs document and the provider in the app, connect them to your Hocuspocus server, and pass them in. It takes no `value` or `defaultValue` because the shared document is the source of truth; seed the Yjs document server-side (or with the first peer) instead of the React tree. `onChange` also fires for remote edits, since every peer sees the same document.',
}
