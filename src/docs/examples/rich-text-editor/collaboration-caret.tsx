import { CollaborationDemo } from '@/docs/examples/rich-text-editor/collaboration-frame'
import { EditorBold, EditorBoldToolbar } from '@/registry/blocove/ui/rich-text-editor/bold'
import { EditorCollaboration } from '@/registry/blocove/ui/rich-text-editor/collaboration'
import { EditorCollaborationCaret } from '@/registry/blocove/ui/rich-text-editor/collaboration-caret'
import {
  Editor,
  EditorContent,
  EditorToolbar,
} from '@/registry/blocove/ui/rich-text-editor/editor'
import { EditorHardBreak } from '@/registry/blocove/ui/rich-text-editor/hard-break'
import { EditorParagraph } from '@/registry/blocove/ui/rich-text-editor/paragraph'
import { EditorText } from '@/registry/blocove/ui/rich-text-editor/text'

export default function EditorCollaborationCaretDemo() {
  return (
    <CollaborationDemo>
      {pane => (
        <Editor placeholder={`Type as ${pane.user.name}…`}>
          <EditorText />
          <EditorParagraph />
          <EditorHardBreak />
          <EditorBold />
          <EditorCollaboration document={pane.document} />
          <EditorCollaborationCaret
            provider={pane.provider}
            user={pane.user}
          />
          <EditorToolbar>
            <EditorBoldToolbar />
          </EditorToolbar>
          <EditorContent className="min-h-40" />
        </Editor>
      )}
    </CollaborationDemo>
  )
}
