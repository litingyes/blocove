import type { DocsPage } from '@/docs/types'
import { getRegistrySource } from '@/lib/registry-source'
import { RichTextEditorPlayground } from '@/registry/blocove/blocks/rich-text-editor-playground'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-playground',
  requiresTypeset: true,
  examples: [
    {
      title: 'Rich Text Editor Playground',
      component: RichTextEditorPlayground,
      // The block is a single file, so the code panel shows exactly what the
      // CLI installs instead of a generated snippet.
      code: getRegistrySource('blocks/rich-text-editor-playground.tsx') ?? '',
      previewClassName: 'bg-muted/20',
    },
  ],
  usage: [
    {
      title: 'Use the block',
      code: `import { RichTextEditorPlayground } from "@/components/rich-text-editor-playground"

export function DocumentEditor() {
  return (
    <RichTextEditorPlayground
      defaultValue="<p>Start writing…</p>"
      onChange={html => console.log(html)}
    />
  )
}`,
    },
  ],
  api: [
    {
      name: 'RichTextEditorPlayground',
      description:
        'The editor with every Blocove node, mark and control already composed.',
      rows: [
        {
          prop: 'defaultValue',
          type: 'string',
          default: 'Built-in demo document',
        },
        { prop: 'placeholder', type: 'string', default: '"Start writing…"' },
        { prop: 'characterLimit', type: 'number', default: '-' },
        { prop: 'onChange', type: '(html: string) => void', default: '-' },
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  note: 'The block installs a single file and depends on the editor shell and every node and mark item, so the CLI brings a working editor. Replace `defaultValue` with the content your app edits.',
}
