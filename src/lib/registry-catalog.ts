export interface RegistryFile {
  path: string
  type: string
  target: string | null
}

export interface RegistryItem {
  name: string
  type: string
  title: string
  description: string
  dependencies: string[]
  registryDependencies: string[]
  categories: string[]
  files: RegistryFile[]
}

export interface RegistryCatalog {
  name: string
  homepage: string
  items: RegistryItem[]
}

export const itemTypeOrder = [
  "registry:base",
  "registry:ui",
  "registry:block",
  "registry:theme",
  "registry:lib",
  "registry:hook",
] as const

export const itemTypeLabels: Record<string, string> = {
  "registry:base": "Base",
  "registry:ui": "UI",
  "registry:block": "Blocks",
  "registry:theme": "Theme",
  "registry:lib": "Lib",
  "registry:hook": "Hooks",
}

export function groupItemsByType(items: RegistryItem[]) {
  const groups = new Map<string, RegistryItem[]>()

  for (const type of itemTypeOrder) {
    const group = items.filter((item) => item.type === type)
    if (group.length > 0) {
      groups.set(type, group)
    }
  }

  const other = items.filter(
    (item) =>
      !itemTypeOrder.includes(item.type as (typeof itemTypeOrder)[number])
  )
  if (other.length > 0) {
    groups.set("other", other)
  }

  return groups
}
