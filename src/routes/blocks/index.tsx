import { createFileRoute } from '@tanstack/react-router'
import { DocsCatalog } from '@/components/docs/docs-catalog'
import { registryCatalog } from '@/lib/registry-data'

export const Route = createFileRoute('/blocks/')({
  component: BlocksIndex,
  head: () => ({
    meta: [
      { title: 'Blocks – Blocove' },
      {
        name: 'description',
        content:
          'Complete Blocove blocks: rich text and code editors, the media heroes, showcases, episodes and playlists, and the image stories composed from the components.',
      },
    ],
  }),
})

function BlocksIndex() {
  return <DocsCatalog kind="blocks" catalog={registryCatalog} />
}
