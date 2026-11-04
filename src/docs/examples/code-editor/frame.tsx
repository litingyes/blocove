import type { ReactNode } from 'react'
import { cn } from 'cn'
import { useState } from 'react'
import {
  CodeEditor,
  CodeEditorContent,
  CodeEditorStatusBar,
  CodeEditorToolbar,
} from '@/registry/blocove/ui/code-editor/editor'
import { codeEditorDemoContent } from './content'

export interface CodeEditorDemoFrameProps {
  /** Language shared by the extension declarations and the status bar. */
  language?: string
  /** Initial document. */
  content?: string
  /** Extension declarations, in registration order. */
  extensions?: ReactNode
  /** Render the toolbar. */
  toolbar?: boolean
  /** Controls rendered inside the toolbar, next to the built-in ones. */
  toolbarActions?: ReactNode
  /** Render the status bar. */
  statusBar?: boolean
  /** Render the document read-only. */
  readOnly?: boolean
  className?: string
}

/**
 * Shared preview shell for the code editor demos: the controlled state and the
 * standard layout. Item demos only add their own extension declarations.
 */
export function CodeEditorDemoFrame({
  language = 'tsx',
  content = codeEditorDemoContent.typescript,
  extensions,
  toolbar = true,
  toolbarActions,
  statusBar = true,
  readOnly = false,
  className,
}: CodeEditorDemoFrameProps) {
  const [value, setValue] = useState(content)

  return (
    <CodeEditor
      value={value}
      onChange={setValue}
      language={language}
      readOnly={readOnly}
      className={cn('h-72 w-full max-w-2xl', className)}
    >
      {extensions}
      {toolbar
        ? <CodeEditorToolbar>{toolbarActions}</CodeEditorToolbar>
        : null}
      <CodeEditorContent />
      {statusBar
        ? <CodeEditorStatusBar />
        : null}
    </CodeEditor>
  )
}
