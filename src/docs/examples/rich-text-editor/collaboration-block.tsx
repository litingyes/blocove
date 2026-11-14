import { CollaborationDemo } from '@/docs/examples/rich-text-editor/collaboration-frame'
import { RichTextEditorCollaborationBlock } from '@/registry/blocove/blocks/rich-text-editor-collaboration-block'

export default function RichTextEditorCollaborationBlockDemo() {
  return (
    <CollaborationDemo>
      {pane => (
        <RichTextEditorCollaborationBlock
          document={pane.document}
          provider={pane.provider}
          user={pane.user}
        />
      )}
    </CollaborationDemo>
  )
}
