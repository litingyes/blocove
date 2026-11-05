import type { Extension } from '@codemirror/state'
import type { DecorationSet, ViewUpdate } from '@codemirror/view'
import type { CodeEditorExtensionContext } from '@/lib/blocove/code-editor-extension'
import type { CodeEditorColorScheme } from '@/lib/blocove/code-editor-shiki'
import { StateEffect, StateField } from '@codemirror/state'
import { Decoration, EditorView, ViewPlugin } from '@codemirror/view'
import { defineCodeEditorExtension } from '@/lib/blocove/code-editor-extension'
import {
  getCodeEditorColorScheme,
  subscribeCodeEditorColorScheme,
  tokenizeCodeEditor,
} from '@/lib/blocove/code-editor-shiki'

export interface CodeEditorShikiProps {
  /** Language used by shiki. Falls back to the language of the editor root. */
  language?: string
  /**
   * Theme to render. `auto` follows the `dark` class on the page, like the rest
   * of shadcn/ui.
   */
  colorScheme?: CodeEditorColorScheme | 'auto'
  /** Debounce in milliseconds before the document is tokenized again. */
  delay?: number
  /** Documents longer than this many characters stay unhighlighted. */
  maxLength?: number
}

interface ShikiOptions {
  language?: string
  colorScheme: CodeEditorColorScheme | 'auto'
  delay: number
  maxLength: number
}

const setHighlights = StateEffect.define<DecorationSet>()

const highlightField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(decorations, transaction) {
    let next = decorations.map(transaction.changes)

    for (const effect of transaction.effects) {
      if (effect.is(setHighlights)) {
        next = effect.value
      }
    }

    return next
  },
  provide: field => EditorView.decorations.from(field),
})

class ShikiHighlighter {
  private timer: ReturnType<typeof setTimeout> | undefined
  private generation = 0
  private destroyed = false
  private unsubscribe: () => void

  constructor(
    private readonly view: EditorView,
    private readonly options: ShikiOptions,
  ) {
    this.unsubscribe = this.options.colorScheme === 'auto'
      ? subscribeCodeEditorColorScheme(() => this.schedule())
      : () => {}
    this.schedule(0)
  }

  update(update: ViewUpdate) {
    if (update.docChanged) {
      this.schedule()
    }
  }

  destroy() {
    this.destroyed = true
    this.unsubscribe()

    if (this.timer) {
      clearTimeout(this.timer)
    }
  }

  private schedule(delay = this.options.delay) {
    if (this.timer) {
      clearTimeout(this.timer)
    }

    this.timer = setTimeout(() => {
      this.timer = undefined
      void this.highlight()
    }, delay)
  }

  private async highlight() {
    const generation = ++this.generation
    const code = this.view.state.doc.toString()

    if (!this.options.language || code.length > this.options.maxLength) {
      this.apply(Decoration.none)
      return
    }

    const tokens = await tokenizeCodeEditor(
      code,
      this.options.language,
      this.options.colorScheme === 'auto'
        ? getCodeEditorColorScheme()
        : this.options.colorScheme,
    )

    // The document, the language or the color scheme changed while the
    // tokenizer was running: the result is stale.
    if (generation !== this.generation || this.destroyed) {
      return
    }

    if (this.view.state.doc.toString() !== code) {
      this.schedule()
      return
    }

    this.apply(
      tokens
        ? Decoration.set(
            tokens.map(token =>
              Decoration.mark({
                class: 'shiki-token',
                attributes: { style: token.style },
              }).range(token.from, token.to),
            ),
            true,
          )
        : Decoration.none,
    )
  }

  private apply(decorations: DecorationSet) {
    if (this.destroyed) {
      return
    }

    this.view.dispatch({
      effects: setHighlights.of(decorations),
    })
  }
}

/**
 * Syntax highlighting through shiki. The document is tokenized with the same
 * themes and grammars as the documentation code panels, so the editor colors
 * match the rest of the page.
 */
export const CodeEditorShiki = defineCodeEditorExtension<CodeEditorShikiProps>(
  'shiki',
  (props: CodeEditorShikiProps, context: CodeEditorExtensionContext): Extension[] => {
    const language = props.language ?? context.language

    return [
      highlightField,
      ViewPlugin.define(view => new ShikiHighlighter(view, {
        language,
        colorScheme: props.colorScheme ?? 'auto',
        delay: props.delay ?? 120,
        maxLength: props.maxLength ?? 150_000,
      })),
    ]
  },
)
