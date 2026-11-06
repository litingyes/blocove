import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import { EditorMention } from '@/registry/blocove/ui/rich-text-editor/mention'

export default function EditorMentionDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.mention}
      extensions={<EditorMention />}
    />
  )
}
