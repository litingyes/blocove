import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import { EditorEmoji, EditorEmojiToolbar } from '@/registry/blocove/ui/rich-text-editor/emoji'

export default function EditorEmojiDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.emoji}
      extensions={<EditorEmoji />}
      toolbar={<EditorEmojiToolbar />}
    />
  )
}
