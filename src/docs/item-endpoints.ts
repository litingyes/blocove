import type { DocsKind } from '@/lib/registry-catalog'
import { getDocsPage } from '@/docs/pages'
import { buildPageMarkdown } from '@/lib/docs-markdown'
import { docsKindOfItem, docsMarkdownPath } from '@/lib/registry-catalog'
import { registryItemsByName } from '@/lib/registry-data'

const markdownHeaders = {
  'content-type': 'text/plain; charset=utf-8',
  'cache-control':
    'public, max-age=0, s-maxage=600, stale-while-revalidate=86400',
  'x-content-type-options': 'nosniff',
}

function textResponse(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: markdownHeaders,
  })
}

function redirectResponse(location: string) {
  return new Response(null, {
    status: 308,
    headers: {
      ...markdownHeaders,
      location,
    },
  })
}

/**
 * The plain-markdown form of an item page: exactly what Copy Page copies. It
 * answers `/components/<name>.md` and `/blocks/<name>.md`, permanently
 * redirects a request that guessed the wrong section, and 404s an unknown item.
 */
export function itemMarkdownResponse(kind: DocsKind, name: string): Response {
  const item = registryItemsByName.get(name)

  if (!item) {
    return textResponse(`No registry item named "${name}".\n`, 404)
  }

  const itemKind = docsKindOfItem(item)

  if (itemKind !== kind) {
    return redirectResponse(docsMarkdownPath(itemKind, name))
  }

  return textResponse(buildPageMarkdown(item, getDocsPage(item.name)))
}

/**
 * `/items/<name>.md` used to be the markdown form of every item page. Item
 * pages now live under their section, so the old address answers with a
 * permanent redirect instead of a second copy of the same content.
 */
export function legacyItemMarkdownResponse(name: string): Response {
  const item = registryItemsByName.get(name)

  if (!item) {
    return textResponse(`No registry item named "${name}".\n`, 404)
  }

  return redirectResponse(docsMarkdownPath(docsKindOfItem(item), name))
}
