import type { HighlighterCore } from 'shiki/core'
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

export type CodeEditorColorScheme = 'light' | 'dark'

/** A highlighted range of the document, styled with the token colors. */
export interface CodeEditorToken {
  from: number
  to: number
  style: string
}

// Languages are loaded the first time they are used, so the editor does not
// pull every grammar into the bundle. The keys are the names accepted by the
// `language` prop.
const languages = {
  bash: () => import('shiki/langs/shellscript.mjs'),
  css: () => import('shiki/langs/css.mjs'),
  diff: () => import('shiki/langs/diff.mjs'),
  html: () => import('shiki/langs/html.mjs'),
  javascript: () => import('shiki/langs/javascript.mjs'),
  json: () => import('shiki/langs/json.mjs'),
  jsx: () => import('shiki/langs/jsx.mjs'),
  markdown: () => import('shiki/langs/markdown.mjs'),
  python: () => import('shiki/langs/python.mjs'),
  sql: () => import('shiki/langs/sql.mjs'),
  tsx: () => import('shiki/langs/tsx.mjs'),
  typescript: () => import('shiki/langs/typescript.mjs'),
  yaml: () => import('shiki/langs/yaml.mjs'),
}

const aliases: Record<string, keyof typeof languages> = {
  js: 'javascript',
  md: 'markdown',
  py: 'python',
  sh: 'bash',
  shell: 'bash',
  shellscript: 'bash',
  ts: 'typescript',
  yml: 'yaml',
  zsh: 'bash',
}

const themes: Record<CodeEditorColorScheme, string> = {
  light: 'github-light',
  dark: 'github-dark',
}

// Font style bits reported by shiki: 1 = italic, 2 = bold, 4 = underline.
const fontStyleRules = [
  { bit: 1, css: 'font-style: italic;' },
  { bit: 2, css: 'font-weight: 600;' },
  { bit: 4, css: 'text-decoration: underline;' },
] as const

let highlighter: Promise<HighlighterCore> | undefined

function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [
      import('shiki/themes/github-light.mjs'),
      import('shiki/themes/github-dark.mjs'),
    ],
    langs: [],
    engine: createJavaScriptRegexEngine({ forgiving: true }),
  })

  return highlighter
}

function resolveLanguage(language: string) {
  const name = language.toLowerCase()

  if (name in languages) {
    return name as keyof typeof languages
  }

  return aliases[name] ?? null
}

/**
 * Tokenizes the whole document. Returns `null` for a language the editor does
 * not ship a grammar for, so the surface stays unhighlighted instead of failing.
 */
export async function tokenizeCodeEditor(
  code: string,
  language: string,
  colorScheme: CodeEditorColorScheme,
): Promise<CodeEditorToken[] | null> {
  const name = resolveLanguage(language)

  if (!name) {
    return null
  }

  const shiki = await getHighlighter()

  if (!shiki.getLoadedLanguages().includes(name)) {
    await shiki.loadLanguage(languages[name])
  }

  const { tokens } = shiki.codeToTokens(code, {
    lang: name,
    theme: themes[colorScheme],
  })

  const highlighted: CodeEditorToken[] = []
  let offset = 0

  for (const line of tokens) {
    for (const token of line) {
      const from = offset
      offset += token.content.length

      if (token.content.length === 0) {
        continue
      }

      const style = [
        token.color
          ? `color: ${token.color};`
          : '',
        ...fontStyleRules
          .filter(rule => ((token.fontStyle ?? 0) & rule.bit) === rule.bit)
          .map(rule => rule.css),
      ].join('')

      highlighted.push({ from, to: offset, style })
    }

    // The newline that separates this line from the next one.
    offset += 1
  }

  return highlighted
}

/**
 * The color scheme the editor renders for. The item follows the class based
 * theme shadcn uses: the `dark` class on `<html>` or `<body>` selects the dark
 * theme, its absence the light one. Pass `colorScheme` to force either one.
 */
export function getCodeEditorColorScheme(): CodeEditorColorScheme {
  if (typeof document === 'undefined') {
    return 'light'
  }

  const darkClass = document.documentElement.classList.contains('dark')
    || document.body?.classList.contains('dark')

  return darkClass ? 'dark' : 'light'
}

/** Calls the listener when the page class based theme changes. */
export function subscribeCodeEditorColorScheme(listener: () => void) {
  if (typeof document === 'undefined') {
    return () => {}
  }

  const observer = new MutationObserver(listener)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })

  if (document.body) {
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    })
  }

  return () => observer.disconnect()
}
