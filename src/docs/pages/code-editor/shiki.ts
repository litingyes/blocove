import type { DocsPage } from '@/docs/types'
import { codeEditorDemoContent } from '@/docs/examples/code-editor/content'
import CodeEditorShikiDemo from '@/docs/examples/code-editor/shiki'
import { codeEditorUsage } from '@/docs/snippets/code-editor'

export const docsPage: DocsPage = {
  item: 'code-editor-shiki',
  demoDeps: ['code-editor'],
  note: 'Highlighting follows the class based theme of the page: github-light by default, github-dark when the dark class is present on the document, like the rest of shadcn/ui. The document is tokenized in the background, once the view is idle.',
  examples: [
    {
      title: 'Default',
      component: CodeEditorShikiDemo,
      code: codeEditorUsage({
        extensions: ['CodeEditorShiki'],
        language: 'tsx',
        content: codeEditorDemoContent.typescript,
        statusBar: false,
      }),
    },
  ],
  api: [
    {
      name: 'CodeEditorShiki',
      description:
        'Declares the shiki highlighting extension. The item ships its own highlighter, so the editor colors match the documentation code panels.',
      rows: [
        {
          prop: 'language',
          type: 'string',
          default: 'root language',
        },
        {
          prop: 'colorScheme',
          type: '\'auto\' | \'light\' | \'dark\'',
          default: '\'auto\'',
        },
        { prop: 'delay', type: 'number', default: '120' },
        { prop: 'maxLength', type: 'number', default: '150000' },
      ],
    },
  ],
}
