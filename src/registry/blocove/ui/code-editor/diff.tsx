import type { Extension, StateCommand } from '@codemirror/state'
import {
  getChunks,
  goToNextChunk,
  goToPreviousChunk,
  unifiedMergeView,
} from '@codemirror/merge'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import {
  CodeEditorToolbarButton,
  useCodeEditor,
  useCodeEditorState,
} from '@/components/ui/code-editor/editor'
import { defineCodeEditorExtension } from '@/lib/code-editor-extension'

export interface CodeEditorDiffProps {
  /** Document the editor content is compared against. */
  original: string
  /** Mark the inserted and deleted text inside changed chunks. */
  highlightChanges?: boolean
  /** Show a gutter marker next to changed lines. */
  gutter?: boolean
  /** Show the built-in accept and reject controls for every chunk. */
  mergeControls?: boolean
  /**
   * Collapse long stretches of unchanged text. Pass `false` to keep every line
   * visible, or an object with the `margin` and `minSize` of the collapse.
   */
  collapseUnchanged?: false | { margin?: number, minSize?: number }
  /** Show inline diffs for chunks that only change a few words. */
  allowInlineDiffs?: boolean
}

/**
 * Inline diff view. The editor content is compared against `original`, changed
 * chunks are highlighted with their deleted lines above the new ones, and the
 * built-in controls apply or revert a chunk.
 */
export const CodeEditorDiff = defineCodeEditorExtension<CodeEditorDiffProps>(
  'diff',
  (props: CodeEditorDiffProps): Extension[] => [
    unifiedMergeView({
      original: props.original,
      highlightChanges: props.highlightChanges ?? true,
      gutter: props.gutter ?? true,
      mergeControls: props.mergeControls ?? true,
      allowInlineDiffs: props.allowInlineDiffs ?? false,
      collapseUnchanged: props.collapseUnchanged === false
        ? undefined
        : props.collapseUnchanged ?? { margin: 2, minSize: 4 },
    }),
  ],
)

export interface CodeEditorDiffToolbarProps {
  /** Hide the changed chunk counter. */
  hideCount?: boolean
}

/**
 * Toolbar controls for the diff view: jump between changed chunks and show how
 * many are left. Render it inside the editor toolbar.
 */
export function CodeEditorDiffToolbar({
  hideCount = false,
}: CodeEditorDiffToolbarProps) {
  const { view } = useCodeEditor()

  useCodeEditorState()

  const chunks = view
    ? getChunks(view.state)?.chunks ?? []
    : []
  const navigate = (command: StateCommand) => {
    if (!view) {
      return
    }

    command({
      state: view.state,
      dispatch: transaction => view.dispatch(transaction),
    })
  }

  return (
    <>
      <CodeEditorToolbarButton
        label="Previous change"
        disabled={chunks.length === 0}
        onClick={() => navigate(goToPreviousChunk)}
      >
        <ChevronUpIcon />
      </CodeEditorToolbarButton>
      <CodeEditorToolbarButton
        label="Next change"
        disabled={chunks.length === 0}
        onClick={() => navigate(goToNextChunk)}
      >
        <ChevronDownIcon />
      </CodeEditorToolbarButton>
      {hideCount || chunks.length === 0
        ? null
        : (
            <span className="px-1 text-xs text-muted-foreground">
              {chunks.length}
              {' '}
              changed
            </span>
          )}
    </>
  )
}
