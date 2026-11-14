import { CollaborationDemo } from '@/docs/examples/rich-text-editor/collaboration-frame'
import { EditorCollaboration } from '@/registry/blocove/ui/rich-text-editor/collaboration'
import {
  Editor,
  EditorContent,
  EditorToolbar,
} from '@/registry/blocove/ui/rich-text-editor/editor'
import { EditorHardBreak } from '@/registry/blocove/ui/rich-text-editor/hard-break'
import { EditorParagraph } from '@/registry/blocove/ui/rich-text-editor/paragraph'
import { EditorText } from '@/registry/blocove/ui/rich-text-editor/text'

export default function EditorCollaborationDemo() {
  return (
    <CollaborationDemo>
      {pane => (
        <Editor placeholder={`Type as ${pane.user.name}…`}>
          <EditorText />
          <EditorParagraph />
          <EditorHardBreak />
          <EditorCollaboration document={pane.document} />
          <EditorToolbar />
          <EditorContent className="min-h-40" />
        </Editor>
      )}
    </CollaborationDemo>
  )
}
