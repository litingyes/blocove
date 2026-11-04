import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import { EditorDetails, EditorDetailsToolbar } from '@/registry/blocove/ui/rich-text-editor/details'

export default function EditorDetailsDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.details}
      extensions={<EditorDetails />}
      toolbar={<EditorDetailsToolbar />}
    />
  )
}
