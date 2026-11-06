import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import {
  EditorHighlight,
  EditorHighlightToolbar,
} from '@/registry/blocove/ui/rich-text-editor/highlight'

export default function EditorHighlightDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.highlight}
      extensions={<EditorHighlight />}
      toolbar={<EditorHighlightToolbar />}
      bubble={<EditorHighlightToolbar />}
    />
  )
}
