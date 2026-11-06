import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import { EditorUniqueId } from '@/registry/blocove/ui/rich-text-editor/unique-id'

export default function EditorUniqueIdDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.uniqueId}
      extensions={<EditorUniqueId />}
    />
  )
}
