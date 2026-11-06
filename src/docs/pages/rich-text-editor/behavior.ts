import type { DocsPage } from '@/docs/types'
import EditorBehaviorDemo from '@/docs/examples/rich-text-editor/behavior'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-behavior',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorBehaviorDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorFocus',
          'EditorGapcursor',
          'EditorTrailingNode',
        ],
        content: '<p>Place the caret between two blocks, then click outside the editor.</p>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorFocus',
      description:
        'Registers the focus extension. The focused node receives a class, so the focus ring can be styled from the document stylesheet.',
      rows: [
        { prop: 'className', type: 'string', default: '\'has-focus\'' },
        { prop: 'mode', type: '\'all\' | \'deepest\' | \'shallowest\'', default: '\'all\'' },
      ],
    },
    {
      name: 'EditorGapcursor',
      description:
        'Registers the gap cursor extension. The caret can sit between two blocks, where a regular text cursor cannot go.',
      rows: [],
    },
    {
      name: 'EditorTrailingNode',
      description:
        'Registers the trailing node extension. An empty block is kept at the end of the document, so there is always somewhere to keep writing.',
      rows: [],
    },
  ],
}
