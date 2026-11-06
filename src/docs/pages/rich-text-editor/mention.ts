import type { DocsPage } from '@/docs/types'
import EditorMentionDemo from '@/docs/examples/rich-text-editor/mention'
import { richTextEditorUsage } from '@/docs/snippets/rich-text-editor'

export const docsPage: DocsPage = {
  item: 'rich-text-editor-mention',
  requiresTypeset: true,
  examples: [
    {
      title: 'Default',
      component: EditorMentionDemo,
      code: richTextEditorUsage({
        extensions: [
          'EditorText',
          'EditorParagraph',
          'EditorHardBreak',
          'EditorMention',
        ],
        content: '<p>Hi <span data-type="mention" data-id="ada" data-label="Ada Lovelace"></span></p>',
      }),
    },
  ],
  api: [
    {
      name: 'EditorMention',
      description: 'Registers the mention node and the suggestion list built from the records you pass in.',
      rows: [
        { prop: 'users', type: 'MentionUser[]', default: 'Three demo users' },
        { prop: 'char', type: 'string', default: '"@"' },
        { prop: 'ariaLabel', type: 'string', default: '"Mention"' },
        { prop: 'HTMLAttributes', type: 'Record<string, string>', default: '{}' },
      ],
    },
  ],
  usage: [
    {
      title: 'Pass your own records',
      code: `import { EditorMention } from "@/components/blocove/rich-text-editor/mention"

const users = [
  { id: "42", label: "Ada Lovelace" },
  { id: "43", label: "Alan Turing" },
]

export function CommentEditor() {
  return (
    <Editor>
      <EditorMention users={users} />
      <EditorContent />
    </Editor>
  )
}`,
    },
  ],
  note: 'Mention records are your own data. The node stores the id and the label as `data-id` and `data-label`, so the rendered HTML survives a round trip through your backend.',
}
