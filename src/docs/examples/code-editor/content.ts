// Demo documents for the code editor docs. Kept in one module so every page
// shows the same content and the snippet builder stays in sync.
export const codeEditorDemoContent = {
  typescript: `type User = {
  name: string
  role: 'admin' | 'member'
}

export function greeting(user: User) {
  const label = user.role === 'admin' ? 'Admin' : 'Member'

  return \`Hello, \${user.name}! You are an \${label}.\`
}

console.log(greeting({ name: 'Ada', role: 'admin' }))
`,
}

// A pair of documents for the diff demo: three changed chunks with a stable
// block in between, so the view shows chunk navigation, the line counts and
// the collapsed unchanged run.
export const codeEditorDiffDemoContent = {
  original: `export interface FilterOptions {
  query: string
  limit?: number
}

const defaultLimit = 20

/** Keep only the item titles that match the query. */
export function normalize(value: string) {
  return value.trim().toLowerCase()
}

export function filterItems<T extends { title: string }>(
  items: T[],
  { query, limit = defaultLimit }: FilterOptions,
) {
  const needle = normalize(query)

  return items
    .filter(item => normalize(item.title).includes(needle))
    .slice(0, limit)
}
`,
  modified: `export interface FilterOptions {
  query: string
  limit?: number
  caseSensitive?: boolean
}

const defaultLimit = 20

/** Keep only the item titles that match the query. */
export function normalize(value: string, caseSensitive = false) {
  return caseSensitive ? value.trim() : value.trim().toLowerCase()
}

export function filterItems<T extends { title: string }>(
  items: T[],
  { query, limit = defaultLimit, caseSensitive = false }: FilterOptions,
) {
  const needle = normalize(query, caseSensitive)

  return items
    .filter(item => normalize(item.title).includes(needle))
    .slice(0, limit)
}
`,
}
