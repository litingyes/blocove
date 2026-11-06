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
          'Complete Blocove blocks: a rich text editor playground, a code editor playground, and the media heroes, showcases, episodes and playlists composed from the players.',
      },
    ],
  }),
})

function BlocksIndex() {
  return <DocsCatalog kind="blocks" catalog={registryCatalog} />
}
