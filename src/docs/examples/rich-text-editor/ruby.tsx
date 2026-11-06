import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import {
  EditorRuby,
  EditorRubyToolbar,
} from '@/registry/blocove/ui/rich-text-editor/ruby'

export default function EditorRubyDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.ruby}
      extensions={<EditorRuby />}
      toolbar={<EditorRubyToolbar />}
      bubble={<EditorRubyToolbar />}
    />
  )
}
