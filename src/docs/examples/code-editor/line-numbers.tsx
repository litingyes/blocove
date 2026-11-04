import { CodeEditorDemoFrame } from '@/docs/examples/code-editor/frame'
import { CodeEditorLineNumbers } from '@/registry/blocove/ui/code-editor/line-numbers'
import { CodeEditorShiki } from '@/registry/blocove/ui/code-editor/shiki'

export default function CodeEditorLineNumbersDemo() {
  return (
    <CodeEditorDemoFrame
      extensions={(
        <>
          <CodeEditorShiki />
          <CodeEditorLineNumbers />
        </>
      )}
    />
  )
}
