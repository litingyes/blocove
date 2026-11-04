import { CodeEditorDemoFrame } from '@/docs/examples/code-editor/frame'
import { CodeEditorLanguages } from '@/registry/blocove/ui/code-editor/languages'
import { CodeEditorLineNumbers } from '@/registry/blocove/ui/code-editor/line-numbers'
import { CodeEditorShiki } from '@/registry/blocove/ui/code-editor/shiki'

export default function CodeEditorLanguagesDemo() {
  return (
    <CodeEditorDemoFrame
      language="ts"
      extensions={(
        <>
          <CodeEditorShiki />
          <CodeEditorLanguages />
          <CodeEditorLineNumbers />
        </>
      )}
    />
  )
}
