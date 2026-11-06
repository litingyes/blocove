import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import { EditorTypography } from '@/registry/blocove/ui/rich-text-editor/typography'

export default function EditorTypographyDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.typography}
      extensions={<EditorTypography />}
    />
  )
}
