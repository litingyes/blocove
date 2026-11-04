// Demo sources import registry files by their real repository path. The docs
// site shows the same code with the paths consumers get after installation.
const replacements: Array<[string, string]> = [
  ['@/registry/blocove/ui/rich-text-editor/', '@/components/ui/rich-text-editor/'],
]

export function toConsumerSource(source: string) {
  return replacements.reduce(
    (code, [from, to]) => code.split(from).join(to),
    source,
  )
}
