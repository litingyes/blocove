import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import { EditorBold, EditorBoldToolbar } from '@/registry/blocove/ui/rich-text-editor/bold'

export default function EditorBoldDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.bold}
      extensions={<EditorBold />}
      toolbar={<EditorBoldToolbar />}
      bubble={<EditorBoldToolbar />}
    />
  )
}
