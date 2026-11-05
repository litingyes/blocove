import { indentUnit } from '@codemirror/language'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CodeEditorDiff, CodeEditorDiffToolbar } from '@/components/blocove/code-editor/diff'
import { CodeEditorLanguages } from '@/components/blocove/code-editor/languages'
import { CodeEditorLineNumbers } from '@/components/blocove/code-editor/line-numbers'
import { CodeEditorShiki } from '@/components/blocove/code-editor/shiki'
import { codeSamples } from '../../helpers/fixtures'
import { renderCodeEditor } from '../../helpers/render-code-editor'

const { jsonLoader, markdownLoader } = vi.hoisted(() => ({
  jsonLoader: vi.fn(() => []),
  markdownLoader: vi.fn(() => []),
}))

vi.mock('@codemirror/lang-json', () => ({ json: jsonLoader }))
vi.mock('@codemirror/lang-markdown', () => ({ markdown: markdownLoader }))

beforeEach(() => {
  jsonLoader.mockClear()
  markdownLoader.mockClear()
})

describe('codeEditorLineNumbers', () => {
  it('renders the gutters and applies the default indentation', async () => {
    const { view, container } = await renderCodeEditor({
      content: 'const answer = 42',
      extensions: <CodeEditorLineNumbers />,
      toolbar: false,
    })

    expect(container.querySelector('.cm-lineNumbers')).not.toBeNull()
    expect(container.querySelector('.cm-foldGutter')).not.toBeNull()
    expect(container.querySelector('.cm-activeLine')).not.toBeNull()
    expect(view.state.facet(indentUnit)).toBe('  ')
  })

  it('respects the foldable, activeLine and indentSize options', async () => {
    const { view, container } = await renderCodeEditor({
      content: 'const answer = 42',
      extensions: (
        <CodeEditorLineNumbers foldable={false} activeLine={false} indentSize={4} />
      ),
      toolbar: false,
    })

    expect(container.querySelector('.cm-foldGutter')).toBeNull()
    expect(container.querySelector('.cm-activeLine')).toBeNull()
    expect(view.state.facet(indentUnit)).toBe('    ')
  })
})

describe('codeEditorLanguages', () => {
  it('loads the grammar for the language set on the editor root', async () => {
    await renderCodeEditor({
      content: '{"answer": 42}',
      language: 'json',
      extensions: <CodeEditorLanguages />,
      toolbar: false,
    })

    await waitFor(() => {
      expect(jsonLoader).toHaveBeenCalled()
    })
  })

  it('loads the grammar for the extension language prop', async () => {
    await renderCodeEditor({
      content: '# Title',
      language: 'tsx',
      extensions: <CodeEditorLanguages language="markdown" />,
      toolbar: false,
    })

    await waitFor(() => {
      expect(markdownLoader).toHaveBeenCalled()
    })
  })

  it('does not load anything for an unsupported language', async () => {
    await renderCodeEditor({
      content: 'SELECT 1',
      language: 'cobol',
      extensions: <CodeEditorLanguages />,
      toolbar: false,
    })

    await new Promise(resolve => setTimeout(resolve, 30))
    expect(jsonLoader).not.toHaveBeenCalled()
    expect(markdownLoader).not.toHaveBeenCalled()
  })
})

describe('codeEditorShiki', () => {
  it('decorates tokens once the highlighter resolves', async () => {
    const { container } = await renderCodeEditor({
      content: 'const answer = 42',
      language: 'typescript',
      extensions: <CodeEditorShiki delay={0} />,
      toolbar: false,
    })

    await waitFor(() => {
      expect(container.querySelector('.cm-line span[style*="color"]')).not.toBeNull()
    }, { timeout: 10000 })
  })

  it('leaves documents without a supported language unhighlighted', async () => {
    const { container } = await renderCodeEditor({
      content: 'some plain text',
      language: 'cobol',
      extensions: <CodeEditorShiki delay={0} />,
      toolbar: false,
    })

    await new Promise(resolve => setTimeout(resolve, 50))
    expect(container.querySelector('.cm-line span[style*="color"]')).toBeNull()
  })

  it('skips documents longer than maxLength', async () => {
    const { container } = await renderCodeEditor({
      content: 'const answer = 42',
      language: 'typescript',
      extensions: <CodeEditorShiki delay={0} maxLength={5} />,
      toolbar: false,
    })

    await new Promise(resolve => setTimeout(resolve, 50))
    expect(container.querySelector('.cm-line span[style*="color"]')).toBeNull()
  })

  it('warns about duplicate declarations', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    await renderCodeEditor({
      content: 'const answer = 42',
      language: 'typescript',
      extensions: (
        <>
          <CodeEditorShiki delay={0} />
          <CodeEditorShiki delay={0} />
        </>
      ),
      toolbar: false,
    })

    const duplicates = warn.mock.calls.filter(call =>
      String(call[0]).includes('Duplicate extension "shiki"'),
    )

    expect(duplicates.length).toBeGreaterThanOrEqual(1)
  })
})

describe('codeEditorDiff', () => {
  function renderDiff() {
    return renderCodeEditor({
      content: codeSamples.diffUpdated,
      extensions: <CodeEditorDiff original={codeSamples.diffOriginal} />,
      toolbarActions: <CodeEditorDiffToolbar />,
    })
  }

  it('renders the changed chunks and the review controls', async () => {
    const { container, doc } = await renderDiff()
    const review = screen.getByRole('group', { name: 'Diff review' })

    expect(doc()).toBe(codeSamples.diffUpdated)
    expect(container.querySelector('.cm-changedLine')).not.toBeNull()
    expect(review.textContent).toMatch(/1 of 1|1 change/)
  })

  it('accepts a change and reports that nothing is left', async () => {
    await renderDiff()

    fireEvent.click(screen.getByRole('button', { name: 'Accept change' }))

    await waitFor(() => {
      expect(screen.getByRole('group', { name: 'Diff review' }).textContent).toContain('No changes')
    })
  })

  it('rejects a change back to the original document', async () => {
    const { doc } = await renderDiff()

    fireEvent.click(screen.getByRole('button', { name: 'Reject change' }))

    await waitFor(() => {
      expect(doc()).toContain('41')
    })
    expect(screen.getByRole('group', { name: 'Diff review' }).textContent).toContain('No changes')
  })

  it('restores the comparison baseline', async () => {
    const { doc } = await renderDiff()

    fireEvent.click(screen.getByRole('button', { name: 'Accept change' }))
    await waitFor(() => {
      expect(screen.getByRole('group', { name: 'Diff review' }).textContent).toContain('No changes')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Reset comparison' }))

    await waitFor(() => {
      expect(doc()).toBe(codeSamples.diffUpdated)
    })
    expect(screen.getByRole('group', { name: 'Diff review' }).textContent).toMatch(/1 of 1|1 change/)
  })

  it('hides the review controls when both parts are disabled', async () => {
    await renderCodeEditor({
      content: codeSamples.diffUpdated,
      extensions: <CodeEditorDiff original={codeSamples.diffOriginal} />,
      toolbarActions: <CodeEditorDiffToolbar hideCount hideActions />,
      toolbar: false,
    })

    expect(screen.queryByRole('group', { name: 'Diff review' })).toBeNull()
  })
})
