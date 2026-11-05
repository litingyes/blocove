import type { Extension } from '@codemirror/state'
import { foldGutter, indentUnit } from '@codemirror/language'
import {
  highlightActiveLine,
  highlightActiveLineGutter,
  lineNumbers,
} from '@codemirror/view'
import { defineCodeEditorExtension } from '@/lib/blocove/code-editor-extension'

export interface CodeEditorLineNumbersProps {
  /** Render the fold gutter next to the line numbers. */
  foldable?: boolean
  /** Highlight the line the cursor is on. */
  activeLine?: boolean
  /** Indentation width in spaces. */
  indentSize?: number
}

/**
 * Line numbers, the fold gutter and the active line highlight. This is the
 * chrome of the editor, so it does not add any language or highlighting.
 */
export const CodeEditorLineNumbers = defineCodeEditorExtension<CodeEditorLineNumbersProps>(
  'line-numbers',
  (props: CodeEditorLineNumbersProps): Extension[] => {
    const foldable = props.foldable ?? true
    const activeLine = props.activeLine ?? true
    const indentSize = props.indentSize ?? 2

    return [
      lineNumbers(),
      activeLine
        ? [
            highlightActiveLineGutter(),
            highlightActiveLine(),
          ]
        : [],
      foldable
        ? foldGutter()
        : [],
      indentUnit.of(' '.repeat(indentSize)),
    ]
  },
)
