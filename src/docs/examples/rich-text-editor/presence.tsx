import { CollaborationDemo } from '@/docs/examples/rich-text-editor/collaboration-frame'
import { EditorCollaboration } from '@/registry/blocove/ui/rich-text-editor/collaboration'
import {
  Editor,
  EditorContent,
  EditorToolbar,
} from '@/registry/blocove/ui/rich-text-editor/editor'
import { EditorHardBreak } from '@/registry/blocove/ui/rich-text-editor/hard-break'
import { EditorParagraph } from '@/registry/blocove/ui/rich-text-editor/paragraph'
import {
  EditorCollaborationStatus,
  EditorPresence,
} from '@/registry/blocove/ui/rich-text-editor/presence'
import { EditorText } from '@/registry/blocove/ui/rich-text-editor/text'

export default function EditorPresenceDemo() {
  return (
    <CollaborationDemo>
      {pane => (
        <Editor placeholder={`Type as ${pane.user.name}…`}>
          <EditorText />
          <EditorParagraph />
          <EditorHardBreak />
          <EditorCollaboration document={pane.document} />

          <div className="flex items-center justify-between gap-3 px-3 pt-2">
            <EditorPresence provider={pane.provider} />
            <EditorCollaborationStatus provider={pane.provider} />
          </div>

          <EditorToolbar />
          <EditorContent className="min-h-40" />
        </Editor>
      )}
    </CollaborationDemo>
  )
}
