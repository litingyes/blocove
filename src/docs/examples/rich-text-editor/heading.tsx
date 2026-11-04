import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import { EditorHeading, EditorHeadingToolbar } from '@/registry/blocove/ui/rich-text-editor/heading'

export default function EditorHeadingDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.heading}
      extensions={<EditorHeading />}
      toolbar={<EditorHeadingToolbar />}
    />
  )
}
