import { describe, expect, it } from 'vitest'
import {
  CodeEditorDiff,
  CodeEditorDiffToolbar,
} from '@/components/blocove/code-editor/diff'
import { renderCodeEditor } from '../../helpers/render-code-editor'

const original = 'const answer = 41\nconst name = \'blocove\'\n'
const modified = 'const answer = 42\nconst name = \'blocove\'\n'

describe('codeEditorDiff split mode', () => {
  it('renders the two documents in a merge view', async () => {
    const { container, view, doc, unmount } = await renderCodeEditor({
      content: modified,
      extensions: <CodeEditorDiff original={original} mode="split" />,
    })

    expect(container.querySelectorAll('.cm-editor')).toHaveLength(2)
    expect(container.querySelectorAll('.cm-mergeViewEditor')).toHaveLength(2)
    expect(container.querySelector('.cm-mergeView')).not.toBeNull()
    expect(container.querySelectorAll('.cm-merge-revert')).toHaveLength(1)

    // The primary view is the editable pane, so the controlled document and the
    // toolbar keep talking to the editor content rather than to `original`.
    expect(view.dom.closest('.cm-mergeView')).not.toBeNull()
    expect(doc()).toBe(modified)

    unmount()
  })

  it('hides the revert column when revertControls is false', async () => {
    const { container, unmount } = await renderCodeEditor({
      content: modified,
      extensions: (
        <CodeEditorDiff
          original={original}
          mode="split"
          revertControls={false}
        />
      ),
    })

    expect(container.querySelectorAll('.cm-mergeViewEditor')).toHaveLength(2)
    expect(container.querySelector('.cm-merge-revert')).toBeNull()

    unmount()
  })

  it('keeps the single editor in inline mode', async () => {
    const { container, unmount } = await renderCodeEditor({
      content: modified,
      extensions: <CodeEditorDiff original={original} />,
    })

    expect(container.querySelectorAll('.cm-editor')).toHaveLength(1)
    expect(container.querySelector('.cm-mergeView')).toBeNull()
    expect(container.querySelectorAll('.cm-deletedChunk').length).toBeGreaterThan(0)

    unmount()
  })

  it('keeps chunk navigation but drops the review actions', async () => {
    const { container, unmount } = await renderCodeEditor({
      content: modified,
      extensions: <CodeEditorDiff original={original} mode="split" />,
      toolbarActions: <CodeEditorDiffToolbar />,
    })

    expect(container.querySelector('[aria-label="Next change"]')).not.toBeNull()
    expect(container.querySelector('[aria-label="Previous change"]')).not.toBeNull()
    // Accepting rewrites the comparison document, which only the unified view
    // owns, so the split view leaves those actions out.
    expect(container.querySelector('[aria-label="Accept change"]')).toBeNull()
    expect(container.querySelector('[aria-label="Reject change"]')).toBeNull()

    unmount()
  })

  it('shows the review actions in inline mode', async () => {
    const { container, unmount } = await renderCodeEditor({
      content: modified,
      extensions: <CodeEditorDiff original={original} />,
      toolbarActions: <CodeEditorDiffToolbar />,
    })

    expect(container.querySelector('[aria-label="Accept change"]')).not.toBeNull()
    expect(container.querySelector('[aria-label="Reject change"]')).not.toBeNull()

    unmount()
  })
})
