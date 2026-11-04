import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import { EditorLink, EditorLinkToolbar } from '@/registry/blocove/ui/rich-text-editor/link'

export default function EditorLinkDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.link}
      extensions={<EditorLink />}
      toolbar={<EditorLinkToolbar />}
      bubble={<EditorLinkToolbar />}
    />
  )
}
