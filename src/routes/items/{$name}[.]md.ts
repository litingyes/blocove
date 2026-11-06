import { createFileRoute } from '@tanstack/react-router'
import { legacyItemMarkdownResponse } from '@/docs/item-endpoints'

/**
 * Compatibility route for the old markdown addresses. The markdown now lives
 * next to the page it mirrors, so `/items/<name>.md` answers with a permanent
 * redirect to `/components/<name>.md` or `/blocks/<name>.md`.
 */
export const Route = createFileRoute('/items/{$name}.md')({
  server: {
    handlers: {
      GET: ({ params }) => legacyItemMarkdownResponse(params.name),
    },
  },
})
