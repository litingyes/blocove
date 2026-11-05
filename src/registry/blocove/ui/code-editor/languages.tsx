import type { Extension } from '@codemirror/state'
import type { CodeEditorExtensionContext } from '@/lib/blocove/code-editor-extension'
import { Compartment } from '@codemirror/state'
import { ViewPlugin } from '@codemirror/view'
import { defineCodeEditorExtension } from '@/lib/blocove/code-editor-extension'

export interface CodeEditorLanguagesProps {
  /** Language used by the editing extensions. Falls back to the root language. */
  language?: string
}

// A language is a CodeMirror extension that understands the document, so
// indentation, bracket matching and folding follow the syntax. Highlighting is
// separate: it comes from the shiki item.
const languageLoaders: Record<string, () => Promise<Extension>> = {
  css: () => import('@codemirror/lang-css').then(module => module.css()),
  html: () => import('@codemirror/lang-html').then(module => module.html()),
  javascript: () => import('@codemirror/lang-javascript').then(module => module.javascript()),
  json: () => import('@codemirror/lang-json').then(module => module.json()),
  jsonc: () => import('@codemirror/lang-json').then(module => module.json()),
  jsx: () => import('@codemirror/lang-javascript').then(module => module.javascript({ jsx: true })),
  markdown: () => import('@codemirror/lang-markdown').then(module => module.markdown()),
  tsx: () => import('@codemirror/lang-javascript').then(module => module.javascript({ jsx: true, typescript: true })),
  typescript: () => import('@codemirror/lang-javascript').then(module => module.javascript({ typescript: true })),
}

const aliases: Record<string, string> = {
  js: 'javascript',
  md: 'markdown',
  ts: 'typescript',
}

function resolveLoader(language: string | undefined) {
  if (!language) {
    return null
  }

  const name = language.toLowerCase()

  return languageLoaders[name] ?? languageLoaders[aliases[name]] ?? null
}

function languageSupport(language: string | undefined): Extension[] {
  const loader = resolveLoader(language)

  if (!loader) {
    return []
  }

  const compartment = new Compartment()

  return [
    compartment.of([]),
    ViewPlugin.define((view) => {
      let cancelled = false

      loader().then((extension) => {
        if (cancelled) {
          return
        }

        view.dispatch({
          effects: compartment.reconfigure(extension),
        })
      }).catch(() => {})

      return {
        destroy() {
          cancelled = true
        },
      }
    }),
  ]
}

/**
 * Language support for the editor: parses the document so the editing
 * behaviour (indentation, bracket matching, folding, completion) follows the
 * syntax. Colors come from the shiki item.
 */
export const CodeEditorLanguages = defineCodeEditorExtension<CodeEditorLanguagesProps>(
  'languages',
  (props: CodeEditorLanguagesProps, context: CodeEditorExtensionContext): Extension[] =>
    languageSupport(props.language ?? context.language),
)
