import type { RegistryCatalog } from '@/lib/registry-catalog'

import { createFileRoute, Link } from '@tanstack/react-router'
import { DocsPage } from '@/components/docs/docs-page'
import { DocsSidebar } from '@/components/docs/docs-sidebar'
import { getDocsNeighbors } from '@/docs/nav'
import { getDocsPage } from '@/docs/pages'
import catalogJson from '@/generated/registry.json'

const catalog = catalogJson as unknown as RegistryCatalog
const itemsByName = new Map(catalog.items.map(item => [item.name, item]))

export const Route = createFileRoute('/items/$name')({
  component: ItemPage,
  head: ({ params }) => {
    const item = itemsByName.get(params.name)

    return {
      meta: [
        {
          title: item
            ? `${item.title} – Blocove Registry`
            : 'Item not found – Blocove Registry',
        },
        ...(item
          ? [
              { name: 'description', content: item.description },
            ]
          : []),
      ],
    }
  },
})

function ItemPage() {
  const { name } = Route.useParams()
  const item = itemsByName.get(name)

  if (!item) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-3 px-4 py-24 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Item not found
        </h1>
        <p className="text-muted-foreground">
          No registry item named
          {' '}
          <code className="font-mono">{name}</code>
          .
        </p>
        <Link to="/" className="text-sm underline-offset-4 hover:underline">
          Back to the registry
        </Link>
      </div>
    )
  }

  const data = getDocsPage(name)
  const neighbors = getDocsNeighbors(name)

  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 sm:px-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
      <DocsSidebar catalog={catalog} />
      <DocsPage
        catalog={catalog}
        item={item}
        data={data}
        previous={
          neighbors.previous
            ? itemsByName.get(neighbors.previous)
            : undefined
        }
        next={neighbors.next
          ? itemsByName.get(neighbors.next)
          : undefined}
      />
    </div>
  )
}
