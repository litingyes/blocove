import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import { EditorDragHandle } from '@/registry/blocove/ui/rich-text-editor/drag-handle'

export default function EditorDragHandleDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.dragHandle}
      extensions={<EditorDragHandle />}
    />
  )
}
