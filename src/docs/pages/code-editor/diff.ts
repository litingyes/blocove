import type { DocsPage } from '@/docs/types'
import { codeEditorDiffDemoContent } from '@/docs/examples/code-editor/content'
import CodeEditorDiffDemo from '@/docs/examples/code-editor/diff'
import { codeEditorUsage } from '@/docs/snippets/code-editor'

export const docsPage: DocsPage = {
  item: 'code-editor-diff',
  demoDeps: [
    'code-editor',
    'code-editor-shiki',
    'code-editor-line-numbers',
  ],
  note: 'The diff view is rendered read-only in the demo, but the built-in accept and reject controls keep working: they apply the chunk to the original document instead of editing the buffer. Pair the item with code-editor-shiki and code-editor-languages for colored diffs.',
  examples: [
    {
      title: 'Default',
      component: CodeEditorDiffDemo,
      code: codeEditorUsage({
        extensions: [
          'CodeEditorDiff',
          'CodeEditorShiki',
          'CodeEditorLineNumbers',
        ],
        language: 'tsx',
        content: codeEditorDiffDemoContent.modified,
        original: codeEditorDiffDemoContent.original,
        toolbarActions: ['CodeEditorDiffToolbar'],
        readOnly: true,
      }),
    },
  ],
  api: [
    {
      name: 'CodeEditorDiff',
      description:
        'Declares the inline diff extension. The editor content is compared against `original`; changing it recreates the editor view, so keep the document stable while chunks are applied.',
      rows: [
        { prop: 'original', type: 'string', default: '-' },
        { prop: 'highlightChanges', type: 'boolean', default: 'true' },
        { prop: 'gutter', type: 'boolean', default: 'true' },
        { prop: 'mergeControls', type: 'boolean', default: 'true' },
        {
          prop: 'collapseUnchanged',
          type: 'false | { margin?: number, minSize?: number }',
          default: '{ margin: 2, minSize: 4 }',
        },
        { prop: 'allowInlineDiffs', type: 'boolean', default: 'false' },
      ],
    },
    {
      name: 'CodeEditorDiffToolbar',
      description:
        'Toolbar controls for the diff view: jump between changed chunks and show how many are left. Render it inside the editor toolbar.',
      rows: [
        { prop: 'hideCount', type: 'boolean', default: 'false' },
      ],
    },
  ],
}
