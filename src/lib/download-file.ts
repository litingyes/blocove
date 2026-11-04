const languageExtensions: Record<string, string> = {
  bash: 'sh',
  css: 'css',
  diff: 'diff',
  html: 'html',
  javascript: 'js',
  json: 'json',
  jsx: 'jsx',
  markdown: 'md',
  python: 'py',
  sh: 'sh',
  sql: 'sql',
  ts: 'ts',
  tsx: 'tsx',
  typescript: 'ts',
  yaml: 'yml',
  yml: 'yml',
}

function sanitizeFileName(name: string) {
  return name.replace(/[^\w.-]+/g, '-')
}

/**
 * File name for a downloaded code panel. A file path keeps its basename, a
 * short label becomes a slug, and the extension follows the language.
 */
export function codeFileName(title: string | undefined, language: string) {
  const languageKey = language.trim().toLowerCase()
  const extension = languageExtensions[languageKey] ?? (languageKey || 'txt')
  const label = title?.trim()

  if (label) {
    const segments = label.split(/[\\/]+/).filter(Boolean)
    const last = segments[segments.length - 1] ?? ''

    if (segments.length > 1 && last.includes('.')) {
      return sanitizeFileName(last)
    }

    const slug = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    if (slug) {
      return `${slug}.${extension}`
    }
  }

  return `snippet.${extension}`
}

/**
 * Downloads a string as a text file through a temporary object URL.
 */
export function downloadTextFile(fileName: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}
