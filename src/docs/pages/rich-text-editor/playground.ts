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
      code: `import { RichTextEditorPlayground } from "@/components/blocove/rich-text-editor-playground"

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
  demoDeps: [
    'rich-text-editor-heading',
    'rich-text-editor-code-block',
    'rich-text-editor-details',
    'rich-text-editor-image',
    'rich-text-editor-table',
    'rich-text-editor-blockquote',
    'rich-text-editor-list',
    'rich-text-editor-emoji',
    'rich-text-editor-mathematics',
    'rich-text-editor-mention',
    'rich-text-editor-bold',
    'rich-text-editor-italic',
    'rich-text-editor-underline',
    'rich-text-editor-strike',
    'rich-text-editor-code',
    'rich-text-editor-link',
    'rich-text-editor-highlight',
    'rich-text-editor-ruby',
    'rich-text-editor-subscript',
    'rich-text-editor-superscript',
    'rich-text-editor-text-style',
    'rich-text-editor-behavior',
    'rich-text-editor-typography',
    'rich-text-editor-invisible-characters',
    'rich-text-editor-find-and-replace',
    'rich-text-editor-file-handler',
    'rich-text-editor-drag-handle',
  ],
  api: [
    {
      name: 'RichTextEditorPlayground',
      description:
        'The editor with every Blocove node, mark and control already composed, grouped by kind in the toolbar.',
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
  note: 'The block installs a single file and depends on the editor shell, every node, every mark and the extension items it composes, so the CLI brings a working editor. Replace `defaultValue` with the content your app edits. The unique id item is not part of the composition: it writes an attribute to every block on load, which a controlled editor would echo back before the first edit.',
}
