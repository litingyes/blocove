import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import {
  EditorFindAndReplace,
  EditorFindAndReplaceToolbar,
} from '@/registry/blocove/ui/rich-text-editor/find-and-replace'

export default function EditorFindAndReplaceDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.findAndReplace}
      extensions={<EditorFindAndReplace />}
      toolbar={<EditorFindAndReplaceToolbar />}
    />
  )
}
