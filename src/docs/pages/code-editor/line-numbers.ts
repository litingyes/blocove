import type { DocsPage } from '@/docs/types'
import { codeEditorDemoContent } from '@/docs/examples/code-editor/content'
import CodeEditorLineNumbersDemo from '@/docs/examples/code-editor/line-numbers'
import { codeEditorUsage } from '@/docs/snippets/code-editor'

export const docsPage: DocsPage = {
  item: 'code-editor-line-numbers',
  demoDeps: ['code-editor'],
  examples: [
    {
      title: 'Default',
      component: CodeEditorLineNumbersDemo,
      code: codeEditorUsage({
        extensions: ['CodeEditorShiki', 'CodeEditorLineNumbers'],
        language: 'tsx',
        content: codeEditorDemoContent.typescript,
      }),
    },
  ],
  api: [
    {
      name: 'CodeEditorLineNumbers',
      description:
        'Declares the editor chrome: line numbers, the fold gutter and the active line highlight.',
      rows: [
        { prop: 'foldable', type: 'boolean', default: 'true' },
        { prop: 'activeLine', type: 'boolean', default: 'true' },
        { prop: 'indentSize', type: 'number', default: '2' },
      ],
    },
  ],
}
