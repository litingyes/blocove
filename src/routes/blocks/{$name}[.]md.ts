import { createFileRoute } from '@tanstack/react-router'
import { itemMarkdownResponse } from '@/docs/item-endpoints'

/**
 * Plain-markdown form of a block page, for Copy Page and for tooling.
 * `/items/<name>.md` permanently redirects here, so this is the canonical
 * address of the markdown.
 */
export const Route = createFileRoute('/blocks/{$name}.md')({
  server: {
    handlers: {
      GET: ({ params }) => itemMarkdownResponse('blocks', params.name),
    },
  },
})
