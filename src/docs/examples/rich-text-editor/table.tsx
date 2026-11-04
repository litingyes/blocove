import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import { EditorTable, EditorTableToolbar } from '@/registry/blocove/ui/rich-text-editor/table'

export default function EditorTableDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.table}
      extensions={<EditorTable />}
      toolbar={<EditorTableToolbar />}
    />
  )
}
