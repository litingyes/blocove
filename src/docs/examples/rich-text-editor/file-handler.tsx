import { richTextEditorDemoContent } from '@/docs/examples/rich-text-editor/content'
import { RichTextEditorDemoFrame } from '@/docs/examples/rich-text-editor/frame'
import { EditorFileHandler } from '@/registry/blocove/ui/rich-text-editor/file-handler'
import { EditorImage } from '@/registry/blocove/ui/rich-text-editor/image'

export default function EditorFileHandlerDemo() {
  return (
    <RichTextEditorDemoFrame
      content={richTextEditorDemoContent.fileHandler}
      extensions={(
        <>
          <EditorFileHandler />
          <EditorImage allowBase64 />
        </>
      )}
    />
  )
}
