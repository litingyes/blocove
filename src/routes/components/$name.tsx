import { createFileRoute, redirect } from '@tanstack/react-router'
import { DocsItemPage } from '@/components/docs/item-page'
import { itemPageHead } from '@/docs/item-head'
import { docsKindOfItem } from '@/lib/registry-catalog'
import { registryItemsByName } from '@/lib/registry-data'

export const Route = createFileRoute('/components/$name')({
  // A block requested under /components belongs to the blocks tree; answer with
  // its canonical page instead of rendering two URLs for one document.
  beforeLoad: ({ params }) => {
    const item = registryItemsByName.get(params.name)

    if (item && docsKindOfItem(item) !== 'components') {
      throw redirect({
        to: '/blocks/$name',
        params: { name: params.name },
        statusCode: 308,
      })
    }
  },
  component: ComponentsItemPage,
  head: ({ params }) => itemPageHead('components', params.name),
})

function ComponentsItemPage() {
  const { name } = Route.useParams()

  return <DocsItemPage kind="components" name={name} />
}
