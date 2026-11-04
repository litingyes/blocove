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

// A pair of documents for the diff demo: a changed signature and a changed
// constant, so the view shows two separate chunks with context in between.
export const codeEditorDiffDemoContent = {
  original: `export function greeting(name: string) {
  return \`Hello, \${name}!\`
}

export const separator = ' — '

greeting('Blocove')
`,
  modified: `export function greeting(name: string, salutation = 'Hello') {
  return \`\${salutation}, \${name}!\`
}

export const separator = ' | '

greeting('Blocove', 'Hi')
`,
}
