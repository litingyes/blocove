import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

// Renamed and removed items leave stale JSON in `public/r`, and a production
// build copies `public/` into the output. Clear the generated artifacts before
// every registry build so the deployed site only serves current items.
const targets = [
  path.join(process.cwd(), 'public', 'r'),
  path.join(process.cwd(), 'src', 'generated', 'registry.json'),
]

for (const target of targets) {
  fs.rmSync(target, { recursive: true, force: true })
}

console.log('Cleared the generated registry artifacts.')
