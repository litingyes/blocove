import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'

export default function EditorParagraphDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.paragraph}
    />
  )
}
