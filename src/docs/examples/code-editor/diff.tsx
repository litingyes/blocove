import { codeEditorDiffDemoContent } from '@/docs/examples/code-editor/content'
import { CodeEditorDemoFrame } from '@/docs/examples/code-editor/frame'
import {
  CodeEditorDiff,
  CodeEditorDiffToolbar,
} from '@/registry/blocove/ui/code-editor/diff'
import { CodeEditorLanguages } from '@/registry/blocove/ui/code-editor/languages'
import { CodeEditorLineNumbers } from '@/registry/blocove/ui/code-editor/line-numbers'
import { CodeEditorShiki } from '@/registry/blocove/ui/code-editor/shiki'

// Module scope keeps the documents stable, so editing the demo updates the
// diff instead of rebuilding the editor.
const { original, modified } = codeEditorDiffDemoContent

export default function CodeEditorDiffDemo() {
  return (
    <CodeEditorDemoFrame
      content={modified}
      toolbarActions={<CodeEditorDiffToolbar />}
      extensions={(
        <>
          <CodeEditorDiff
            original={original}
            collapseUnchanged={{ margin: 1, minSize: 3 }}
          />
          <CodeEditorShiki />
          <CodeEditorLanguages />
          <CodeEditorLineNumbers />
        </>
      )}
    />
  )
}
