import { codeEditorDiffDemoContent } from '@/docs/examples/code-editor/content'
import { CodeEditorDemoFrame } from '@/docs/examples/code-editor/frame'
import {
  CodeEditorDiff,
  CodeEditorDiffToolbar,
} from '@/registry/blocove/ui/code-editor/diff'
import { CodeEditorLanguages } from '@/registry/blocove/ui/code-editor/languages'
import { CodeEditorLineNumbers } from '@/registry/blocove/ui/code-editor/line-numbers'
import { CodeEditorShiki } from '@/registry/blocove/ui/code-editor/shiki'

// Module scope keeps the documents stable, so editing the demo updates the diff
// instead of rebuilding the merge view.
const { original, modified } = codeEditorDiffDemoContent

/**
 * The same pair of documents as the inline demo, rendered side by side with the
 * revert controls between the panes.
 */
export default function CodeEditorDiffSplitDemo() {
  return (
    <CodeEditorDemoFrame
      content={modified}
      className="h-80 w-full max-w-4xl"
      toolbarActions={<CodeEditorDiffToolbar />}
      extensions={(
        <>
          <CodeEditorDiff
            original={original}
            mode="split"
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
