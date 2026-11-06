import type { EditorOptions, Extensions, Editor as TiptapEditor } from '@tiptap/react'
import type { ReactNode } from 'react'
import { Document } from '@tiptap/extension-document'
import { TextAlign } from '@tiptap/extension-text-align'
import { CharacterCount, Placeholder, UndoRedo } from '@tiptap/extensions'
import {
  EditorContext,
  EditorContent as TiptapEditorContent,
  useCurrentEditor,
  useEditor,
  useEditorState,
} from '@tiptap/react'
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus'
import { cn } from 'cn'
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  EraserIcon,
  Redo2Icon,
  Undo2Icon,
} from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  collectEditorChildren,
  dedupeExtensions,
  extensionSignature,
  resolveExtensions,
} from '@/lib/blocove/rich-text-editor-extension'

export interface EditorProps {
  /** Controlled HTML content. */
  value?: string
  /** Initial HTML content when uncontrolled. */
  defaultValue?: string
  /** Called with the new HTML whenever the document changes. */
  onChange?: (html: string) => void
  /** Placeholder shown while the document is empty. */
  placeholder?: string
  /** Whether the document can be edited. */
  editable?: boolean
  /** Focus the editor once it is ready. */
  autoFocus?: boolean
  /** Maximum character count, enforced by the CharacterCount extension. */
  characterLimit?: number
  /** Additional Tiptap extensions, appended after the declared ones. */
  extensions?: Extensions
  /**
   * Whether the editor registers its own undo/redo history.
   *
   * Defaults to `false` when a collaboration extension is present, because
   * collaboration carries its own undo manager, and to `true` otherwise.
   */
  history?: boolean
  /** Called once the editor instance is created. */
  onReady?: (editor: TiptapEditor) => void
  className?: string
  /** ProseMirror editor props, merged with the defaults. */
  editorProps?: EditorOptions['editorProps']
  /** Editor UI and extension declarations. */
  children?: ReactNode
}

/**
 * Rich text editor root. Registers the extensions declared by its children,
 * provides the Tiptap editor context and renders the editor UI.
 */
export function Editor({
  value,
  defaultValue,
  onChange,
  placeholder = 'Start writing…',
  editable = true,
  autoFocus = false,
  characterLimit,
  extensions,
  history,
  onReady,
  className,
  editorProps,
  children,
}: EditorProps) {
  const { extensions: extensionConfigs } = collectEditorChildren(children)
  const configSignature = extensionSignature(extensionConfigs)
  const rawExtensionSignature = (extensions ?? [])
    .map(extension => extension.name)
    .join(',')
  const onChangeRef = useRef(onChange)
  const onReadyRef = useRef(onReady)
  const lastEmittedRef = useRef<string | null>(null)
  const declaredExtensions = [
    ...resolveExtensions(extensionConfigs),
    ...(extensions ?? []),
  ]
  // Collaboration ships its own undo manager, so registering the editor's
  // history next to it would fight over the same transaction metadata.
  const historyEnabled = history
    ?? !declaredExtensions.some(extension => extension.name === 'collaboration')

  onChangeRef.current = onChange
  onReadyRef.current = onReady

  const editor = useEditor(
    {
      immediatelyRender: false,
      autofocus: autoFocus ? 'end' : false,
      editable,
      content: value ?? defaultValue ?? '',
      extensions: dedupeExtensions([
        Document,
        ...declaredExtensions,
        Placeholder.configure({ placeholder }),
        CharacterCount.configure({ limit: characterLimit }),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
        ...(historyEnabled
          ? [UndoRedo]
          : []),
      ]),
      editorProps: {
        attributes: {
          'aria-label': 'Rich text editor',
          'aria-multiline': 'true',
          'class': 'focus:outline-none',
        },
        ...editorProps,
      },
      onCreate: ({ editor: instance }) => {
        onReadyRef.current?.(instance)
      },
      onUpdate: ({ editor: instance }) => {
        const html = instance.getHTML()

        if (html === lastEmittedRef.current) {
          return
        }

        lastEmittedRef.current = html
        onChangeRef.current?.(html)
      },
    },
    [configSignature, rawExtensionSignature, historyEnabled],
  )

  useEffect(() => {
    if (!editor) {
      return
    }

    // Tiptap emits an `update` event by default when only the editable flag
    // changes, which would call `onChange` with unchanged HTML on mount and on
    // every `editable` toggle. Suppress it: `onChange` reports document edits.
    editor.setEditable(editable, false)
  }, [editor, editable])

  useEffect(() => {
    if (!editor || value === undefined) {
      return
    }

    if (value === editor.getHTML()) {
      return
    }

    lastEmittedRef.current = value
    editor.commands.setContent(value, { emitUpdate: false })
  }, [editor, value])

  return (
    <EditorContext value={{ editor }}>
      <div
        data-slot="editor"
        className={cn(
          'flex w-full flex-col overflow-hidden rounded-lg border border-input bg-transparent text-foreground transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30',
          className,
        )}
      >
        {children}
      </div>
    </EditorContext>
  )
}

export interface EditorContentProps extends React.ComponentProps<'div'> {
  /** Apply the shadcn/typeset styles to the rendered document. */
  typeset?: boolean
}

const typesetClassName = [
  'typeset typeset-docs',
  'min-h-0',
  '[&_.ProseMirror]:min-h-24',
  '[&_.ProseMirror]:break-words',
  '[&_.ProseMirror]:outline-none',
  '[&_.ProseMirror-focused]:outline-none',
  '[&_.is-editor-empty:first-child::before]:pointer-events-none',
  '[&_.is-editor-empty:first-child::before]:float-left',
  '[&_.is-editor-empty:first-child::before]:h-0',
  '[&_.is-editor-empty:first-child::before]:text-muted-foreground',
  '[&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
].join(' ')

/**
 * The editable surface. Wraps the ProseMirror content in a typeset container;
 * the container must not carry `data-slot` so typeset styles reach the content.
 */
export function EditorContent({
  className,
  typeset = true,
  ...props
}: EditorContentProps) {
  const { editor } = useCurrentEditor()

  return (
    <div
      data-slot="editor-content"
      className={cn('min-h-0 flex-1 px-3 py-2.5', className)}
      {...props}
    >
      <div className={cn(typeset ? typesetClassName : 'min-h-0')}>
        {editor
          ? <TiptapEditorContent editor={editor} />
          : <div className="min-h-24" />}
      </div>
    </div>
  )
}

export interface EditorToolbarProps extends React.ComponentProps<'div'> {
  /** Extension controls rendered between the history and alignment groups. */
  children?: ReactNode
}

/**
 * Editor toolbar. Renders the history and alignment controls and slots the
 * extension-provided controls in between.
 */
export function EditorToolbar({
  className,
  children,
  ...props
}: EditorToolbarProps) {
  const { editor } = useCurrentEditor()

  return (
    <TooltipProvider>
      <div
        data-slot="editor-toolbar"
        role="toolbar"
        aria-label="Formatting"
        className={cn(
          'flex flex-wrap items-center gap-1 border-b p-1.5',
          className,
        )}
        {...props}
      >
        {editor
          ? <EditorToolbarContent editor={editor}>{children}</EditorToolbarContent>
          : <div className="h-7" aria-hidden />}
      </div>
    </TooltipProvider>
  )
}

function EditorToolbarContent({
  editor,
  children,
}: {
  editor: TiptapEditor
  children?: ReactNode
}) {
  const state = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      canUndo: instance.can().undo(),
      canRedo: instance.can().redo(),
      alignLeft: instance.isActive({ textAlign: 'left' }),
      alignCenter: instance.isActive({ textAlign: 'center' }),
      alignRight: instance.isActive({ textAlign: 'right' }),
    }),
  })

  return (
    <>
      <EditorToolbarButton
        label="Undo"
        shortcut="Mod Z"
        disabled={!state.canUndo}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2Icon />
      </EditorToolbarButton>
      <EditorToolbarButton
        label="Redo"
        shortcut="Shift Mod Z"
        disabled={!state.canRedo}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2Icon />
      </EditorToolbarButton>

      {children
        ? (
            <>
              <Separator
                orientation="vertical"
                className="mx-1 h-5 self-center"
              />
              {children}
            </>
          )
        : null}

      <Separator orientation="vertical" className="mx-1 h-5 self-center" />
      <EditorToolbarButton
        label="Align left"
        pressed={state.alignLeft}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign('left').run()}
      >
        <AlignLeftIcon />
      </EditorToolbarButton>
      <EditorToolbarButton
        label="Align center"
        pressed={state.alignCenter}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign('center').run()}
      >
        <AlignCenterIcon />
      </EditorToolbarButton>
      <EditorToolbarButton
        label="Align right"
        pressed={state.alignRight}
        onPressedChange={() =>
          editor.chain().focus().setTextAlign('right').run()}
      >
        <AlignRightIcon />
      </EditorToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-5 self-center" />
      <EditorToolbarButton
        label="Clear formatting"
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()}
      >
        <EraserIcon />
      </EditorToolbarButton>
    </>
  )
}

export interface EditorToolbarButtonProps {
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
 * Used by the built-in controls and by every extension item.
 */
export function EditorToolbarButton({
  label,
  shortcut,
  pressed,
  onPressedChange,
  onClick,
  disabled,
  className,
  children,
}: EditorToolbarButtonProps) {
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
          ? <Kbd>{shortcut}</Kbd>
          : null}
      </TooltipContent>
    </Tooltip>
  )
}

export interface EditorBubbleMenuProps {
  className?: string
  /** Mark controls rendered inside the floating menu. */
  children?: ReactNode
}

/**
 * Floating formatting menu shown above a text selection.
 */
export function EditorBubbleMenu({
  className,
  children,
}: EditorBubbleMenuProps) {
  const { editor } = useCurrentEditor()

  if (!editor || !children) {
    return null
  }

  return (
    <BubbleMenu
      editor={editor}
      data-slot="editor-bubble-menu"
      options={{ placement: 'top' }}
      shouldShow={({ editor: instance, state }) =>
        !state.selection.empty
        && instance.isEditable
        && !instance.isActive('codeBlock')}
      className={cn(
        'flex items-center gap-0.5 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10',
        className,
      )}
    >
      <TooltipProvider>{children}</TooltipProvider>
    </BubbleMenu>
  )
}

export interface EditorFloatingMenuProps {
  className?: string
  /** Controls rendered inside the floating menu. */
  children?: ReactNode
}

/**
 * Floating menu anchored to the block the caret sits in. It only shows on an
 * empty block, which is where an insertion affordance such as a slash menu or a
 * quick insert control belongs.
 */
export function EditorFloatingMenu({
  className,
  children,
}: EditorFloatingMenuProps) {
  const { editor } = useCurrentEditor()

  if (!editor || !children) {
    return null
  }

  return (
    <FloatingMenu
      editor={editor}
      data-slot="editor-floating-menu"
      options={{ placement: 'bottom-start' }}
      shouldShow={({ editor: instance, state }) =>
        instance.isEditable
        && state.selection.empty
        && !instance.isActive('codeBlock')
        && state.selection.$from.parent.content.size === 0}
      className={cn(
        'flex items-center gap-0.5 rounded-lg border bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10',
        className,
      )}
    >
      <TooltipProvider>{children}</TooltipProvider>
    </FloatingMenu>
  )
}

export interface EditorCharacterCountProps {
  className?: string
  format?: 'characters' | 'words' | 'both'
}

/**
 * Live character/word count for the current document.
 */
export function EditorCharacterCount({
  className,
  format = 'characters',
}: EditorCharacterCountProps) {
  const { editor } = useCurrentEditor()

  return (
    <div
      data-slot="editor-character-count"
      className={cn(
        'flex items-center justify-end gap-3 border-t px-3 py-1.5 text-xs text-muted-foreground',
        className,
      )}
    >
      {editor
        ? <EditorCharacterCountContent editor={editor} format={format} />
        : <span>0 characters</span>}
    </div>
  )
}

function EditorCharacterCountContent({
  editor,
  format,
}: {
  editor: TiptapEditor
  format: NonNullable<EditorCharacterCountProps['format']>
}) {
  const counts = useEditorState({
    editor,
    selector: ({ editor: instance }) => {
      const storage = instance.storage.characterCount as {
        characters: () => number
        words: () => number
      }
      const limit = instance.extensionManager.extensions.find(
        extension => extension.name === 'characterCount',
      )?.options.limit as number | null | undefined

      return {
        characters: storage.characters(),
        words: storage.words(),
        limit: limit ?? null,
      }
    },
  })

  const parts = format === 'words'
    ? [`${counts.words} words`]
    : format === 'both'
      ? [`${counts.characters} characters`, `${counts.words} words`]
      : [
          counts.limit === null
            ? `${counts.characters} characters`
            : `${counts.characters} / ${counts.limit} characters`,
        ]

  return (
    <>
      {parts.map(part => (
        <span key={part}>{part}</span>
      ))}
    </>
  )
}
