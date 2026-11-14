/* eslint-disable react/no-array-index-key -- tokens are positional within their line. */

import type { ReactNode } from 'react'
import type { GrammarState, HighlighterCore } from 'shiki/core'
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

/**
 * Shiki tokenizer for the markdown code fences.
 *
 * It mirrors the tokenizer the docs panels use, with one difference that
 * matters here: `highlight` returns the grammar state after the last line, so a
 * fence that grows line by line only tokenizes the new lines instead of the
 * whole block on every token.
 */

// Languages load the first time they are used, so a page that renders one fence
// does not pay for every grammar.
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

const themes = {
  light: 'github-light',
  dark: 'github-dark',
}

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

function resolveLanguage(language: string): keyof typeof languages | null {
  const name = language.toLowerCase()

  if (name in languages) {
    return name as keyof typeof languages
  }

  return aliases[name] ?? null
}

/** A highlighted block: one entry per line, each entry holding the token spans. */
export interface MarkdownFenceHighlight {
  lines: ReactNode[][]
  state?: GrammarState
}

export interface MarkdownFenceHighlighter {
  /** Highlights more code, continuing from the grammar state of the last call. */
  highlight: (code: string, state?: GrammarState) => MarkdownFenceHighlight
}

/**
 * Loads a fence highlighter for `language`. A language that is not listed
 * resolves to `null`, which the renderer shows as plain text.
 */
export async function loadMarkdownFenceHighlighter(language: string): Promise<MarkdownFenceHighlighter | null> {
  const name = resolveLanguage(language)

  if (!name) {
    return null
  }

  const shiki = await getHighlighter()

  if (!shiki.getLoadedLanguages().includes(name)) {
    await shiki.loadLanguage(languages[name])
  }

  return {
    highlight(code, state) {
      const tokens = shiki.codeToTokens(code, {
        lang: name,
        themes,
        defaultColor: false,
        grammarState: state,
      }).tokens

      return {
        lines: tokens.map(line =>
          line.map((token, index) => (
            <span
              key={index}
              style={token.htmlStyle as React.CSSProperties}
              className="text-(--shiki-light) dark:text-(--shiki-dark)"
            >
              {token.content}
            </span>
          )),
        ),
        state: shiki.getLastGrammarState(tokens),
      }
    },
  }
}
