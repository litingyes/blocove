import type { DocsPage } from '@/docs/types'
import EditorUniqueIdDemo from '@/docs/examples/rich-text-editor/unique-id'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-unique-id',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorUniqueIdDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorUniqueId',
        ],
        content: '<p>One</p><p>Two</p>',
      }),
    },
  ],
  note: 'The id is stored on the node `id` attribute and serialized as `data-id`, so it survives an HTML round trip without clashing with the DOM ids of the page.',
  api: [
    {
      name: 'EditorUniqueId',
      description:
        'Registers the unique id extension. Every block receives a stable `data-id` attribute the first time the document is parsed.',
      rows: [
        { prop: 'types', type: 'string[] | \'all\'', default: '\'all\'' },
        { prop: 'attributeName', type: 'string', default: '\'id\'' },
      ],
    },
  ],
}
