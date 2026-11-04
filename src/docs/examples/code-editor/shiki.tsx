import { CodeEditorDemoFrame } from '@/docs/examples/code-editor/frame'
import { CodeEditorShiki } from '@/registry/blocove/ui/code-editor/shiki'

export default function CodeEditorShikiDemo() {
  return (
    <CodeEditorDemoFrame
      extensions={<CodeEditorShiki />}
      statusBar={false}
    />
  )
}
