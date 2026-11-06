import { createFileRoute, redirect } from '@tanstack/react-router'
import { docsKindOfItem } from '@/lib/registry-catalog'
import { registryItemsByName } from '@/lib/registry-data'

/**
 * Compatibility route for the old item addresses. Item pages moved under
 * `/components` and `/blocks`, so an old link answers with a permanent redirect
 * to the section that owns the item. An unknown name lands on the components
 * lookup, which renders the "item not found" state.
 */
export const Route = createFileRoute('/items/$name')({
  beforeLoad: ({ params }) => {
    const item = registryItemsByName.get(params.name)

    if (item && docsKindOfItem(item) === 'blocks') {
      throw redirect({
        to: '/blocks/$name',
        params: { name: params.name },
        statusCode: 308,
      })
    }

    throw redirect({
      to: '/components/$name',
      params: { name: params.name },
      statusCode: 308,
    })
  },
})
