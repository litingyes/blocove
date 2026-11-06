import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import {
  EditorBulletList,
  EditorListToolbar,
  EditorOrderedList,
  EditorTaskList,
} from '@/registry/blocove/ui/rich-text-editor/list'

export default function EditorListDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.list}
      extensions={(
        <>
          <EditorBulletList />
          <EditorOrderedList />
          <EditorTaskList />
        </>
      )}
      toolbar={<EditorListToolbar />}
    />
  )
}
