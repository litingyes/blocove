// Reads the registry sources at build time so the manual installation steps and
// code previews show the exact files the CLI installs.
const sourceModules = import.meta.glob('../registry/blocove/**/*.{ts,tsx}', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const prefix = '../registry/blocove/'

export function getRegistrySource(path: string) {
  return sourceModules[`${prefix}${path}`]
}
