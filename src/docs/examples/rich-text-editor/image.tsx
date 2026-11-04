import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import { EditorImage, EditorImageToolbar } from '@/registry/blocove/ui/rich-text-editor/image'

export default function EditorImageDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.image}
      extensions={<EditorImage />}
      toolbar={<EditorImageToolbar />}
    />
  )
}
