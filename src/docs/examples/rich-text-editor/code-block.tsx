import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import { EditorCodeBlock, EditorCodeBlockToolbar } from '@/registry/blocove/ui/rich-text-editor/code-block'

export default function EditorCodeBlockDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.codeBlock}
      extensions={<EditorCodeBlock />}
      toolbar={<EditorCodeBlockToolbar />}
    />
  )
}
