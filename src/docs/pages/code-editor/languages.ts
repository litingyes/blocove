import type { DocsPage } from '@/docs/types'
import { codeEditorDemoContent } from '@/docs/examples/code-editor/content'
import CodeEditorLanguagesDemo from '@/docs/examples/code-editor/languages'
import { codeEditorUsage } from '@/docs/snippets/code-editor'

export const docsPage: DocsPage = {
  item: 'code-editor-languages',
  demoDeps: ['code-editor'],
  note: 'Language support parses the document for indentation, bracket matching and folding. Colors are not part of it: pair it with code-editor-shiki for highlighting. Supported languages: css, html, javascript (js), json (jsonc), jsx, markdown (md), tsx, typescript (ts).',
  examples: [
    {
      title: 'Default',
      component: CodeEditorLanguagesDemo,
      code: codeEditorUsage({
        extensions: [
          'CodeEditorShiki',
          'CodeEditorLanguages',
          'CodeEditorLineNumbers',
        ],
        language: 'ts',
        content: codeEditorDemoContent.typescript,
      }),
    },
  ],
  api: [
    {
      name: 'CodeEditorLanguages',
      description:
        'Declares the language extension for the document. The grammar loads the first time the language is used.',
      rows: [
        {
          prop: 'language',
          type: 'string',
          default: 'root language',
        },
      ],
    },
  ],
}
