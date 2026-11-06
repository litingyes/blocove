import { createFileRoute } from '@tanstack/react-router'
import { DocsCatalog } from '@/components/docs/docs-catalog'
import { registryCatalog } from '@/lib/registry-data'

export const Route = createFileRoute('/components/')({
  component: ComponentsIndex,
  head: () => ({
    meta: [
      { title: 'Components – Blocove' },
      {
        name: 'description',
        content:
          'The installable pieces of Blocove: rich text editor nodes and marks, code editor extensions and the media players, each one a registry item you own.',
      },
    ],
  }),
})

function ComponentsIndex() {
  return <DocsCatalog kind="components" catalog={registryCatalog} />
}
