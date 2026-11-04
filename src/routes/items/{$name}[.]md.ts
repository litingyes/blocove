import type { RegistryCatalog } from '@/lib/registry-catalog'

import { createFileRoute } from '@tanstack/react-router'
import { getDocsPage } from '@/docs/pages'
import catalogJson from '@/generated/registry.json'
import { buildPageMarkdown } from '@/lib/docs-markdown'

// The `.md` suffix is escaped with `[.]` so it stays part of the segment: this
// route answers `/items/<name>.md`, while `/items/<name>` still renders the
// docs page. The suffix sorts before the bare `$name` param, so a request for
// `rich-text-editor.md` never renders the item page.
const catalog = catalogJson as unknown as RegistryCatalog
const itemsByName = new Map(catalog.items.map(item => [item.name, item]))

const markdownHeaders = {
  'content-type': 'text/plain; charset=utf-8',
  'cache-control':
    'public, max-age=0, s-maxage=600, stale-while-revalidate=86400',
  'x-content-type-options': 'nosniff',
}

/**
 * Raw markdown for an item page. The body is exactly what the Copy Page action
 * copies into the clipboard, so `/items/<name>.md` is the shareable, machine
 * readable form of the page.
 */
export const Route = createFileRoute('/items/{$name}.md')({
  server: {
    handlers: {
      GET: ({ params }) => {
        const item = itemsByName.get(params.name)

        if (!item) {
          return new Response(`No registry item named "${params.name}".\n`, {
            status: 404,
            headers: markdownHeaders,
          })
        }

        return new Response(buildPageMarkdown(item, getDocsPage(item.name)), {
          headers: markdownHeaders,
        })
      },
    },
  },
})
