import type { ReactNode } from 'react'
import type { DocsKind } from '@/lib/registry-catalog'
import { Link } from '@tanstack/react-router'

export type ItemLinkProps = {
  /** Section the item is documented in. */
  kind: DocsKind
  /** Registry item name. */
  name: string
  children: ReactNode
  className?: string
  /** Anchor inside the target page, without the leading `#`. */
  hash?: string
  title?: string
} & {
  'aria-label'?: string
  'aria-current'?: 'page'
}

/**
 * Link to an item's docs page. Components and blocks live in two typed route
 * trees, so the link component picks the route before it hands the item name
 * to the router; callers only know the kind.
 */
export function ItemLink({ kind, name, ...props }: ItemLinkProps) {
  if (kind === 'blocks') {
    return <Link to="/blocks/$name" params={{ name }} {...props} />
  }

  return <Link to="/components/$name" params={{ name }} {...props} />
}
