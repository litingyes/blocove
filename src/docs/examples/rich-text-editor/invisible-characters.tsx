import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import {
  EditorInvisibleCharacters,
  EditorInvisibleCharactersToolbar,
} from '@/registry/blocove/ui/rich-text-editor/invisible-characters'

export default function EditorInvisibleCharactersDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.invisibleCharacters}
      extensions={<EditorInvisibleCharacters />}
      toolbar={<EditorInvisibleCharactersToolbar />}
    />
  )
}
