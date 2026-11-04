import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import { EditorBold, EditorBoldToolbar } from '@/registry/blocove/ui/rich-text-editor/bold'
import { EditorCode, EditorCodeToolbar } from '@/registry/blocove/ui/rich-text-editor/code'
import {
  EditorCodeBlock,
  EditorCodeBlockToolbar,
} from '@/registry/blocove/ui/rich-text-editor/code-block'
import {
  EditorHeading,
  EditorHeadingToolbar,
} from '@/registry/blocove/ui/rich-text-editor/heading'
import {
  EditorItalic,
  EditorItalicToolbar,
} from '@/registry/blocove/ui/rich-text-editor/italic'
import { EditorLink, EditorLinkToolbar } from '@/registry/blocove/ui/rich-text-editor/link'
import {
  EditorStrike,
  EditorStrikeToolbar,
} from '@/registry/blocove/ui/rich-text-editor/strike'
import {
  EditorUnderline,
  EditorUnderlineToolbar,
} from '@/registry/blocove/ui/rich-text-editor/underline'

export default function RichTextEditorDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.overview}
      characterCount="characters"
      extensions={(
        <>
          <EditorHeading />
          <EditorCodeBlock />
          <EditorBold />
          <EditorItalic />
          <EditorUnderline />
          <EditorStrike />
          <EditorCode />
          <EditorLink />
        </>
      )}
      toolbar={(
        <>
          <EditorHeadingToolbar />
          <EditorBoldToolbar />
          <EditorItalicToolbar />
          <EditorUnderlineToolbar />
          <EditorStrikeToolbar />
          <EditorCodeToolbar />
          <EditorCodeBlockToolbar />
          <EditorLinkToolbar />
        </>
      )}
      bubble={(
        <>
          <EditorBoldToolbar />
          <EditorItalicToolbar />
          <EditorUnderlineToolbar />
          <EditorStrikeToolbar />
          <EditorCodeToolbar />
        </>
      )}
    />
  )
}
