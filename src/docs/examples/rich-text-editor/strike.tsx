import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import { EditorStrike, EditorStrikeToolbar } from '@/registry/blocove/ui/rich-text-editor/strike'

export default function EditorStrikeDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.strike}
      extensions={<EditorStrike />}
      toolbar={<EditorStrikeToolbar />}
      bubble={<EditorStrikeToolbar />}
    />
  )
}
