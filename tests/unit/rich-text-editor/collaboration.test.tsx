import type { Editor as TiptapEditor } from '@tiptap/react'
import { act, render, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import * as Y from 'yjs'
import { EditorCollaboration } from '@/components/blocove/rich-text-editor/collaboration'
import {
  Editor,
  EditorContent,
} from '@/components/blocove/rich-text-editor/editor'
import { EditorParagraph } from '@/components/blocove/rich-text-editor/paragraph'
import { EditorText } from '@/components/blocove/rich-text-editor/text'
import { renderRichTextEditor } from '../../helpers/render-rich-text-editor'

function collaborationOptions(editor: TiptapEditor) {
  return editor.extensionManager.extensions.find(
    extension => extension.name === 'collaboration',
  )?.options
}

function SharedEditors({
  document,
  onReady,
}: {
  document: Y.Doc
  onReady: (editor: TiptapEditor) => void
}) {
  return (
    <>
      <Editor onReady={onReady}>
        <EditorText />
        <EditorParagraph />
        <EditorCollaboration document={document} />
        <EditorContent />
      </Editor>
      <Editor onReady={onReady}>
        <EditorText />
        <EditorParagraph />
        <EditorCollaboration document={document} />
        <EditorContent />
      </Editor>
    </>
  )
}

async function renderTwoEditors(document: Y.Doc) {
  const editors: TiptapEditor[] = []

  render(
    <SharedEditors
      document={document}
      onReady={(editor) => {
        editors.push(editor)
      }}
    />,
  )

  await waitFor(() => {
    expect(editors).toHaveLength(2)
  })

  return editors
}

describe('editorCollaboration', () => {
  it('registers the collaboration extension', async () => {
    const document = new Y.Doc()
    const { editor } = await renderRichTextEditor({
      content: '<p>ignored</p>',
      extensions: <EditorCollaboration document={document} />,
    })

    expect(
      editor.extensionManager.extensions.some(
        extension => extension.name === 'collaboration',
      ),
    ).toBe(true)
  })

  it('passes the document and the field to the extension', async () => {
    const document = new Y.Doc()
    const { editor } = await renderRichTextEditor({
      extensions: <EditorCollaboration document={document} field="body" />,
    })
    const options = collaborationOptions(editor) as {
      document?: Y.Doc
      field?: string
    }

    expect(options.document).toBe(document)
    expect(options.field).toBe('body')
  })

  it('defaults the field to "default"', async () => {
    const document = new Y.Doc()
    const { editor } = await renderRichTextEditor({
      extensions: <EditorCollaboration document={document} />,
    })

    expect(collaborationOptions(editor)).toMatchObject({ field: 'default' })
  })

  it('requires the shared document', () => {
    expect(() =>
      EditorCollaboration.extension({} as { document: Y.Doc }),
    ).toThrow(/requires the Yjs document/)
  })
})

describe('editor with collaboration', () => {
  it('does not seed the document from value or defaultValue', async () => {
    const document = new Y.Doc()
    const { editor, container } = await renderRichTextEditor({
      content: '<p>Prop content</p>',
      extensions: <EditorCollaboration document={document} />,
    })

    expect(editor.getHTML()).not.toContain('Prop content')
    expect(container.querySelector('.ProseMirror')?.textContent).toBe('')
  })

  it('ignores controlled value updates', async () => {
    const sharedDocument = new Y.Doc()
    const frame = (value: string) => (
      <Editor value={value}>
        <EditorText />
        <EditorParagraph />
        <EditorCollaboration document={sharedDocument} />
        <EditorContent />
      </Editor>
    )
    const { container, rerender } = render(frame('<p>One</p>'))

    await waitFor(() => {
      expect(container.querySelector('.ProseMirror')).not.toBeNull()
    })

    rerender(frame('<p>Two</p>'))

    await waitFor(() => {
      const html = container.querySelector('.ProseMirror')?.innerHTML ?? ''

      expect(html).not.toContain('One')
      expect(html).not.toContain('Two')
    })
  })

  it('syncs two editors bound to the same document', async () => {
    const document = new Y.Doc()
    const editors = await renderTwoEditors(document)

    act(() => {
      editors[0].commands.insertContent('shared text')
    })

    await waitFor(() => {
      expect(editors[1].getHTML()).toContain('shared text')
    })
  })
})
