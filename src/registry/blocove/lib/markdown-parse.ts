import type { ComponentType } from 'react'

/**
 * The dependency-free markdown parser behind the markdown family.
 *
 * It is deliberately small: it supports the block and inline constructs the
 * documentation demonstrates, and anything else renders as text. Two entry
 * points cover the two consumers: `parseMarkdown` for a finished document and
 * `extendMarkdown` for a document that grows token by token. The cache keeps
 * the blocks that are `terminated` — that is, blocks whose scanner stopped for
 * a reason other than the end of the input — and re-parses only the open tail,
 * so streaming re-renders one block instead of the document.
 */

export type MarkdownHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export type MarkdownTableAlign = 'left' | 'center' | 'right' | null

export interface MarkdownSourceRange {
  /** Offset of the block's first character, in the source of its own parse level. */
  start: number
  /** Offset just after the block's last consumed line. */
  end: number
  /**
   * Whether the scanner stopped for a reason other than the end of the input.
   * Only terminated blocks are reused when the source grows.
   */
  terminated: boolean
}

export interface MarkdownHeadingBlock extends MarkdownSourceRange {
  kind: 'heading'
  level: MarkdownHeadingLevel
  inline: MarkdownInline[]
}

export interface MarkdownParagraphBlock extends MarkdownSourceRange {
  kind: 'paragraph'
  inline: MarkdownInline[]
}

export interface MarkdownCodeBlock extends MarkdownSourceRange {
  kind: 'code'
  /** Info string of the opening fence, `''` when it carries none. */
  language: string
  code: string
}

export interface MarkdownBlockquoteBlock extends MarkdownSourceRange {
  kind: 'blockquote'
  children: MarkdownBlock[]
}

export interface MarkdownListItem {
  children: MarkdownBlock[]
  /** `null` for a plain item, `'checked'` or `'unchecked'` for a GFM task item. */
  task: 'checked' | 'unchecked' | null
}

export interface MarkdownListBlock extends MarkdownSourceRange {
  kind: 'list'
  ordered: boolean
  /** First number of an ordered list, `1` for bullets. */
  startNumber: number
  /** A tight list renders its item content without paragraph wrappers. */
  tight: boolean
  items: MarkdownListItem[]
}

export interface MarkdownTableBlock extends MarkdownSourceRange {
  kind: 'table'
  align: MarkdownTableAlign[]
  header: MarkdownInline[][]
  rows: MarkdownInline[][][]
}

export interface MarkdownRuleBlock extends MarkdownSourceRange {
  kind: 'rule'
}

export interface MarkdownMathBlock extends MarkdownSourceRange {
  kind: 'math'
  value: string
}

export interface MarkdownFootnoteBlock extends MarkdownSourceRange {
  kind: 'footnote'
  id: string
  inline: MarkdownInline[]
}

export type MarkdownBlock
  = | MarkdownHeadingBlock
    | MarkdownParagraphBlock
    | MarkdownCodeBlock
    | MarkdownBlockquoteBlock
    | MarkdownListBlock
    | MarkdownTableBlock
    | MarkdownRuleBlock
    | MarkdownMathBlock
    | MarkdownFootnoteBlock

export type MarkdownInline
  = | { kind: 'text', value: string }
    | { kind: 'strong', children: MarkdownInline[] }
    | { kind: 'emphasis', children: MarkdownInline[] }
    | { kind: 'del', children: MarkdownInline[] }
    | { kind: 'code', value: string }
    | { kind: 'link', href: string, title?: string, children: MarkdownInline[] }
    | { kind: 'image', src: string, title?: string, alt: string }
    | { kind: 'math', value: string }
    | { kind: 'footnote-ref', id: string }
    | { kind: 'break', hard: boolean }

/** Props the shell passes to a registered code fence renderer. */
export interface MarkdownCodeProps {
  language: string
  code: string
  streaming?: boolean
  /** The closing fence has arrived, or the source is final, so it can no longer change. */
  complete?: boolean
}

/** Props the shell passes to a registered math renderer. */
export interface MarkdownMathProps {
  value: string
  display: boolean
  streaming?: boolean
}

/**
 * Capability map of the shell. A node with no registered renderer falls back to
 * its literal source, so the optional items compose without the base one
 * knowing them.
 */
export interface MarkdownComponents {
  code?: ComponentType<MarkdownCodeProps>
  math?: ComponentType<MarkdownMathProps>
  /** Fence renderers keyed by info-string language; falls back to `code`. */
  fences?: Record<string, ComponentType<MarkdownCodeProps>>
}

export interface MarkdownCache {
  /** The normalized source the cache was built from. */
  readonly source: string
  readonly blocks: readonly MarkdownBlock[]
}

// ---------------------------------------------------------------------------
// Lines
// ---------------------------------------------------------------------------

interface SourceLine {
  text: string
  start: number
  end: number
  /** Whether the line is followed by a newline, so more input cannot change it. */
  hasNewline: boolean
}

function normalizeNewlines(source: string): string {
  return source.replace(/\r\n?/g, '\n')
}

function scanLines(source: string): SourceLine[] {
  const lines: SourceLine[] = []
  let start = 0

  for (let index = 0; index < source.length; index++) {
    if (source[index] !== '\n') {
      continue
    }

    lines.push({
      text: source.slice(start, index),
      start,
      end: index + 1,
      hasNewline: true,
    })
    start = index + 1
  }

  if (start < source.length) {
    lines.push({
      text: source.slice(start),
      start,
      end: source.length,
      hasNewline: false,
    })
  }

  return lines
}

function isBlank(text: string): boolean {
  return !/\S/.test(text)
}

function indentOf(text: string): number {
  return text.length - text.trimStart().length
}

function stripIndent(text: string, width: number): string {
  let removed = 0

  while (removed < width && (text[removed] === ' ' || text[removed] === '\t')) {
    removed++
  }

  return text.slice(removed)
}

// ---------------------------------------------------------------------------
// Block matchers
// ---------------------------------------------------------------------------

const fencePattern = /^ {0,3}(`{3,}|~{3,})/
const closingFencePattern = /^ {0,3}(`{3,}|~{3,})[ \t]*$/
const atxHeadingPattern = /^ {0,3}(#{1,6})(?:\s|$)(.*)$/
const thematicBreakPattern = /^ {0,3}(?:(?:\*\s*){3,}|(?:-\s*){3,}|(?:_\s*){3,})$/
const setextUnderlinePattern = /^ {0,3}(=+|-+)\s*$/
const blockquotePattern = /^ {0,3}> ?(.*)$/
const listItemPattern = /^ {0,3}([-*+]|\d{1,9}[.)])([ \t]+)/
const footnotePattern = /^ {0,3}\[\^([^\]\s]+)\]:[ \t]?(.*)$/
const mathOpenPattern = /^ {0,3}\$\$(.*)$/
const htmlTagPattern = /^ {0,3}<[a-z/!]/i

interface FenceMatch {
  marker: string
  size: number
  info: string
}

function matchFence(text: string): FenceMatch | null {
  const match = fencePattern.exec(text)

  if (!match) {
    return null
  }

  const marker = match[1]
  // The info string is whatever follows the marker on the same line.
  const info = text.slice(match[0].length)

  // A backtick info string may not contain a backtick, otherwise it is a code
  // span in a paragraph.
  if (marker[0] === '`' && info.includes('`')) {
    return null
  }

  return {
    marker: marker[0],
    size: marker.length,
    info: info.trim(),
  }
}

function isClosingFence(text: string, fence: FenceMatch): boolean {
  const match = closingFencePattern.exec(text)

  return Boolean(
    match
    && match[1][0] === fence.marker
    && match[1].length >= fence.size,
  )
}

interface HeadingMatch {
  level: MarkdownHeadingLevel
  text: string
}

function matchAtxHeading(text: string): HeadingMatch | null {
  const match = atxHeadingPattern.exec(text)

  if (!match) {
    return null
  }

  return {
    level: match[1].length as MarkdownHeadingLevel,
    text: match[2].replace(/\s+#+\s*$/, '').trim(),
  }
}

function matchSetextUnderline(text: string): MarkdownHeadingLevel | null {
  const match = setextUnderlinePattern.exec(text)

  if (!match) {
    return null
  }

  return match[1][0] === '='
    ? 1
    : 2
}

function matchListItem(text: string): ListItemMatch | null {
  const match = listItemPattern.exec(text)

  if (!match) {
    return null
  }

  const indent = text.length - text.trimStart().length
  const marker = match[1]
  const spaces = match[2].length
  const rest = text.slice(match[0].length)
  const ordered = /\d/.test(marker[0])
  // Five or more spaces after the marker belong to the content, not the hanging
  // indent.
  const contentIndent = spaces > 4
    ? indent + marker.length + 1
    : indent + marker.length + spaces

  return {
    indent,
    ordered,
    number: ordered
      ? Number.parseInt(marker, 10)
      : 1,
    contentIndent,
    content: spaces > 4
      ? stripIndent(rest, spaces - 1)
      : rest,
  }
}

interface ListItemMatch {
  indent: number
  ordered: boolean
  number: number
  contentIndent: number
  content: string
}

function matchFootnoteDefinition(text: string): { id: string, text: string } | null {
  const match = footnotePattern.exec(text)

  if (!match) {
    return null
  }

  return { id: match[1], text: match[2] }
}

function matchMathOpen(text: string): string | null {
  const match = mathOpenPattern.exec(text)

  return match ? match[1] : null
}

function isTableStart(lines: SourceLine[], index: number): boolean {
  const header = lines[index]

  if (!header || !header.text.includes('|')) {
    return false
  }

  const delimiter = lines[index + 1]

  return Boolean(delimiter && matchTableDelimiter(delimiter.text))
}

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

function splitTableRow(text: string): string[] {
  let row = text.trim()

  if (row.startsWith('|')) {
    row = row.slice(1)
  }

  if (row.endsWith('|') && !row.endsWith('\\|')) {
    row = row.slice(0, -1)
  }

  const cells: string[] = []
  let buffer = ''

  for (let index = 0; index < row.length; index++) {
    const char = row[index]

    if (char === '\\' && row[index + 1] === '|') {
      buffer += '|'
      index++
      continue
    }

    if (char === '|') {
      cells.push(buffer)
      buffer = ''
      continue
    }

    buffer += char
  }

  cells.push(buffer)

  return cells.map(cell => cell.trim())
}

function matchTableDelimiter(text: string): MarkdownTableAlign[] | null {
  if (!text.includes('-')) {
    return null
  }

  const cells = splitTableRow(text)

  if (cells.length === 0) {
    return null
  }

  const align: MarkdownTableAlign[] = []

  for (const cell of cells) {
    if (!/^:?-+:?$/.test(cell)) {
      return null
    }

    align.push(
      cell.startsWith(':') && cell.endsWith(':')
        ? 'center'
        : cell.endsWith(':')
          ? 'right'
          : cell.startsWith(':')
            ? 'left'
            : null,
    )
  }

  return align
}

// ---------------------------------------------------------------------------
// Inline parsing
// ---------------------------------------------------------------------------

const escapedPunctuation = new Set('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'.split(''))

const namedEntities: Record<string, string> = {
  amp: '&',
  apos: '\'',
  copy: '©',
  gt: '>',
  hellip: '…',
  laquo: '«',
  lt: '<',
  mdash: '—',
  nbsp: '\u00A0',
  ndash: '–',
  quot: '"',
  raquo: '»',
  reg: '®',
  trade: '™',
}

const entityPattern = /^&(?:#(\d{1,7})|#x([\da-f]{1,6})|([a-z][a-z\d]{1,31}));/i
const autolinkPattern = /^<([a-z][a-z\d+.-]{1,31}:[^\s<>]*)>/i
const emailAutolinkPattern = /^<([^\s<>@]+@[^\s<>@][^\s.<>@]*\.[^\s<>@]+)>/
const bareAutolinkPattern = /^(?:https?:\/\/|www\.)[^\s<>"'`]+/

function isWordCharacter(char: string | undefined): boolean {
  return Boolean(char && /[\p{L}\p{N}]/u.test(char))
}

/** Drops the backslash of a punctuation escape, so `a\)b` links to `a)b`. */
function unescapeDestination(value: string): string {
  let result = ''

  for (let index = 0; index < value.length; index++) {
    const next = value[index + 1]

    if (value[index] === '\\' && next && escapedPunctuation.has(next)) {
      result += next
      index++
      continue
    }

    result += value[index]
  }

  return result
}

// For a link, only schemes that cannot execute script are accepted. Model output
// is untrusted, and the renderer never touches the href before the DOM.
const safeSchemePattern = /^(?:https?:|mailto:|tel:)/i

/** Drops the control characters a link cannot carry, keeping tabs out of the href. */
function stripControlCharacters(value: string): string {
  let result = ''

  for (const character of value) {
    const code = character.charCodeAt(0)

    if (code > 0x1F && code !== 0x7F) {
      result += character
    }
  }

  return result
}

export function sanitizeHref(href: string): string | null {
  const value = stripControlCharacters(href.trim())

  if (value === '') {
    return ''
  }

  if (value.startsWith('#') || value.startsWith('/') || value.startsWith('./') || value.startsWith('../')) {
    return value
  }

  // A colon after a scheme is an absolute URL, and only the schemes that cannot
  // run script are accepted. Everything else stays relative.
  const scheme = /^[a-z][a-z\d+.-]*:/i.exec(value)

  if (!scheme) {
    return value
  }

  return safeSchemePattern.test(value)
    ? value
    : null
}

function decodeEntity(match: RegExpExecArray): string | null {
  if (match[1]) {
    const codePoint = Number.parseInt(match[1], 10)

    return codePoint > 0 && codePoint <= 0x10FFFF
      ? String.fromCodePoint(codePoint)
      : null
  }

  if (match[2]) {
    const codePoint = Number.parseInt(match[2], 16)

    return codePoint > 0 && codePoint <= 0x10FFFF
      ? String.fromCodePoint(codePoint)
      : null
  }

  return namedEntities[match[3]] ?? null
}

function codeSpanRun(text: string, index: number): number {
  let size = 0

  while (text[index + size] === '`') {
    size++
  }

  return size
}

function findCodeSpanEnd(text: string, from: number, size: number): number {
  for (let index = from; index < text.length; index++) {
    if (text[index] !== '`') {
      continue
    }

    const run = codeSpanRun(text, index)

    if (run === size) {
      return index
    }

    index += run - 1
  }

  return -1
}

function codeSpanContent(raw: string): string {
  const content = raw.replace(/\n/g, ' ')

  return content.startsWith(' ') && content.endsWith(' ') && /\S/.test(content)
    ? content.slice(1, -1)
    : content
}

function findClosingRun(text: string, from: number, marker: string, size: number): number {
  for (let index = from; index < text.length; index++) {
    const char = text[index]

    if (char === '\\') {
      index++
      continue
    }

    if (char === '`') {
      const run = codeSpanRun(text, index)
      const end = findCodeSpanEnd(text, index + run, run)

      if (end >= 0) {
        index = end + run - 1
        continue
      }

      index += run - 1
      continue
    }

    if (char !== marker) {
      continue
    }

    let run = 1

    while (text[index + run] === marker) {
      run++
    }

    if (run === size) {
      // `snake_case` is not emphasis: an underscore run only closes a word.
      if (marker === '_' && isWordCharacter(text[index + run])) {
        index += run - 1
        continue
      }

      return index
    }

    index += run - 1
  }

  return -1
}

function findClosingBracket(text: string, from: number): number {
  let depth = 0

  for (let index = from; index < text.length; index++) {
    const char = text[index]

    if (char === '\\') {
      index++
      continue
    }

    if (char === '`') {
      const run = codeSpanRun(text, index)
      const end = findCodeSpanEnd(text, index + run, run)

      if (end >= 0) {
        index = end + run - 1
        continue
      }

      index += run - 1
      continue
    }

    if (char === '[') {
      depth++
      continue
    }

    if (char === ']') {
      depth--
      if (depth === 0) {
        return index
      }
    }
  }

  return -1
}

interface LinkDestination {
  href: string
  title?: string
  next: number
}

function parseLinkDestination(text: string, from: number): LinkDestination | null {
  let index = from

  while (text[index] === ' ' || text[index] === '\t') {
    index++
  }

  let href = ''

  if (text[index] === '<') {
    const end = text.indexOf('>', index + 1)

    if (end < 0) {
      return null
    }

    href = text.slice(index + 1, end)
    index = end + 1
  }
  else {
    const start = index
    let depth = 0

    while (index < text.length) {
      const char = text[index]

      if (char === '\\') {
        index += 2
        continue
      }

      if (char === '(') {
        depth++
      }
      else if (char === ')') {
        if (depth === 0) {
          break
        }
        depth--
      }
      else if (char === ' ' || char === '\t') {
        break
      }

      index++
    }

    href = text.slice(start, index)
  }

  href = unescapeDestination(href)

  while (text[index] === ' ' || text[index] === '\t') {
    index++
  }

  let title: string | undefined

  if (text[index] === '"' || text[index] === '\'' || text[index] === '(') {
    const closing = text[index] === '('
      ? ')'
      : text[index]
    const end = text.indexOf(closing, index + 1)

    if (end < 0) {
      return null
    }

    title = text.slice(index + 1, end)
    index = end + 1

    while (text[index] === ' ' || text[index] === '\t') {
      index++
    }
  }

  if (text[index] !== ')') {
    return null
  }

  const safe = sanitizeHref(href)

  return safe === null
    ? null
    : { href: safe, title, next: index + 1 }
}

function parseLinkAt(text: string, index: number): { node: MarkdownInline, next: number } | null {
  const image = text[index] === '!'
  const open = image
    ? index + 1
    : index

  if (text[open] !== '[') {
    return null
  }

  const close = findClosingBracket(text, open)

  if (close < 0) {
    return null
  }

  const label = text.slice(open + 1, close)
  const following = text[close + 1]

  if (following !== '(') {
    if (!image && label.startsWith('^') && /^\^[^\s\]]+$/.test(label)) {
      return {
        node: {
          kind: 'footnote-ref',
          id: label.slice(1),
        },
        next: close + 1,
      }
    }

    return null
  }

  const destination = parseLinkDestination(text, close + 2)

  if (!destination) {
    return null
  }

  if (image) {
    return {
      node: {
        kind: 'image',
        src: destination.href,
        title: destination.title,
        alt: label,
      },
      next: destination.next,
    }
  }

  return {
    node: {
      kind: 'link',
      href: destination.href,
      title: destination.title,
      children: parseInline(label),
    },
    next: destination.next,
  }
}

/**
 * Length of the literal run to consume when a link-like construct has a closed
 * label and an open destination that never closes before the end of its line.
 * Keeping the whole run as text is what stops a streaming document from showing
 * `[label](https://…` as a label and a half-read autolink.
 */
function unterminatedLinkRun(text: string, index: number): number {
  const open = text[index] === '!'
    ? index + 1
    : index

  if (text[open] !== '[') {
    return -1
  }

  const close = findClosingBracket(text, open)

  if (close < 0 || text[close + 1] !== '(') {
    return -1
  }

  const lineEnd = text.indexOf('\n', close + 2)
  const end = lineEnd < 0
    ? text.length
    : lineEnd

  return text.slice(close + 2, end).includes(')')
    ? -1
    : end
}

function parseAutolinkAt(text: string, index: number): { node: MarkdownInline, next: number } | null {
  const rest = text.slice(index)
  const inline = autolinkPattern.exec(rest) ?? emailAutolinkPattern.exec(rest)

  if (inline) {
    const href = inline[1].includes('@') && !/^[a-z][a-z\d+.-]*:/i.test(inline[1])
      ? `mailto:${inline[1]}`
      : inline[1]

    return {
      node: {
        kind: 'link',
        href: sanitizeHref(href) ?? inline[1],
        children: [
          { kind: 'text', value: inline[1] },
        ],
      },
      next: index + inline[0].length,
    }
  }

  return null
}

function parseBareAutolinkAt(text: string, index: number): { node: MarkdownInline, next: number } | null {
  if (index > 0 && isWordCharacter(text[index - 1])) {
    return null
  }

  const match = bareAutolinkPattern.exec(text.slice(index))

  if (!match) {
    return null
  }

  const value = match[0].replace(/[.,;:!?)\]'"*_~]+$/, '')

  if (value.length < 5) {
    return null
  }

  const href = value.startsWith('www.')
    ? `https://${value}`
    : value

  return {
    node: {
      kind: 'link',
      href: sanitizeHref(href) ?? value,
      children: [
        { kind: 'text', value },
      ],
    },
    next: index + value.length,
  }
}

function parseEmphasisAt(text: string, index: number): { node: MarkdownInline, next: number } | null {
  const marker = text[index]

  if (marker !== '*' && marker !== '_' && marker !== '~') {
    return null
  }

  let size = 0

  while (text[index + size] === marker) {
    size++
  }

  if (marker === '~' && size !== 2) {
    return null
  }

  if (marker !== '~' && size > 3) {
    return null
  }

  if (marker === '_' && isWordCharacter(text[index - 1])) {
    return null
  }

  const close = findClosingRun(text, index + size, marker, size)

  if (close < 0) {
    return null
  }

  const children = parseInline(text.slice(index + size, close))
  const node: MarkdownInline
    = marker === '~'
      ? { kind: 'del', children }
      : size === 1
        ? { kind: 'emphasis', children }
        : size === 2
          ? { kind: 'strong', children }
          : {
              kind: 'strong',
              children: [
                { kind: 'emphasis', children },
              ],
            }

  return { node, next: close + size }
}

function parseMathAt(text: string, index: number): { node: MarkdownInline, next: number } | null {
  if (text[index] !== '$') {
    return null
  }

  for (let end = index + 1; end < text.length; end++) {
    if (text[end] === '\\') {
      end++
      continue
    }

    if (text[end] !== '$') {
      continue
    }

    const value = text.slice(index + 1, end)

    if (value === '' || /\s/.test(value[0]) || /\s$/.test(value)) {
      return null
    }

    return {
      node: { kind: 'math', value },
      next: end + 1,
    }
  }

  return null
}

function hasHardBreakBefore(text: string, index: number): boolean {
  return index >= 2 && text[index - 1] === ' ' && text[index - 2] === ' '
}

/**
 * Parses the inline content of a block. Unbalanced markers stay literal text,
 * which is what keeps a streaming document from rendering a mark the model has
 * not closed yet.
 */
export function parseInline(source: string): MarkdownInline[] {
  const nodes: MarkdownInline[] = []
  let buffer = ''
  let index = 0

  const flush = () => {
    if (buffer !== '') {
      nodes.push({ kind: 'text', value: buffer })
      buffer = ''
    }
  }

  while (index < source.length) {
    const char = source[index]

    if (char === '\\') {
      const next = source[index + 1]

      if (next === '\n') {
        flush()
        nodes.push({ kind: 'break', hard: true })
        index += 2
        continue
      }

      if (next && escapedPunctuation.has(next)) {
        buffer += next
        index += 2
        continue
      }

      buffer += char
      index++
      continue
    }

    if (char === '`') {
      const size = codeSpanRun(source, index)
      const end = findCodeSpanEnd(source, index + size, size)

      if (end >= 0) {
        flush()
        nodes.push({
          kind: 'code',
          value: codeSpanContent(source.slice(index + size, end)),
        })
        index = end + size
        continue
      }

      buffer += source.slice(index, index + size)
      index += size
      continue
    }

    if (char === '!' || char === '[') {
      const link = parseLinkAt(source, index)

      if (link) {
        flush()
        nodes.push(link.node)
        index = link.next
        continue
      }

      const literalEnd = unterminatedLinkRun(source, index)

      if (literalEnd > index) {
        buffer += source.slice(index, literalEnd)
        index = literalEnd
        continue
      }

      buffer += char
      index++
      continue
    }

    if (char === '<') {
      const autolink = parseAutolinkAt(source, index)

      if (autolink) {
        flush()
        nodes.push(autolink.node)
        index = autolink.next
        continue
      }

      buffer += char
      index++
      continue
    }

    if (char === '*' || char === '_' || char === '~') {
      const emphasis = parseEmphasisAt(source, index)

      if (emphasis) {
        flush()
        nodes.push(emphasis.node)
        index = emphasis.next
        continue
      }

      buffer += char
      index++
      continue
    }

    if (char === '$') {
      const math = parseMathAt(source, index)

      if (math) {
        flush()
        nodes.push(math.node)
        index = math.next
        continue
      }

      buffer += char
      index++
      continue
    }

    if (char === '&') {
      const match = entityPattern.exec(source.slice(index))
      const decoded = match
        ? decodeEntity(match)
        : null

      if (match && decoded !== null) {
        buffer += decoded
        index += match[0].length
        continue
      }

      buffer += char
      index++
      continue
    }

    if (char === 'h' || char === 'w') {
      const autolink = parseBareAutolinkAt(source, index)

      if (autolink) {
        flush()
        nodes.push(autolink.node)
        index = autolink.next
        continue
      }
    }

    if (char === '\n') {
      const hard = hasHardBreakBefore(source, index)
      buffer = buffer.replace(/ +$/, '')
      flush()
      nodes.push({ kind: 'break', hard })
      index++
      continue
    }

    buffer += char
    index++
  }

  flush()

  return nodes
}

// ---------------------------------------------------------------------------
// Block parsing
// ---------------------------------------------------------------------------

interface ParsedBlock {
  block: MarkdownBlock
  next: number
}

type BlockKind
  = | 'fence'
    | 'heading'
    | 'rule'
    | 'quote'
    | 'list'
    | 'footnote'
    | 'math'
    | 'table'
    | 'html'
    | 'paragraph'

function detectBlockKind(lines: SourceLine[], index: number): BlockKind {
  const text = lines[index].text

  if (matchFence(text)) {
    return 'fence'
  }

  if (matchAtxHeading(text)) {
    return 'heading'
  }

  if (thematicBreakPattern.test(text)) {
    return 'rule'
  }

  if (blockquotePattern.test(text)) {
    return 'quote'
  }

  if (matchListItem(text)) {
    return 'list'
  }

  if (matchFootnoteDefinition(text)) {
    return 'footnote'
  }

  if (matchMathOpen(text) !== null) {
    return 'math'
  }

  if (isTableStart(lines, index)) {
    return 'table'
  }

  if (htmlTagPattern.test(text)) {
    return 'html'
  }

  return 'paragraph'
}

function rangeOf(lines: SourceLine[], from: number, to: number, terminated: boolean): MarkdownSourceRange {
  const last = lines[to - 1]

  return {
    start: lines[from].start,
    end: last ? last.end : lines[from].start,
    terminated,
  }
}

function parseFence(lines: SourceLine[], index: number): ParsedBlock {
  const fence = matchFence(lines[index].text)!
  const content: string[] = []
  let cursor = index + 1
  let closed = false

  while (cursor < lines.length) {
    const line = lines[cursor]

    if (isClosingFence(line.text, fence)) {
      // A closing fence without a newline can still turn into the info string of
      // a longer fence, so it does not terminate the block yet.
      closed = line.hasNewline
      cursor++
      break
    }

    content.push(line.text)
    cursor++
  }

  const language = fence.info.split(/\s+/)[0] ?? ''

  return {
    block: {
      kind: 'code',
      language,
      code: content.join('\n'),
      ...rangeOf(lines, index, cursor, closed),
    },
    next: cursor,
  }
}

function parseHeading(lines: SourceLine[], index: number): ParsedBlock {
  const heading = matchAtxHeading(lines[index].text)!

  return {
    block: {
      kind: 'heading',
      level: heading.level,
      inline: parseInline(heading.text),
      ...rangeOf(lines, index, index + 1, lines[index].hasNewline),
    },
    next: index + 1,
  }
}

function parseRule(lines: SourceLine[], index: number): ParsedBlock {
  return {
    block: {
      kind: 'rule',
      ...rangeOf(lines, index, index + 1, lines[index].hasNewline),
    },
    next: index + 1,
  }
}

function parseBlockquote(lines: SourceLine[], index: number): ParsedBlock {
  const content: string[] = []
  let cursor = index

  while (cursor < lines.length) {
    const line = lines[cursor]
    const quoted = blockquotePattern.exec(line.text)

    if (quoted) {
      content.push(quoted[1])
      cursor++
      continue
    }

    // Lazy continuation: a plain line still belongs to the quote, a blank line
    // or a new block does not.
    if (isBlank(line.text) || detectBlockKind(lines, cursor) !== 'paragraph') {
      break
    }

    content.push(line.text)
    cursor++
  }

  // A following line that is not part of the quote terminates it. Running out of
  // input does not: the next token may still carry another quoted line.
  const terminated = cursor < lines.length

  return {
    block: {
      kind: 'blockquote',
      children: parseBlocks(scanLines(content.join('\n'))),
      ...rangeOf(lines, index, cursor, terminated),
    },
    next: cursor,
  }
}

function parseList(lines: SourceLine[], index: number): ParsedBlock {
  const first = matchListItem(lines[index].text)!
  const ordered = first.ordered
  const startNumber = first.number
  const items: MarkdownListItem[] = []
  let tight = true
  let current: string[] = []
  let currentIndent = first.contentIndent
  let cursor = index
  // A list followed only by blank lines is still open: a later token may add
  // another item, so the block cannot be reused yet.
  let openAtEnd = false

  const pushItem = () => {
    if (current.length === 0) {
      return
    }

    const taskMatch = /^\[([ x])\][ \t]+/i.exec(current[0])
    const body = taskMatch
      ? [
          current[0].slice(taskMatch[0].length),
          ...current.slice(1),
        ]
      : current

    items.push({
      children: parseBlocks(scanLines(body.join('\n'))),
      task: taskMatch
        ? taskMatch[1] === ' '
          ? 'unchecked'
          : 'checked'
        : null,
    })
    current = []
  }

  while (cursor < lines.length) {
    const line = lines[cursor]
    const item = matchListItem(line.text)

    if (isBlank(line.text)) {
      const following = nextNonBlank(lines, cursor)

      if (following === null) {
        openAtEnd = true
        break
      }

      const followingItem = matchListItem(lines[following].text)
      const followingIndent = indentOf(lines[following].text)

      if (followingIndent >= currentIndent || (followingItem && followingItem.indent <= first.indent + 1)) {
        // A blank line between items or inside an item makes the list loose.
        tight = false
        current.push('')
        cursor++
        continue
      }

      break
    }

    if (item && item.indent <= first.indent + 1) {
      if (item.ordered !== ordered) {
        break
      }

      pushItem()
      currentIndent = item.contentIndent
      current.push(item.content)
      cursor++
      continue
    }

    if (indentOf(line.text) >= currentIndent) {
      current.push(stripIndent(line.text, currentIndent))
      cursor++
      continue
    }

    // Lazy continuation of the current item's paragraph.
    if (detectBlockKind(lines, cursor) === 'paragraph') {
      current.push(line.text.trim())
      cursor++
      continue
    }

    break
  }

  pushItem()

  return {
    block: {
      kind: 'list',
      ordered,
      startNumber,
      tight,
      items,
      // Running out of input while the list still accepts lines is exactly the
      // streaming case: the list is re-parsed on the next token.
      ...rangeOf(lines, index, cursor, !openAtEnd && cursor < lines.length),
    },
    next: cursor,
  }
}

function nextNonBlank(lines: SourceLine[], index: number): number | null {
  for (let cursor = index + 1; cursor < lines.length; cursor++) {
    if (!isBlank(lines[cursor].text)) {
      return cursor
    }
  }

  return null
}

function parseTable(lines: SourceLine[], index: number): ParsedBlock {
  const align = matchTableDelimiter(lines[index + 1].text)!
  const width = align.length
  const header = normalizeRow(splitTableRow(lines[index].text), width)
  const rows: MarkdownInline[][][] = []
  let cursor = index + 2

  while (cursor < lines.length) {
    const line = lines[cursor]

    if (isBlank(line.text) || !line.text.includes('|')) {
      break
    }

    const kind = detectBlockKind(lines, cursor)

    if (kind !== 'paragraph' && kind !== 'table') {
      break
    }

    rows.push(normalizeRow(splitTableRow(line.text), width).map(cell => parseInline(cell)))
    cursor++
  }

  // Rows are append-only: a table only ends when a line that is not a row
  // follows. Ending at the end of the input would be undone by the next token.
  const terminated = cursor < lines.length

  return {
    block: {
      kind: 'table',
      align,
      header: header.map(cell => parseInline(cell)),
      rows,
      ...rangeOf(lines, index, cursor, terminated),
    },
    next: cursor,
  }
}

function normalizeRow(cells: string[], width: number): string[] {
  const row = cells.slice(0, width)

  while (row.length < width) {
    row.push('')
  }

  return row
}

function parseFootnote(lines: SourceLine[], index: number): ParsedBlock {
  const definition = matchFootnoteDefinition(lines[index].text)!
  const content = [definition.text]
  let cursor = index + 1

  while (cursor < lines.length) {
    const line = lines[cursor]

    if (isBlank(line.text)) {
      cursor++
      return {
        block: {
          kind: 'footnote',
          id: definition.id,
          inline: parseInline(content.join('\n').trim()),
          ...rangeOf(lines, index, cursor, true),
        },
        next: cursor,
      }
    }

    if (indentOf(line.text) >= 2) {
      content.push(line.text.trim())
      cursor++
      continue
    }

    if (detectBlockKind(lines, cursor) === 'paragraph') {
      content.push(line.text.trim())
      cursor++
      continue
    }

    break
  }

  return {
    block: {
      kind: 'footnote',
      id: definition.id,
      inline: parseInline(content.join('\n').trim()),
      ...rangeOf(lines, index, cursor, cursor < lines.length),
    },
    next: cursor,
  }
}

function parseMath(lines: SourceLine[], index: number): ParsedBlock {
  const rest = matchMathOpen(lines[index].text)!
  const inlineEnd = rest.indexOf('$$')

  if (inlineEnd >= 0 && !rest.slice(0, inlineEnd).includes('$')) {
    return {
      block: {
        kind: 'math',
        value: rest.slice(0, inlineEnd).trim(),
        ...rangeOf(lines, index, index + 1, lines[index].hasNewline),
      },
      next: index + 1,
    }
  }

  const content = rest.trim() === ''
    ? []
    : [rest]
  let cursor = index + 1
  let closed = false

  while (cursor < lines.length) {
    const line = lines[cursor]

    if (isBlank(line.text)) {
      break
    }

    const end = line.text.indexOf('$$')

    if (end >= 0 && !line.text.slice(0, end).includes('$')) {
      content.push(line.text.slice(0, end))
      cursor++
      closed = line.hasNewline
      break
    }

    content.push(line.text)
    cursor++
  }

  return {
    block: {
      kind: 'math',
      value: content.join('\n').trim(),
      ...rangeOf(lines, index, cursor, closed),
    },
    next: cursor,
  }
}

function parseHtmlBlock(lines: SourceLine[], index: number): ParsedBlock {
  // Raw HTML is never rendered: the block is kept as text so the source stays
  // visible and no consumer can inject markup through model output.
  const content: string[] = []
  let cursor = index

  while (cursor < lines.length && !isBlank(lines[cursor].text)) {
    content.push(lines[cursor].text)
    cursor++
  }

  return {
    block: {
      kind: 'paragraph',
      inline: [
        {
          kind: 'text',
          value: content.join('\n'),
        },
      ],
      ...rangeOf(lines, index, cursor, cursor < lines.length),
    },
    next: cursor,
  }
}

function parseParagraph(lines: SourceLine[], index: number): ParsedBlock {
  const content: string[] = []
  let cursor = index

  while (cursor < lines.length) {
    const line = lines[cursor]

    if (isBlank(line.text)) {
      return paragraphResult(lines, index, cursor, content, true, null)
    }

    if (content.length > 0) {
      const underline = matchSetextUnderline(line.text)

      // A setext underline turns the paragraph above it into a heading, which is
      // why it is checked before the block-start lookahead. Without a newline the
      // line could still grow into one (`---` into `-----`), so the paragraph
      // stays open and is re-parsed when the token completes it.
      if (underline !== null) {
        return line.hasNewline
          ? paragraphResult(lines, index, cursor + 1, content, true, underline)
          : paragraphResult(lines, index, cursor, content, false, null)
      }

      if (detectBlockKind(lines, cursor) !== 'paragraph') {
        return paragraphResult(lines, index, cursor, content, true, null)
      }
    }

    content.push(line.text)
    cursor++
  }

  return paragraphResult(lines, index, cursor, content, false, null)
}

function paragraphResult(
  lines: SourceLine[],
  index: number,
  next: number,
  content: string[],
  terminated: boolean,
  headingLevel: MarkdownHeadingLevel | null,
): ParsedBlock {
  const inline = parseInline(content.join('\n').replace(/\n+$/, ''))

  if (headingLevel !== null) {
    return {
      block: {
        kind: 'heading',
        level: headingLevel,
        inline,
        ...rangeOf(lines, index, next, terminated),
      },
      next,
    }
  }

  return {
    block: {
      kind: 'paragraph',
      inline,
      ...rangeOf(lines, index, next, terminated),
    },
    next,
  }
}

function parseBlock(lines: SourceLine[], index: number): ParsedBlock {
  switch (detectBlockKind(lines, index)) {
    case 'fence':
      return parseFence(lines, index)
    case 'heading':
      return parseHeading(lines, index)
    case 'rule':
      return parseRule(lines, index)
    case 'quote':
      return parseBlockquote(lines, index)
    case 'list':
      return parseList(lines, index)
    case 'footnote':
      return parseFootnote(lines, index)
    case 'math':
      return parseMath(lines, index)
    case 'table':
      return parseTable(lines, index)
    case 'html':
      return parseHtmlBlock(lines, index)
    case 'paragraph':
      return parseParagraph(lines, index)
  }
}

function parseBlocks(lines: SourceLine[]): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = []
  let index = 0

  while (index < lines.length) {
    if (isBlank(lines[index].text)) {
      index++
      continue
    }

    const parsed = parseBlock(lines, index)
    blocks.push(parsed.block)
    index = parsed.next
  }

  return blocks
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

/** Parses a complete document. */
export function parseMarkdown(source: string): MarkdownCache {
  const normalized = normalizeNewlines(source)

  return {
    source: normalized,
    blocks: parseBlocks(scanLines(normalized)),
  }
}

/**
 * Parses a document that grew since the last call.
 *
 * When the new source extends the cached one, every terminated block that ends
 * inside the previous source is reused by identity and only the open tail is
 * re-parsed. Editing the source in place (not an extension) falls back to a
 * full parse.
 */
export function extendMarkdown(previous: MarkdownCache | undefined, source: string): MarkdownCache {
  if (!previous) {
    return parseMarkdown(source)
  }

  const normalized = normalizeNewlines(source)

  if (normalized === previous.source) {
    return previous
  }

  if (!normalized.startsWith(previous.source)) {
    return parseMarkdown(normalized)
  }

  let kept = 0

  for (let index = 0; index < previous.blocks.length; index++) {
    const block = previous.blocks[index]

    if (block.terminated && block.end <= previous.source.length) {
      kept = index + 1
    }
  }

  const from = kept > 0
    ? previous.blocks[kept - 1].end
    : 0

  if (from === 0) {
    return parseMarkdown(normalized)
  }

  const lines = scanLines(normalized)
  const lineIndex = lines.findIndex(line => line.start === from)

  if (lineIndex < 0) {
    return parseMarkdown(normalized)
  }

  return {
    source: normalized,
    blocks: [
      ...previous.blocks.slice(0, kept),
      ...parseBlocks(lines.slice(lineIndex)),
    ],
  }
}
