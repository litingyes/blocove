import type { Chunk } from '@codemirror/merge'
import type { Extension } from '@codemirror/state'
import type {
  CodeEditorSurfaceMountContext,
  CodeEditorSurfaceOptions,
} from '@/lib/blocove/code-editor-extension'
import {
  acceptChunk,
  getChunks,
  getOriginalDoc,
  MergeView,
  mergeViewSiblings,
  rejectChunk,
  unifiedMergeView,
  updateOriginalDoc,
} from '@codemirror/merge'
import { ChangeSet, Compartment, EditorState, Prec, Text } from '@codemirror/state'
import { EditorView, keymap, ViewPlugin } from '@codemirror/view'
import {
  CheckCheckIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  RefreshCwIcon,
  XCircleIcon,
  XIcon,
} from 'lucide-react'
import {
  CodeEditorToolbarButton,
  useCodeEditor,
  useCodeEditorState,
} from '@/components/blocove/code-editor/editor'
import { Separator } from '@/components/ui/separator'
import { defineCodeEditorExtension } from '@/lib/blocove/code-editor-extension'

export interface CodeEditorDiffLabels {
  /** Text of the per-chunk accept control. */
  accept?: string
  /** Text of the per-chunk reject control. */
  reject?: string
}

export interface CodeEditorDiffProps {
  /** Document the editor content is compared against. */
  original: string
  /**
   * How the two documents are laid out. `inline` compares them inside one view,
   * `split` renders them side by side.
   */
  mode?: 'inline' | 'split'
  /**
   * Split only: show a control between the panes that copies a chunk across.
   * `a-to-b` writes `original` back into the editor content, `b-to-a` writes the
   * editor content into `original`. Pass `false` to hide it.
   */
  revertControls?: 'a-to-b' | 'b-to-a' | false
  /** Split only: which document is rendered first. Defaults to `a-b`. */
  orientation?: 'a-b' | 'b-a'
  /** Mark the inserted and deleted text inside changed chunks. */
  highlightChanges?: boolean
  /** Show a gutter marker next to changed lines. */
  gutter?: boolean
  /** Inline only: show the accept and reject controls for every chunk. */
  mergeControls?: boolean
  /**
   * Collapse long stretches of unchanged text. Pass `false` to keep every line
   * visible, or an object with the `margin` and `minSize` of the collapse.
   */
  collapseUnchanged?: false | { margin?: number, minSize?: number }
  /** Inline only: show inline diffs for chunks that only change a few words. */
  allowInlineDiffs?: boolean
  /**
   * Inline only: syntax-highlight the deleted lines. Requires a language item
   * declared inside the editor, since the deleted text is tokenized with the
   * document language. Defaults to true.
   */
  syntaxHighlightDeletions?: boolean
  /**
   * Inline only: register the diff keyboard shortcuts — previous and next
   * change, accept and reject the chunk under the cursor. Defaults to true.
   */
  shortcuts?: boolean
  /** Inline only: labels of the per-chunk accept and reject controls. */
  labels?: CodeEditorDiffLabels
}

interface ResolvedDiffLabels {
  accept: string
  reject: string
}

interface DiffBaseline {
  doc: Text
  original: Text
}

interface DiffReview {
  chunks: readonly Chunk[]
  /** Index of the chunk that contains the cursor, `-1` when there is none. */
  index: number
  added: number
  removed: number
  /** Whether the comparison or the document moved away from the baseline. */
  dirty: boolean
}

// The palette lives on the editor root so consumers can retune the tints
// without touching the item. Alpha colors keep the same values readable on
// both page schemes, so no light/dark duplicate is needed.
const diffTheme = EditorView.theme({
  '&': {
    '--code-diff-add': 'oklch(0.63 0.17 155)',
    '--code-diff-remove': 'oklch(0.58 0.21 25)',
  },
  '&.cm-merge-b .cm-changedLine': {
    backgroundColor: 'color-mix(in oklab, var(--code-diff-add) 12%, transparent)',
  },
  '&.cm-merge-b .cm-changedText': {
    background: 'color-mix(in oklab, var(--code-diff-add) 26%, transparent)',
    borderRadius: '2px',
  },
  // Side by side, the original document is the comparison base, so its changed
  // lines carry the removal tint instead of the addition tint.
  '&.cm-merge-a .cm-changedLine': {
    backgroundColor: 'color-mix(in oklab, var(--code-diff-remove) 12%, transparent)',
  },
  '&.cm-merge-a .cm-changedText': {
    background: 'color-mix(in oklab, var(--code-diff-remove) 26%, transparent)',
    borderRadius: '2px',
  },
  '& .cm-deletedChunk': {
    position: 'relative',
    padding: '0.125rem 0.75rem',
    backgroundColor: 'color-mix(in oklab, var(--code-diff-remove) 10%, transparent)',
    borderBlock: '1px solid color-mix(in oklab, var(--code-diff-remove) 22%, transparent)',
  },
  '& .cm-deletedChunk .cm-deletedLine': {
    // Keep the floating controls clear of the deleted text.
    paddingInlineEnd: '7rem',
  },
  '& .cm-deletedChunk .cm-deletedText': {
    background: 'color-mix(in oklab, var(--code-diff-remove) 24%, transparent)',
    borderRadius: '2px',
  },
  '& .cm-deletedChunk .cm-chunkButtons': {
    position: 'absolute',
    top: '0.125rem',
    insetInlineEnd: '0.375rem',
    display: 'flex',
    gap: '0.25rem',
  },
  // Pure insertions have no deleted lines: give the controls their own row so
  // they never float over the inserted code.
  '& .cm-deletedChunk:not(:has(.cm-deletedLine))': {
    minHeight: '1.75rem',
    paddingBlock: '0.125rem',
    background: 'transparent',
    borderBlock: 'none',
  },
  '& .cm-deletedChunk:not(:has(.cm-deletedLine)) .cm-chunkButtons': {
    position: 'static',
    justifyContent: 'flex-end',
    paddingInlineEnd: '0.375rem',
  },
  '& .cm-deletedChunk .cm-diff-control': {
    margin: '0',
    padding: '0.0625rem 0.375rem',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm, 4px)',
    background: 'var(--background)',
    color: 'var(--foreground)',
    fontFamily: 'inherit',
    fontSize: '11px',
    lineHeight: '1.4',
    cursor: 'pointer',
    userSelect: 'none',
    boxShadow: '0 1px 2px rgb(0 0 0 / 0.06)',
  },
  '& .cm-deletedChunk .cm-diff-control:hover': {
    background: 'var(--accent)',
    color: 'var(--accent-foreground)',
  },
  '& .cm-deletedChunk .cm-diff-control:focus-visible': {
    outline: '2px solid var(--ring)',
    outlineOffset: '1px',
  },
  '& .cm-collapsedLines': {
    padding: '0.125rem 0.75rem',
    borderRadius: '4px',
    background: 'transparent',
    color: 'var(--muted-foreground)',
    fontSize: '11px',
    fontVariantNumeric: 'tabular-nums',
    cursor: 'pointer',
    userSelect: 'none',
  },
  '& .cm-collapsedLines:hover': {
    background: 'var(--muted)',
    color: 'var(--foreground)',
  },
  '& .cm-collapsedLines:before, & .cm-collapsedLines:after': {
    content: 'none',
  },
  '& .cm-changeGutter': {
    width: '3px',
    paddingLeft: '0',
  },
  '&.cm-merge-b .cm-changedLineGutter': {
    background: 'var(--code-diff-add)',
  },
  '& .cm-deletedLineGutter': {
    // Marks where the deletion widget sits. A neutral rail avoids claiming a
    // removal on pure insertions, where the widget carries no deleted text.
    background: 'color-mix(in oklab, var(--foreground) 24%, transparent)',
  },
})

// The document and the comparison base at the moment the view was created.
// "Reset comparison" restores both, so accepting every chunk is not a dead end.
const diffBaselines = new WeakMap<EditorView, DiffBaseline>()

function recordDiffBaseline(original: string) {
  const parsed = Text.of(original.split(/\r?\n/))

  return ViewPlugin.define((view) => {
    diffBaselines.set(view, { doc: view.state.doc, original: parsed })

    return {}
  })
}

function getDiffChunks(state: EditorState): readonly Chunk[] {
  return getChunks(state)?.chunks ?? []
}

/**
 * The document the chunks are compared against. A unified view keeps it in the
 * editor state; in a split view the original is the sibling editor, so the
 * chunk positions have to be resolved there.
 */
function comparisonDoc(view: EditorView): Text {
  const siblings = mergeViewSiblings(view)

  return siblings
    ? siblings.a.state.doc
    : getOriginalDoc(view.state)
}

function countLines(doc: Text, from: number, to: number) {
  if (from === to) {
    return 0
  }

  return doc.lineAt(to).number - doc.lineAt(from).number + 1
}

function isDiffDirty(view: EditorView) {
  const baseline = diffBaselines.get(view)

  if (!baseline) {
    return false
  }

  return !view.state.doc.eq(baseline.doc)
    || !getOriginalDoc(view.state).eq(baseline.original)
}

function diffStats(chunks: readonly Chunk[], doc: Text, original: Text) {
  let added = 0
  let removed = 0

  for (const chunk of chunks) {
    added += countLines(doc, chunk.fromB, chunk.endB)
    removed += countLines(original, chunk.fromA, chunk.endA)
  }

  return { added, removed }
}

function currentChunkIndex(chunks: readonly Chunk[], head: number) {
  return chunks.findIndex(chunk => head >= chunk.fromB && head <= chunk.endB)
}

function computeDiffReview(view: EditorView | null): DiffReview {
  if (!view) {
    return {
      chunks: [],
      index: -1,
      added: 0,
      removed: 0,
      dirty: false,
    }
  }

  const state = view.state
  const chunks = getDiffChunks(state)
  const dirty = isDiffDirty(view)

  if (chunks.length === 0) {
    return {
      chunks,
      index: -1,
      added: 0,
      removed: 0,
      dirty,
    }
  }

  const { added, removed } = diffStats(chunks, state.doc, comparisonDoc(view))

  return {
    chunks,
    index: currentChunkIndex(chunks, state.selection.main.head),
    added,
    removed,
    dirty,
  }
}

/**
 * Move the cursor to the next or previous changed chunk. Both directions wrap
 * around, so the buttons never become dead ends.
 */
function moveToDiffChunk(view: EditorView, direction: -1 | 1) {
  const chunks = getDiffChunks(view.state)

  if (chunks.length === 0) {
    return false
  }

  const head = view.state.selection.main.head
  const current = currentChunkIndex(chunks, head)
  let target = -1

  if (direction === 1) {
    target = current >= 0
      ? (current + 1) % chunks.length
      : chunks.findIndex(chunk => chunk.fromB > head)
  }
  else if (current >= 0) {
    target = (current - 1 + chunks.length) % chunks.length
  }
  else {
    for (let index = chunks.length - 1; index >= 0; index--) {
      const chunk = chunks[index]

      if (chunk && chunk.endB < head) {
        target = index
        break
      }
    }
  }

  if (target < 0) {
    target = direction === 1
      ? 0
      : chunks.length - 1
  }

  const chunk = chunks[target]

  if (!chunk) {
    return false
  }

  view.dispatch({
    selection: { anchor: chunk.fromB },
    scrollIntoView: true,
    userEvent: 'select',
  })

  return true
}

/**
 * Accept every remaining chunk at once by moving the comparison base to the
 * current document. The buffer itself is left untouched.
 */
function acceptAllDiffChunks(view: EditorView) {
  const chunks = getDiffChunks(view.state)

  if (chunks.length === 0) {
    return false
  }

  const original = getOriginalDoc(view.state)
  const changes = ChangeSet.of(
    {
      from: 0,
      to: original.length,
      insert: view.state.doc.toString(),
    },
    original.length,
  )

  view.dispatch({
    effects: updateOriginalDoc.of({
      doc: changes.apply(original),
      changes,
    }),
    userEvent: 'accept',
  })

  return true
}

/** Reject every remaining chunk by restoring the original document. */
function rejectAllDiffChunks(view: EditorView) {
  const chunks = getDiffChunks(view.state)

  if (chunks.length === 0) {
    return false
  }

  const original = getOriginalDoc(view.state).toString()

  if (view.state.doc.toString() === original) {
    return false
  }

  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: original },
    selection: { anchor: 0 },
    scrollIntoView: true,
    userEvent: 'revert',
  })

  return true
}

/** Restore both the document and its comparison base to the baseline. */
function resetDiff(view: EditorView) {
  const baseline = diffBaselines.get(view)

  if (!baseline) {
    return false
  }

  const original = getOriginalDoc(view.state)
  const changes = ChangeSet.of(
    {
      from: 0,
      to: original.length,
      insert: baseline.original.toString(),
    },
    original.length,
  )

  // Only rewrite the document when it drifted from the baseline, so resetting
  // after accepting every chunk keeps the collapsed unchanged ranges.
  const docChanged = !view.state.doc.eq(baseline.doc)

  view.dispatch({
    ...(docChanged
      ? {
          changes: {
            from: 0,
            to: view.state.doc.length,
            insert: baseline.doc.toString(),
          },
          selection: { anchor: 0 },
          scrollIntoView: true,
        }
      : {}),
    effects: updateOriginalDoc.of({
      doc: changes.apply(original),
      changes,
    }),
    userEvent: 'revert',
  })

  return true
}

const diffShortcuts = Prec.high(keymap.of([
  {
    key: 'Mod-Alt-ArrowDown',
    run: view => moveToDiffChunk(view, 1),
  },
  {
    key: 'Mod-Alt-ArrowUp',
    run: view => moveToDiffChunk(view, -1),
  },
  {
    key: 'Mod-Enter',
    run: view => acceptChunk(view),
  },
  {
    key: 'Shift-Mod-Enter',
    run: view => rejectChunk(view),
  },
]))

/**
 * Render the per-chunk controls as plain buttons so they style with the shadcn
 * tokens and respond to click, which makes them reachable with the keyboard.
 */
function renderMergeControls(labels: ResolvedDiffLabels) {
  return (type: 'accept' | 'reject', action: (event: MouseEvent) => void) => {
    // CodeMirror builds the chunk widget outside React, so the control has to
    // be created with DOM APIs when the widget is first rendered.
    // eslint-disable-next-line react/purity
    const button = document.createElement('button')
    const label = type === 'accept'
      ? labels.accept
      : labels.reject
    const description = type === 'accept'
      ? 'Accept this change'
      : 'Reject this change'

    button.type = 'button'
    button.className = 'cm-diff-control'
    button.dataset.action = type
    button.textContent = label
    button.title = description
    button.setAttribute('aria-label', description)
    button.addEventListener('click', event => action(event))

    return button
  }
}

/**
 * Inline diff view. The editor content is compared against `original`, changed
 * chunks are highlighted with their deleted lines above the new ones, and the
 * built-in controls apply or revert a chunk.
 */
function inlineDiff(props: CodeEditorDiffProps): Extension[] {
  const labels: ResolvedDiffLabels = {
    accept: props.labels?.accept ?? 'Accept',
    reject: props.labels?.reject ?? 'Reject',
  }

  return [
    unifiedMergeView({
      original: props.original,
      highlightChanges: props.highlightChanges ?? true,
      gutter: props.gutter ?? true,
      mergeControls: props.mergeControls === false
        ? false
        : renderMergeControls(labels),
      allowInlineDiffs: props.allowInlineDiffs ?? false,
      syntaxHighlightDeletions: props.syntaxHighlightDeletions ?? true,
      collapseUnchanged: props.collapseUnchanged === false
        ? undefined
        : props.collapseUnchanged ?? { margin: 2, minSize: 4 },
    }),
    diffTheme,
    recordDiffBaseline(props.original),
    ...(props.shortcuts === false
      ? []
      : [diffShortcuts]),
  ]
}

/**
 * Split diff view. Two editors are aligned chunk by chunk, the original on the
 * left and the editor content on the right. Only the right side reports the
 * document, so reverting a chunk never looks like an edit of the buffer.
 */
function splitDiff(props: CodeEditorDiffProps) {
  if (props.mode !== 'split') {
    return null
  }

  return ({
    host,
    doc,
    primaryExtensions,
    secondaryExtensions,
    options,
  }: CodeEditorSurfaceMountContext) => {
    const originalEditable = new Compartment()
    const contentEditable = new Compartment()
    const originalWrapping = new Compartment()
    const contentWrapping = new Compartment()
    const wrap = options.lineWrapping
      ? EditorView.lineWrapping
      : []

    const merge = new MergeView({
      a: {
        doc: props.original,
        extensions: [
          ...secondaryExtensions,
          originalEditable.of([
            EditorView.editable.of(false),
            EditorState.readOnly.of(true),
          ]),
          originalWrapping.of(wrap),
        ],
      },
      b: {
        doc,
        extensions: [
          ...primaryExtensions,
          contentEditable.of([
            EditorView.editable.of(options.editable && !options.readOnly),
            EditorState.readOnly.of(options.readOnly),
          ]),
          contentWrapping.of(wrap),
        ],
      },
      parent: host,
      orientation: props.orientation,
      revertControls: props.revertControls === false
        ? undefined
        : props.revertControls ?? 'a-to-b',
      highlightChanges: props.highlightChanges ?? true,
      gutter: props.gutter ?? true,
      collapseUnchanged: props.collapseUnchanged === false
        ? undefined
        : props.collapseUnchanged ?? { margin: 2, minSize: 4 },
    })

    // The merge view scrolls as one block, so it has to fill the surface. The
    // divider keeps the panes apart when no revert column is rendered.
    merge.dom.style.height = '100%'

    merge.dom.querySelectorAll<HTMLElement>('.cm-mergeViewEditor').forEach((pane, index) => {
      if (index > 0) {
        pane.style.borderLeft = '1px solid var(--border)'
      }
    })

    if (options.autoFocus) {
      merge.b.focus()
    }

    return {
      view: merge.b,
      update(next: CodeEditorSurfaceOptions) {
        const nextWrap = next.lineWrapping
          ? EditorView.lineWrapping
          : []

        merge.a.dispatch({
          effects: originalWrapping.reconfigure(nextWrap),
        })
        merge.b.dispatch({
          effects: [
            contentEditable.reconfigure([
              EditorView.editable.of(next.editable && !next.readOnly),
              EditorState.readOnly.of(next.readOnly),
            ]),
            contentWrapping.reconfigure(nextWrap),
          ],
        })
      },
      destroy() {
        merge.destroy()
      },
    }
  }
}

/**
 * Diff view for the code editor. The editor content is compared against
 * `original`, either inline in one view or side by side with `mode="split"`.
 */
export const CodeEditorDiff = defineCodeEditorExtension<CodeEditorDiffProps>(
  'diff',
  (props: CodeEditorDiffProps): Extension[] =>
    props.mode === 'split'
      ? [diffTheme]
      : inlineDiff(props),
  { surface: splitDiff },
)

export interface CodeEditorDiffToolbarProps {
  /** Hide the position and line counters. */
  hideCount?: boolean
  /** Hide the accept and reject controls. */
  hideActions?: boolean
}

interface DiffStatusProps {
  count: number
  index: number
  added: number
  removed: number
}

function describeChangeCount(count: number) {
  if (count === 1) {
    return '1 change'
  }

  return `${count} changes`
}

function describeDiffSummary(count: number, index: number) {
  if (count === 0) {
    return { label: 'No changes', announcement: 'No changes' }
  }

  if (index >= 0) {
    return {
      label: `${index + 1} of ${count}`,
      announcement: `Change ${index + 1} of ${count}`,
    }
  }

  const label = describeChangeCount(count)

  return { label, announcement: label }
}

function DiffStatus({ count, index, added, removed }: DiffStatusProps) {
  const { label, announcement } = describeDiffSummary(count, index)

  return (
    <span className="flex items-center gap-1.5 px-1 text-xs whitespace-nowrap text-muted-foreground">
      <span
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcement}
      </span>
      {count === 0
        ? (
            <CheckIcon
              aria-hidden="true"
              className="size-3.5 text-emerald-600 dark:text-emerald-400"
            />
          )
        : null}
      <span aria-hidden="true" className="tabular-nums">
        {label}
      </span>
      {count > 0
        ? (
            <span aria-hidden="true" className="flex items-center gap-1 tabular-nums">
              <span className="text-emerald-600 dark:text-emerald-400">
                +
                {added}
              </span>
              <span className="text-destructive">
                −
                {removed}
              </span>
            </span>
          )
        : null}
    </span>
  )
}

/**
 * Toolbar controls for the diff view: navigation between changed chunks with
 * their position and line counts, plus accept and reject actions for the chunk
 * under the cursor and for every remaining chunk. Render it inside the editor
 * toolbar.
 */
export function CodeEditorDiffToolbar({
  hideCount = false,
  hideActions = false,
}: CodeEditorDiffToolbarProps) {
  const { view } = useCodeEditor()

  useCodeEditorState()

  if (!view) {
    return null
  }

  // Accept and reject rewrite the comparison document, which only the unified
  // view owns; a split view reverts chunks between the panes instead.
  const actionsHidden = hideActions || mergeViewSiblings(view) !== null

  if (hideCount && actionsHidden) {
    return null
  }

  const { chunks, index, added, removed, dirty } = computeDiffReview(view)
  const count = chunks.length

  return (
    <div
      role="group"
      aria-label="Diff review"
      className="flex items-center gap-1"
    >
      <Separator
        orientation="vertical"
        className="mx-1 hidden h-5 self-center sm:block"
      />
      <CodeEditorToolbarButton
        label="Previous change"
        shortcut="Mod Alt ↑"
        disabled={count === 0}
        onClick={() => moveToDiffChunk(view, -1)}
      >
        <ChevronUpIcon />
      </CodeEditorToolbarButton>
      <CodeEditorToolbarButton
        label="Next change"
        shortcut="Mod Alt ↓"
        disabled={count === 0}
        onClick={() => moveToDiffChunk(view, 1)}
      >
        <ChevronDownIcon />
      </CodeEditorToolbarButton>
      {hideCount
        ? null
        : (
            <DiffStatus
              count={count}
              index={index}
              added={added}
              removed={removed}
            />
          )}
      {actionsHidden
        ? null
        : (
            <>
              <CodeEditorToolbarButton
                label="Accept change"
                shortcut="Mod Enter"
                disabled={index < 0}
                onClick={() => acceptChunk(view)}
              >
                <CheckIcon />
              </CodeEditorToolbarButton>
              <CodeEditorToolbarButton
                label="Reject change"
                shortcut="Shift Mod Enter"
                disabled={index < 0}
                onClick={() => rejectChunk(view)}
              >
                <XIcon />
              </CodeEditorToolbarButton>
              <CodeEditorToolbarButton
                label="Accept all changes"
                disabled={count === 0}
                onClick={() => acceptAllDiffChunks(view)}
              >
                <CheckCheckIcon />
              </CodeEditorToolbarButton>
              <CodeEditorToolbarButton
                label="Reject all changes"
                disabled={count === 0}
                onClick={() => rejectAllDiffChunks(view)}
              >
                <XCircleIcon />
              </CodeEditorToolbarButton>
              {count === 0 && dirty
                ? (
                    <CodeEditorToolbarButton
                      label="Reset comparison"
                      onClick={() => resetDiff(view)}
                    >
                      <RefreshCwIcon />
                    </CodeEditorToolbarButton>
                  )
                : null}
            </>
          )}
    </div>
  )
}
