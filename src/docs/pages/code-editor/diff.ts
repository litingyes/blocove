import type { DocsPage } from '@/docs/types'
import { codeEditorDiffDemoContent } from '@/docs/examples/code-editor/content'
import CodeEditorDiffDemo from '@/docs/examples/code-editor/diff'
import { codeEditorUsage } from '@/docs/snippets/code-editor'

export const docsPage: DocsPage = {
  item: 'code-editor-diff',
  demoDeps: [
    'code-editor',
    'code-editor-shiki',
    'code-editor-languages',
    'code-editor-line-numbers',
  ],
  note: 'The demo is editable: type in the buffer and the diff updates against the fixed original. Accept moves the comparison forward, Reject restores the buffer from it, and Accept all or Reject all settle the remaining chunks. Once nothing is left, Reset comparison brings the demo back. Keyboard: Mod Alt Down and Mod Alt Up move between changes, Mod Enter accepts and Shift Mod Enter rejects the chunk under the cursor.',
  examples: [
    {
      title: 'Default',
      component: CodeEditorDiffDemo,
      code: codeEditorUsage({
        extensions: [
          'CodeEditorDiff',
          'CodeEditorShiki',
          'CodeEditorLanguages',
          'CodeEditorLineNumbers',
        ],
        language: 'tsx',
        content: codeEditorDiffDemoContent.modified,
        original: codeEditorDiffDemoContent.original,
        diffProps: ['collapseUnchanged={{ margin: 1, minSize: 3 }}'],
        toolbarActions: ['CodeEditorDiffToolbar'],
      }),
    },
  ],
  api: [
    {
      name: 'CodeEditorDiff',
      description:
        'Declares the inline diff extension. The editor content is compared against `original`, changed lines are themed with the editor tokens, and every changed chunk gets accept and reject controls. Changing the prop recreates the editor view, so keep the document stable while chunks are applied.',
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
        { prop: 'syntaxHighlightDeletions', type: 'boolean', default: 'true' },
        { prop: 'shortcuts', type: 'boolean', default: 'true' },
        {
          prop: 'labels',
          type: '{ accept?: string, reject?: string }',
          default: '{ accept: \'Accept\', reject: \'Reject\' }',
        },
      ],
    },
    {
      name: 'CodeEditorDiffToolbar',
      description:
        'Toolbar controls for the diff view: previous and next change with their position and line counts, accept or reject for the chunk under the cursor, accept or reject for every remaining chunk, and a reset once the review settles. Render it inside the editor toolbar.',
      rows: [
        { prop: 'hideCount', type: 'boolean', default: 'false' },
        { prop: 'hideActions', type: 'boolean', default: 'false' },
      ],
    },
  ],
}
