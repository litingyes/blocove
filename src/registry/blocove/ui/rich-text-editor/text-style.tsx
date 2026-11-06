import type {
  BackgroundColorOptions,
  ColorOptions,
  FontFamilyOptions,
  FontSizeOptions,
  LineHeightOptions,
  TextStyleOptions,
} from '@tiptap/extension-text-style'
import type { Editor } from '@tiptap/react'
import type { ExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import {
  BackgroundColor,
  Color,
  FontFamily,
  FontSize,
  LineHeight,
  TextStyle,
} from '@tiptap/extension-text-style'
import { useCurrentEditor } from '@tiptap/react'
import { TypeIcon } from 'lucide-react'
import { useState } from 'react'
import { EditorToolbarButton } from '@/components/blocove/rich-text-editor/editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'

/**
 * Registers the text style mark. Every attribute item below registers it too,
 * because the attribute extensions extend the mark and cannot work without it;
 * the editor keeps the first declaration, so composing them is safe.
 */
export const EditorTextStyle: ExtensionComponent<Partial<TextStyleOptions>> = defineExtensionComponent(
  'text-style',
  props => [
    TextStyle.configure(props),
  ],
)

export const EditorColor: ExtensionComponent<Partial<ColorOptions>> = defineExtensionComponent(
  'color',
  props => [
    TextStyle,
    Color.configure(props),
  ],
)

export const EditorBackgroundColor: ExtensionComponent<Partial<BackgroundColorOptions>> = defineExtensionComponent(
  'background-color',
  props => [
    TextStyle,
    BackgroundColor.configure(props),
  ],
)

export const EditorFontFamily: ExtensionComponent<Partial<FontFamilyOptions>> = defineExtensionComponent(
  'font-family',
  props => [
    TextStyle,
    FontFamily.configure(props),
  ],
)

export const EditorFontSize: ExtensionComponent<Partial<FontSizeOptions>> = defineExtensionComponent(
  'font-size',
  props => [
    TextStyle,
    FontSize.configure(props),
  ],
)

export const EditorLineHeight: ExtensionComponent<Partial<LineHeightOptions>> = defineExtensionComponent(
  'line-height',
  props => [
    TextStyle,
    LineHeight.configure(props),
  ],
)

export interface EditorTextStyleToolbarProps {
  className?: string
}

/**
 * Toolbar control for the text style mark: color, background color, font
 * family, font size and line height.
 */
export function EditorTextStyleToolbar({
  className,
}: EditorTextStyleToolbarProps) {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return <EditorTextStyleToolbarContent editor={editor} className={className} />
}

function EditorTextStyleToolbarContent({
  editor,
  className,
}: {
  editor: Editor
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [color, setColor] = useState('#111827')
  const [background, setBackground] = useState('#fde68a')
  const [family, setFamily] = useState('')
  const [size, setSize] = useState('')
  const [lineHeight, setLineHeight] = useState('')

  function run(command: (chain: ReturnType<Editor['chain']>) => ReturnType<Editor['chain']>) {
    command(editor.chain().focus()).run()
  }

  function applyFamily() {
    const value = family.trim()

    run(chain => value === ''
      ? chain.unsetFontFamily()
      : chain.setFontFamily(value))
  }

  function applySize() {
    const value = size.trim()

    run(chain => value === ''
      ? chain.unsetFontSize()
      : chain.setFontSize(value))
  }

  function applyLineHeight() {
    const value = lineHeight.trim()

    run(chain => value === ''
      ? chain.unsetLineHeight()
      : chain.setLineHeight(value))
  }

  function clearTextStyle() {
    run(chain => chain
      .unsetColor()
      .unsetBackgroundColor()
      .unsetFontFamily()
      .unsetFontSize()
      .unsetLineHeight())
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* `EditorToolbarButton` does not forward the trigger props Base UI hands
          out, so the popup is anchored to a presentational wrapper. */}
      <PopoverTrigger
        nativeButton={false}
        render={<span className="inline-flex" role="presentation" tabIndex={-1} />}
      >
        <EditorToolbarButton label="Text style" className={className}>
          <TypeIcon />
        </EditorToolbarButton>
      </PopoverTrigger>
      <PopoverContent aria-label="Text style" align="start" className="w-72">
        <div className="flex flex-col gap-2">
          <label className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Text color</span>
            <input
              type="color"
              aria-label="Text color"
              value={color}
              onChange={(event) => {
                setColor(event.target.value)
                run(chain => chain.setColor(event.target.value))
              }}
              className="h-7 w-10 cursor-pointer rounded border border-input bg-transparent"
            />
          </label>
          <label className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Background</span>
            <input
              type="color"
              aria-label="Background color"
              value={background}
              onChange={(event) => {
                setBackground(event.target.value)
                run(chain => chain.setBackgroundColor(event.target.value))
              }}
              className="h-7 w-10 cursor-pointer rounded border border-input bg-transparent"
            />
          </label>
          <Input
            aria-label="Font family"
            placeholder="Georgia, serif"
            value={family}
            onChange={event => setFamily(event.target.value)}
            onBlur={applyFamily}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                applyFamily()
              }
            }}
          />
          <Input
            aria-label="Font size"
            placeholder="1.25em"
            value={size}
            onChange={event => setSize(event.target.value)}
            onBlur={applySize}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                applySize()
              }
            }}
          />
          <Input
            aria-label="Line height"
            placeholder="1.5"
            value={lineHeight}
            onChange={event => setLineHeight(event.target.value)}
            onBlur={applyLineHeight}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                applyLineHeight()
              }
            }}
          />
          <div className="flex items-center justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={clearTextStyle}>
              Clear text style
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
