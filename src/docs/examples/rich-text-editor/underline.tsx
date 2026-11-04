import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import { EditorUnderline, EditorUnderlineToolbar } from '@/registry/blocove/ui/rich-text-editor/underline'

export default function EditorUnderlineDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.underline}
      extensions={<EditorUnderline />}
      toolbar={<EditorUnderlineToolbar />}
      bubble={<EditorUnderlineToolbar />}
    />
  )
}
