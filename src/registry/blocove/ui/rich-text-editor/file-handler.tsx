import type { Editor } from '@tiptap/react'
import type { ExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import { FileHandler } from '@tiptap/extension-file-handler'
import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'

const defaultAllowedMimeTypes = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
]

/**
 * Reads a file into a data URL so the document stays self-contained. Consumers
 * that upload the file first can replace this through the `onFile` prop.
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.addEventListener('load', () => resolve(String(reader.result)))
    reader.addEventListener('error', () => reject(reader.error))
    reader.readAsDataURL(file)
  })
}

async function insertFiles(
  editor: Editor,
  files: File[],
  position: number | null,
  onFile?: (file: File) => Promise<string> | string,
) {
  const uploaded = await Promise.all(
    files.map(async (file) => {
      const src = onFile
        ? await onFile(file)
        : await readFileAsDataUrl(file)
      return { src, alt: file.name }
    }),
  )

  const content = uploaded.map(({ src, alt }) => ({
    type: 'image',
    attrs: { src, alt },
  }))

  if (content.length === 0) {
    return
  }

  const at = position ?? editor.state.selection.from

  editor.chain().focus().insertContentAt(at, content).run()
}

export interface EditorFileHandlerProps {
  /** Mime types the handler reacts to. */
  allowedMimeTypes?: string[]
  /**
   * Turns a file into the URL inserted into the document. The default reads the
   * file as a data URL, which keeps the document self-contained.
   */
  onFile?: (file: File) => Promise<string> | string
}

/**
 * Registers the file handler for pasted and dropped files. Files are inserted
 * as image nodes, so the editor also needs the image node installed.
 */
export const EditorFileHandler: ExtensionComponent<EditorFileHandlerProps> = defineExtensionComponent(
  'file-handler',
  ({ allowedMimeTypes = defaultAllowedMimeTypes, onFile }: EditorFileHandlerProps) => [
    FileHandler.configure({
      allowedMimeTypes,
      // Take over the paste event so the pasted HTML does not also land in the
      // document next to the image.
      consumePasteEvent: true,
      onPaste: (currentEditor, files) => {
        void insertFiles(currentEditor, files, null, onFile)
      },
      onDrop: (currentEditor, files, position) => {
        void insertFiles(currentEditor, files, position, onFile)
      },
    }),
  ],
)
