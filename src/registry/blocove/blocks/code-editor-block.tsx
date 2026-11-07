import { cn } from 'cn'
import { useState } from 'react'
import {
  CodeEditor,
  CodeEditorContent,
  CodeEditorStatusBar,
  CodeEditorToolbar,
} from '@/components/blocove/code-editor/editor'
import { CodeEditorLanguages } from '@/components/blocove/code-editor/languages'
import { CodeEditorLineNumbers } from '@/components/blocove/code-editor/line-numbers'
import { CodeEditorShiki } from '@/components/blocove/code-editor/shiki'

/**
 * A complete code editor: the shiki highlighting, the language item, the line
 * numbers, the toolbar and the status bar, driven by a controlled document.
 */
const defaultDocument = [
  'type CodeSample = {',
  '  language: string',
  '  source: string',
  '}',
  '',
  'const samples: CodeSample[] = [',
  '  { language: \'tsx\', source: \'const answer = 42\' },',
  '  { language: \'json\', source: \'{"answer": 42}\' },',
  ']',
  '',
  '/** Pick the sample whose language matches, falling back to the first. */',
  'export function pickSample(language: string) {',
  '  return samples.find(sample => sample.language === language) ?? samples[0]',
  '}',
  '',
  'console.log(pickSample(\'tsx\')?.source)',
].join('\n')

export interface CodeEditorBlockProps {
  /** Initial document. Replace it with the code your app edits. */
  defaultValue?: string
  /** Language shared by the highlighting, the language item and the status bar. */
  language?: string
  /** Read-only mode: the document can be selected and copied, but not edited. */
  readOnly?: boolean
  /** Called with the new document whenever it changes. */
  onChange?: (value: string) => void
  className?: string
}

/**
 * A ready-to-use code editor with the full Blocove extension set.
 */
export function CodeEditorBlock({
  defaultValue = defaultDocument,
  language = 'tsx',
  readOnly = false,
  onChange,
  className,
}: CodeEditorBlockProps) {
  const [value, setValue] = useState(defaultValue)

  return (
    <CodeEditor
      value={value}
      onChange={(next) => {
        setValue(next)
        onChange?.(next)
      }}
      language={language}
      readOnly={readOnly}
      className={cn('h-80 w-full max-w-3xl', className)}
    >
      <CodeEditorShiki />
      <CodeEditorLanguages />
      <CodeEditorLineNumbers />
      <CodeEditorToolbar />
      <CodeEditorContent />
      <CodeEditorStatusBar />
    </CodeEditor>
  )
}
