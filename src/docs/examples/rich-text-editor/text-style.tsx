import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import {
  EditorBackgroundColor,
  EditorColor,
  EditorFontFamily,
  EditorFontSize,
  EditorLineHeight,
  EditorTextStyle,
  EditorTextStyleToolbar,
} from '@/registry/blocove/ui/rich-text-editor/text-style'

export default function EditorTextStyleDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.textStyle}
      extensions={(
        <>
          <EditorTextStyle />
          <EditorColor />
          <EditorBackgroundColor />
          <EditorFontFamily />
          <EditorFontSize />
          <EditorLineHeight />
        </>
      )}
      toolbar={<EditorTextStyleToolbar />}
      bubble={<EditorTextStyleToolbar />}
    />
  )
}
