import type { DocsPage } from '@/docs/types'
import { getRegistrySource } from '@/lib/registry-source'
import { CodeEditorPlayground } from '@/registry/blocove/blocks/code-editor-playground'

export const docsPage: DocsPage = {
  item: 'code-editor-playground',
  examples: [
    {
      title: 'Code Editor Playground',
      component: CodeEditorPlayground,
      // The block is a single file, so the code panel shows exactly what the
      // CLI installs instead of a generated snippet.
      code: getRegistrySource('blocks/code-editor-playground.tsx') ?? '',
    },
  ],
  usage: [
    {
      title: 'Use the block',
      code: `import { CodeEditorPlayground } from "@/components/blocove/code-editor-playground"

export function ReviewPanel() {
  return (
    <CodeEditorPlayground
      defaultValue="const answer = 42"
      language="typescript"
      onChange={value => console.log(value)}
    />
  )
}`,
    },
  ],
  api: [
    {
      name: 'CodeEditorPlayground',
      description:
        'The editor with the shiki highlighting, the language item, the line numbers, the toolbar and the status bar already composed.',
      rows: [
        {
          prop: 'defaultValue',
          type: 'string',
          default: 'Built-in demo document',
        },
        { prop: 'language', type: 'string', default: '"tsx"' },
        { prop: 'readOnly', type: 'boolean', default: 'false' },
        { prop: 'onChange', type: '(value: string) => void', default: '-' },
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  note: 'The block installs a single file and depends on the editor shell, the shiki highlighting, the language item and the line numbers, so the CLI brings a working editor. Replace `defaultValue` with the code your app edits.',
}
