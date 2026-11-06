import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import {
  EditorFocus,
  EditorGapcursor,
  EditorTrailingNode,
} from '@/registry/blocove/ui/rich-text-editor/behavior'

export default function EditorBehaviorDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.behavior}
      extensions={(
        <>
          <EditorFocus />
          <EditorGapcursor />
          <EditorTrailingNode />
        </>
      )}
    />
  )
}
