import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import {
  EditorSuperscript,
  EditorSuperscriptToolbar,
} from '@/registry/blocove/ui/rich-text-editor/superscript'

export default function EditorSuperscriptDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.superscript}
      extensions={<EditorSuperscript />}
      toolbar={<EditorSuperscriptToolbar />}
      bubble={<EditorSuperscriptToolbar />}
    />
  )
}
