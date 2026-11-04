import { codeEditorDiffDemoContent } from '@/docs/examples/code-editor/content'
import { CodeEditorDemoFrame } from '@/docs/examples/code-editor/frame'
import {
  CodeEditorDiff,
  CodeEditorDiffToolbar,
} from '@/registry/blocove/ui/code-editor/diff'
import { CodeEditorLineNumbers } from '@/registry/blocove/ui/code-editor/line-numbers'
import { CodeEditorShiki } from '@/registry/blocove/ui/code-editor/shiki'

// Module scope keeps the two documents stable, so applying a chunk does not
// rebuild the editor.
const { original, modified } = codeEditorDiffDemoContent

export default function CodeEditorDiffDemo() {
  return (
    <CodeEditorDemoFrame
      content={modified}
      readOnly
      toolbarActions={<CodeEditorDiffToolbar />}
      extensions={(
        <>
          <CodeEditorDiff original={original} />
          <CodeEditorShiki />
          <CodeEditorLineNumbers />
        </>
      )}
    />
  )
}
