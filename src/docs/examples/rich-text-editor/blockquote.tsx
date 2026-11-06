import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import {
  EditorBlockquote,
  EditorBlockquoteToolbar,
} from '@/registry/blocove/ui/rich-text-editor/blockquote'

export default function EditorBlockquoteDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.blockquote}
      extensions={<EditorBlockquote />}
      toolbar={<EditorBlockquoteToolbar />}
    />
  )
}
