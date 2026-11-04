import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import { EditorItalic, EditorItalicToolbar } from '@/registry/blocove/ui/rich-text-editor/italic'

export default function EditorItalicDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.italic}
      extensions={<EditorItalic />}
      toolbar={<EditorItalicToolbar />}
      bubble={<EditorItalicToolbar />}
    />
  )
}
