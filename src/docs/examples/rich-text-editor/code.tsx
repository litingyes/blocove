import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import { EditorCode, EditorCodeToolbar } from '@/registry/blocove/ui/rich-text-editor/code'

export default function EditorCodeDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.code}
      extensions={<EditorCode />}
      toolbar={<EditorCodeToolbar />}
      bubble={<EditorCodeToolbar />}
    />
  )
}
