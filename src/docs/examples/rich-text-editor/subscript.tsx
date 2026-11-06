import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import {
  EditorSubscript,
  EditorSubscriptToolbar,
} from '@/registry/blocove/ui/rich-text-editor/subscript'

export default function EditorSubscriptDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.subscript}
      extensions={<EditorSubscript />}
      toolbar={<EditorSubscriptToolbar />}
      bubble={<EditorSubscriptToolbar />}
    />
  )
}
