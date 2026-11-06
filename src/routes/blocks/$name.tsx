import { createFileRoute, redirect } from '@tanstack/react-router'
import { DocsItemPage } from '@/components/docs/item-page'
import { itemPageHead } from '@/docs/item-head'
import { docsKindOfItem } from '@/lib/registry-catalog'
import { registryItemsByName } from '@/lib/registry-data'

export const Route = createFileRoute('/blocks/$name')({
  // A component requested under /blocks belongs to the components tree; answer
  // with its canonical page instead of rendering two URLs for one document.
  beforeLoad: ({ params }) => {
    const item = registryItemsByName.get(params.name)

    if (item && docsKindOfItem(item) !== 'blocks') {
      throw redirect({
        to: '/components/$name',
        params: { name: params.name },
        statusCode: 308,
      })
    }
  },
  component: BlocksItemPage,
  head: ({ params }) => itemPageHead('blocks', params.name),
})

function BlocksItemPage() {
  const { name } = Route.useParams()

  return <DocsItemPage kind="blocks" name={name} />
}
