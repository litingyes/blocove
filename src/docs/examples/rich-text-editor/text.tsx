import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'

export default function EditorTextDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.text}
    />
  )
}
