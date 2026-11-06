import type { DocsKind } from '@/lib/registry-catalog'
import { Link } from '@tanstack/react-router'
import { getDocsNeighbors } from '@/docs/nav'
import { getDocsPage } from '@/docs/pages'
import { registryCatalog, registryItemsByName } from '@/lib/registry-data'
import { DocsPage } from './docs-page'
import { DocsSidebar } from './docs-sidebar'

export interface DocsItemPageProps {
  /** Section the page is rendered under: components or blocks. */
  kind: DocsKind
  /** Registry item name from the route. */
  name: string
}

/**
 * One registry item's docs page, shared by the components and the blocks route
 * tree. The sidebar, the previous/next controls and the markdown link all stay
 * inside the page's kind, so the two catalogs never mix.
 */
export function DocsItemPage({ kind, name }: DocsItemPageProps) {
  const item = registryItemsByName.get(name)

  if (!item) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-3 px-4 py-24 sm:px-6">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Item not found
        </h1>
        <p className="text-muted-foreground">
          No registry item named
          {' '}
          <code className="font-mono">{name}</code>
          .
        </p>
        {kind === 'blocks'
          ? (
              <Link to="/blocks" className="text-sm underline-offset-4 hover:underline">
                Back to the blocks
              </Link>
            )
          : (
              <Link to="/components" className="text-sm underline-offset-4 hover:underline">
                Back to the components
              </Link>
            )}
      </div>
    )
  }

  const data = getDocsPage(name)
  const neighbors = getDocsNeighbors(kind, name)

  return (
    <div className="mx-auto w-full max-w-[96rem] px-4 sm:px-6 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8">
      <DocsSidebar catalog={registryCatalog} kind={kind} />
      <DocsPage
        kind={kind}
        catalog={registryCatalog}
        item={item}
        data={data}
        previous={neighbors.previous
          ? registryItemsByName.get(neighbors.previous)
          : undefined}
        next={neighbors.next
          ? registryItemsByName.get(neighbors.next)
          : undefined}
      />
    </div>
  )
}
