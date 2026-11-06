import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import {
  EditorMathematics,
  EditorMathematicsToolbar,
} from '@/registry/blocove/ui/rich-text-editor/mathematics'

export default function EditorMathematicsDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.mathematics}
      extensions={<EditorMathematics />}
      toolbar={<EditorMathematicsToolbar />}
    />
  )
}
