import type { DocsKind } from '@/lib/registry-catalog'
import { docsMarkdownPath } from '@/lib/registry-catalog'
import { registryItemsByName } from '@/lib/registry-data'

/**
 * Document head of an item page: the title, the description and the alternate
 * link to the markdown form. Shared by the components and the blocks route so
 * the two trees stay identical.
 */
export function itemPageHead(kind: DocsKind, name: string) {
  const item = registryItemsByName.get(name)

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
    links: item
      ? [
          {
            rel: 'alternate',
            type: 'text/markdown',
            href: docsMarkdownPath(kind, name),
          },
        ]
      : [],
  }
}
