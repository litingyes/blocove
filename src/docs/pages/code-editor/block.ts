import type { DocsPage } from '@/docs/types'
import { getRegistrySource } from '@/lib/registry-source'
import { CodeEditorBlock } from '@/registry/blocove/blocks/code-editor-block'

export const docsPage: DocsPage = {
  item: 'code-editor-block',
  examples: [
    {
      title: 'Code Editor',
      component: CodeEditorBlock,
      // The block is a single file, so the code panel shows exactly what the
      // CLI installs instead of a generated snippet.
      code: getRegistrySource('blocks/code-editor-block.tsx') ?? '',
    },
  ],
  usage: [
    {
      title: 'Use the block',
      code: `import { CodeEditorBlock } from "@/components/blocove/code-editor-block"

export function ReviewPanel() {
  return (
    <CodeEditorBlock
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
      name: 'CodeEditorBlock',
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
