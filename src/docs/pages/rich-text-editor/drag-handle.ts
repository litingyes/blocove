import type { DocsPage } from '@/docs/types'
import EditorDragHandleDemo from '@/docs/examples/rich-text-editor/drag-handle'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-drag-handle',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorDragHandleDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorDragHandle',
        ],
        content: '<p>Drag any block by its handle.</p>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorDragHandle',
      description: 'Floating handle that reorders the block under the pointer. Render it inside the editor; it follows the pointer and hides when the document is read-only.',
      rows: [
        { prop: 'className', type: 'string', default: '-' },
      ],
    },
  ],
  note: 'The drag handle is a control, not an extension: it mounts its own plugin when it renders. Nested blocks such as list items and quoted paragraphs can be dragged on their own. If your project disables automatic peer dependency installation, install `@tiptap/extension-drag-handle` next to the React package.',
}
