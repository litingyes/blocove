export const packageManagers = ['pnpm', 'npm', 'yarn', 'bun'] as const

export type PackageManager = (typeof packageManagers)[number]

export function itemAddress(name: string) {
  return `litingyes/blocove/${name}`
}

export function namespaceAddress(name: string) {
  return `@blocove/${name}`
}

export function addCommand(
  packageManager: PackageManager,
  address: string,
): string {
  switch (packageManager) {
    case 'pnpm':
      return `pnpm dlx shadcn@latest add ${address}`
    case 'npm':
      return `npx shadcn@latest add ${address}`
    case 'yarn':
      return `yarn dlx shadcn@latest add ${address}`
    case 'bun':
      return `bunx --bun shadcn@latest add ${address}`
  }
}

export function installCommand(
  packageManager: PackageManager,
  packages: string[],
): string {
  const list = packages.join(' ')

  if (!list) {
    return ''
  }

  switch (packageManager) {
    case 'pnpm':
      return `pnpm add ${list}`
    case 'npm':
      return `npm install ${list}`
    case 'yarn':
      return `yarn add ${list}`
    case 'bun':
      return `bun add ${list}`
  }
}
