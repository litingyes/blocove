import type { MathematicsOptions } from '@tiptap/extension-mathematics'
import type { Editor } from '@tiptap/react'
import type { ExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'
import { Mathematics } from '@tiptap/extension-mathematics'
import { useCurrentEditor } from '@tiptap/react'
import { SigmaIcon } from 'lucide-react'
import { useState } from 'react'
import { EditorToolbarButton } from '@/components/blocove/rich-text-editor/editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'

const defaultLatex = 'E = mc^2'

/**
 * Registers the KaTeX backed inline and block math nodes.
 */
export const EditorMathematics: ExtensionComponent<Partial<MathematicsOptions>> = defineExtensionComponent(
  'mathematics',
  props => [
    Mathematics.configure(props),
  ],
)

export interface EditorMathematicsToolbarProps {
  className?: string
}

/**
 * Toolbar control that inserts an inline or a block formula.
 */
export function EditorMathematicsToolbar({
  className,
}: EditorMathematicsToolbarProps) {
  const { editor } = useCurrentEditor()

  if (!editor) {
    return null
  }

  return <EditorMathematicsToolbarContent editor={editor} className={className} />
}

function EditorMathematicsToolbarContent({
  editor,
  className,
}: {
  editor: Editor
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [latex, setLatex] = useState('')

  function insert(kind: 'inline' | 'block') {
    const value = latex.trim() === ''
      ? defaultLatex
      : latex.trim()

    if (kind === 'inline') {
      editor.chain().focus().insertInlineMath({ latex: value }).run()
    }
    else {
      editor.chain().focus().insertBlockMath({ latex: value }).run()
    }

    setLatex('')
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* `EditorToolbarButton` does not forward the trigger props Base UI hands
          out, so the popup is anchored to a presentational wrapper. */}
      <PopoverTrigger
        nativeButton={false}
        render={<span className="inline-flex" role="presentation" tabIndex={-1} />}
      >
        <EditorToolbarButton label="Math" className={className}>
          <SigmaIcon />
        </EditorToolbarButton>
      </PopoverTrigger>
      <PopoverContent aria-label="Math" align="start" className="w-80">
        <Input
          aria-label="LaTeX"
          placeholder={defaultLatex}
          value={latex}
          onChange={event => setLatex(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              insert('inline')
            }
          }}
        />
        <div className="flex items-center justify-end gap-1.5">
          <Button type="button" variant="ghost" size="sm" onClick={() => insert('block')}>
            Block math
          </Button>
          <Button type="button" size="sm" onClick={() => insert('inline')}>
            Inline math
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
