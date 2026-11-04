import type { Extension } from '@codemirror/state'
import type { ComponentProps, ReactNode, RefObject } from 'react'
import type { CodeEditorExtensionConfig } from '@/lib/code-editor-extension'
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  redo,
  redoDepth,
  undo,
  undoDepth,
} from '@codemirror/commands'
import { Compartment, EditorState } from '@codemirror/state'
import {
  drawSelection,
  dropCursor,
  EditorView,
  keymap,
  placeholder as placeholderExtension,
} from '@codemirror/view'
import { cn } from 'cn'
import { CheckIcon, CopyIcon, Redo2Icon, Undo2Icon, WrapTextIcon } from 'lucide-react'
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  codeEditorExtensionSignature,
  collectCodeEditorChildren,
  resolveCodeEditorExtensions,
} from '@/lib/code-editor-extension'

export interface CodeEditorProps {
  /** Controlled document. */
  value?: string
  /** Initial document when uncontrolled. */
  defaultValue?: string
  /** Called with the new document whenever it changes. */
  onChange?: (value: string) => void
  /** Language shared by the highlighting and language items. */
  language?: string
  /** Placeholder shown while the document is empty. */
  placeholder?: string
  /** Whether the document can be edited. */
  editable?: boolean
  /**
   * Read-only mode: the document can be selected and copied, but not edited.
   * Chunk controls from the diff item keep working, since they are widgets.
   */
  readOnly?: boolean
  /** Focus the editor once it is ready. */
  autoFocus?: boolean
  /** Initial line wrapping state. */
  lineWrapping?: boolean
  /** Called when the line wrapping toggle changes. */
  onLineWrappingChange?: (lineWrapping: boolean) => void
  /** Additional CodeMirror extensions, appended after the declared ones. */
  extensions?: Extension
  /** Called once the editor view is created. */
  onReady?: (view: EditorView) => void
  className?: string
  /** Editor UI and extension declarations. */
  children?: ReactNode
}

interface CodeEditorComponentConfig {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onReady?: (view: EditorView) => void
  autoFocus: boolean
  placeholder: string
  language?: string
  /** Extension declarations collected from the children. */
  declared: CodeEditorExtensionConfig[]
  /** Extra extensions passed through the `extensions` prop. */
  extra?: Extension
}

interface CodeEditorContextValue {
  view: EditorView | null
  setView: (view: EditorView | null) => void
  subscribe: (listener: () => void) => () => void
  notify: () => void
  configRef: RefObject<CodeEditorComponentConfig>
  signature: string
  value?: string
  editable: boolean
  readOnly: boolean
  lineWrapping: boolean
  setLineWrapping: (lineWrapping: boolean) => void
}

const CodeEditorContext = createContext<CodeEditorContextValue | null>(null)

export function useCodeEditor() {
  const context = use(CodeEditorContext)

  if (!context) {
    throw new Error('useCodeEditor must be used inside <CodeEditor>.')
  }

  return context
}

/**
 * Re-renders the calling component whenever the editor state changes, so
 * chrome components can read the cursor position and the history depth.
 */
export function useCodeEditorState() {
  const { subscribe } = useCodeEditor()
  const [, forceUpdate] = useReducer((version: number) => version + 1, 0)

  useEffect(() => subscribe(forceUpdate), [subscribe])
}

const baseTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: '13px',
    backgroundColor: 'transparent',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-scroller': {
    fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
    lineHeight: '1.7',
  },
  '.cm-content': {
    padding: '0.75rem 0',
    caretColor: 'currentColor',
  },
  '.cm-line': {
    padding: '0 0.75rem',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    color: 'var(--muted-foreground)',
    border: 'none',
  },
  '.cm-activeLine': {
    backgroundColor: 'color-mix(in oklab, currentColor 5%, transparent)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color: 'var(--foreground)',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'currentColor',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'color-mix(in oklab, var(--ring) 35%, transparent)',
  },
  '.cm-placeholder': {
    color: 'var(--muted-foreground)',
  },
  '.cm-panels': {
    backgroundColor: 'var(--background)',
    color: 'var(--foreground)',
  },
})

/**
 * Code editor root. Registers the extensions declared by its children, owns the
 * controlled document and renders the editor UI.
 */
export function CodeEditor({
  value,
  defaultValue,
  onChange,
  language,
  placeholder = 'Type some code…',
  editable = true,
  readOnly = false,
  autoFocus = false,
  lineWrapping,
  onLineWrappingChange,
  extensions,
  onReady,
  className,
  children,
}: CodeEditorProps) {
  const { extensions: declared, content } = collectCodeEditorChildren(children)
  const signature = codeEditorExtensionSignature(declared)
  const [view, setView] = useState<EditorView | null>(null)
  const [internalLineWrapping, setInternalLineWrapping] = useState(lineWrapping ?? false)
  const resolvedLineWrapping = lineWrapping ?? internalLineWrapping
  const listenersRef = useRef(new Set<() => void>())
  const configRef = useRef<CodeEditorComponentConfig>({
    value,
    defaultValue,
    onChange,
    onReady,
    autoFocus,
    placeholder,
    language,
    declared,
    extra: extensions,
  })

  configRef.current = {
    value,
    defaultValue,
    onChange,
    onReady,
    autoFocus,
    placeholder,
    language,
    declared,
    extra: extensions,
  }

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener)

    return () => {
      listenersRef.current.delete(listener)
    }
  }, [])

  const notify = useCallback(() => {
    for (const listener of listenersRef.current) {
      listener()
    }
  }, [])

  const setLineWrapping = useCallback((next: boolean) => {
    setInternalLineWrapping(next)
    onLineWrappingChange?.(next)
  }, [onLineWrappingChange])

  return (
    <CodeEditorContext
      value={{
        view,
        setView,
        subscribe,
        notify,
        configRef,
        signature,
        value,
        editable,
        readOnly,
        lineWrapping: resolvedLineWrapping,
        setLineWrapping,
      }}
    >
      <div
        data-slot="code-editor"
        className={cn(
          'flex w-full flex-col overflow-hidden rounded-lg border border-input bg-transparent text-foreground transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30',
          className,
        )}
      >
        {content}
      </div>
    </CodeEditorContext>
  )
}

export type CodeEditorContentProps = ComponentProps<'div'>

/**
 * The editable surface. Creates the CodeMirror view once the container is
 * mounted and keeps it in sync with the controlled document.
 */
export function CodeEditorContent({
  className,
  ...props
}: CodeEditorContentProps) {
  const {
    configRef,
    signature,
    view,
    setView,
    notify,
    editable,
    readOnly,
    value,
    lineWrapping,
  } = useCodeEditor()
  const hostRef = useRef<HTMLDivElement>(null)
  const editableCompartmentRef = useRef(new Compartment())
  const lineWrappingCompartmentRef = useRef(new Compartment())
  const editableRef = useRef(editable)
  const readOnlyRef = useRef(readOnly)
  const lineWrappingRef = useRef(lineWrapping)
  const notifyRef = useRef(notify)
  const lastEmittedRef = useRef<string | null>(null)

  editableRef.current = editable
  readOnlyRef.current = readOnly
  lineWrappingRef.current = lineWrapping
  notifyRef.current = notify

  useEffect(() => {
    const host = hostRef.current

    if (!host) {
      return
    }

    const config = configRef.current
    const doc = config.value ?? config.defaultValue ?? ''

    lastEmittedRef.current = doc

    const state = EditorState.create({
      doc,
      extensions: [
        history(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          indentWithTab,
        ]),
        placeholderExtension(config.placeholder),
        baseTheme,
        editableCompartmentRef.current.of([
          EditorView.editable.of(editableRef.current && !readOnlyRef.current),
          EditorState.readOnly.of(readOnlyRef.current),
        ]),
        lineWrappingCompartmentRef.current.of(
          lineWrappingRef.current
            ? EditorView.lineWrapping
            : [],
        ),
        ...resolveCodeEditorExtensions(config.declared, {
          language: config.language,
        }),
        ...(config.extra
          ? [config.extra]
          : []),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const next = update.state.doc.toString()

            if (next !== lastEmittedRef.current) {
              lastEmittedRef.current = next
              configRef.current.onChange?.(next)
            }
          }

          notifyRef.current()
        }),
      ],
    })

    const instance = new EditorView({ state, parent: host })

    setView(instance)
    config.onReady?.(instance)

    if (config.autoFocus) {
      instance.focus()
    }

    return () => {
      setView(null)
      instance.destroy()
    }
    // The extension signature is the identity of the editor configuration: a
    // different set of declarations recreates the view.
  }, [
    configRef,
    setView,
    signature,
  ])

  useEffect(() => {
    if (!view) {
      return
    }

    view.dispatch({
      effects: editableCompartmentRef.current.reconfigure([
        EditorView.editable.of(editable && !readOnly),
        EditorState.readOnly.of(readOnly),
      ]),
    })
  }, [editable, readOnly, view])

  useEffect(() => {
    if (!view) {
      return
    }

    view.dispatch({
      effects: lineWrappingCompartmentRef.current.reconfigure(
        lineWrapping
          ? EditorView.lineWrapping
          : [],
      ),
    })
  }, [lineWrapping, view])

  useEffect(() => {
    if (!view || value === undefined) {
      return
    }

    const current = view.state.doc.toString()

    if (current === value) {
      return
    }

    lastEmittedRef.current = value
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
    })
  }, [value, view])

  return (
    <div
      data-slot="code-editor-content"
      className={cn('relative min-h-0 flex-1', className)}
      {...props}
    >
      <div ref={hostRef} className="h-full w-full" />
    </div>
  )
}

export type CodeEditorToolbarProps = ComponentProps<'div'>

/**
 * Editor toolbar with the history controls, the line wrapping toggle and a
 * copy action. Extension items can add their own controls as children.
 */
export function CodeEditorToolbar({
  className,
  children,
  ...props
}: CodeEditorToolbarProps) {
  const { view } = useCodeEditor()

  useCodeEditorState()

  return (
    <TooltipProvider>
      <div
        data-slot="code-editor-toolbar"
        role="toolbar"
        aria-label="Code editor"
        className={cn(
          'flex flex-wrap items-center gap-1 border-b p-1.5',
          className,
        )}
        {...props}
      >
        <CodeEditorToolbarButton
          label="Undo"
          shortcut="Mod Z"
          disabled={!view || undoDepth(view.state) === 0}
          onClick={() => view && undo(view)}
        >
          <Undo2Icon />
        </CodeEditorToolbarButton>
        <CodeEditorToolbarButton
          label="Redo"
          shortcut="Shift Mod Z"
          disabled={!view || redoDepth(view.state) === 0}
          onClick={() => view && redo(view)}
        >
          <Redo2Icon />
        </CodeEditorToolbarButton>
        <CodeEditorCopyButton />
        <CodeEditorWrappingButton />
        {children}
      </div>
    </TooltipProvider>
  )
}

function CodeEditorWrappingButton() {
  const { lineWrapping, setLineWrapping } = useCodeEditor()

  return (
    <CodeEditorToolbarButton
      label="Soft wrap"
      pressed={lineWrapping}
      onPressedChange={setLineWrapping}
    >
      <WrapTextIcon />
    </CodeEditorToolbarButton>
  )
}

function CodeEditorCopyButton() {
  const { view } = useCodeEditor()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) {
      return
    }

    const timeout = window.setTimeout(setCopied, 1500, false)

    return () => window.clearTimeout(timeout)
  }, [copied])

  return (
    <CodeEditorToolbarButton
      label={copied ? 'Copied' : 'Copy code'}
      onClick={() => {
        if (!view) {
          return
        }

        void navigator.clipboard.writeText(view.state.doc.toString())
        setCopied(true)
      }}
    >
      {copied
        ? <CheckIcon />
        : <CopyIcon />}
    </CodeEditorToolbarButton>
  )
}

export interface CodeEditorToolbarButtonProps {
  label: string
  shortcut?: string
  /** Omit to render a plain action button instead of a toggle. */
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  onClick?: () => void
  disabled?: boolean
  className?: string
  children?: ReactNode
}

/**
 * A single toolbar control with a tooltip and an optional keyboard shortcut.
 * Used by the built-in controls and by extension items.
 */
export function CodeEditorToolbarButton({
  label,
  shortcut,
  pressed,
  onPressedChange,
  onClick,
  disabled,
  className,
  children,
}: CodeEditorToolbarButtonProps) {
  const control = pressed === undefined
    ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
          className={className}
        >
          {children}
        </Button>
      )
    : (
        <Toggle
          type="button"
          aria-label={label}
          size="sm"
          pressed={pressed}
          onPressedChange={onPressedChange}
          disabled={disabled}
          className={cn('h-7 min-w-7 px-0', className)}
        >
          {children}
        </Toggle>
      )

  return (
    <Tooltip>
      <TooltipTrigger render={control} />
      <TooltipContent side="bottom" className="flex items-center gap-1.5">
        <span>{label}</span>
        {shortcut
          ? <span className="text-muted-foreground">{shortcut}</span>
          : null}
      </TooltipContent>
    </Tooltip>
  )
}

export type CodeEditorStatusBarProps = ComponentProps<'div'>

/**
 * Status bar with the cursor position, the selection length and the language
 * shared by the highlighting and language items.
 */
export function CodeEditorStatusBar({
  className,
  ...props
}: CodeEditorStatusBarProps) {
  const { view, configRef, readOnly } = useCodeEditor()

  useCodeEditorState()

  const state = view?.state
  const head = state ? state.selection.main.head : 0
  const line = state
    ? state.doc.lineAt(head)
    : null
  const column = line
    ? head - line.from + 1
    : 1
  const selected = state
    ? state.selection.ranges.reduce(
        (total, range) => total + (range.to - range.from),
        0,
      )
    : 0

  return (
    <div
      data-slot="code-editor-status"
      className={cn(
        'flex items-center justify-between gap-2 border-t px-3 py-1.5 text-xs text-muted-foreground',
        className,
      )}
      {...props}
    >
      <span className="tabular-nums">
        {line
          ? `Ln ${line.number}, Col ${column}`
          : 'Ln 1, Col 1'}
      </span>
      <span className="flex items-center gap-3">
        {readOnly
          ? <span>Read only</span>
          : null}
        {selected > 0
          ? (
              <span>
                {selected}
                {' '}
                selected
              </span>
            )
          : null}
        {configRef.current.language
          ? (
              <span className="font-mono uppercase">
                {configRef.current.language}
              </span>
            )
          : null}
      </span>
    </div>
  )
}
