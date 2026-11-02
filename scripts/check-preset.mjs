import { execFileSync } from 'node:child_process'
import process from 'node:process'

const command = process.platform === 'win32'
  ? 'pnpm.cmd'
  : 'pnpm'

let resolved
try {
  resolved = JSON.parse(
    execFileSync(command, [
      'exec',
      'shadcn',
      'preset',
      'resolve',
      '--json',
    ], {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }),
  )
}
catch (error) {
  console.error('Failed to resolve the project preset.')
  console.error(error instanceof Error
    ? error.message
    : String(error))
  process.exit(1)
}

const fallbacks = resolved?.fallbacks ?? []

if (resolved?.code !== 'b0' || fallbacks.length > 0) {
  console.error(
    `Expected the b0 preset, got ${resolved?.code ?? 'nothing'}${
      fallbacks.length > 0
        ? ` (fallbacks: ${fallbacks.join(', ')})`
        : ''
    }.`,
  )
  process.exit(1)
}

console.log('Project preset is b0.')
