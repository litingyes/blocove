import type { DocsPage } from '@/docs/types'

interface DocsPageModule {
  docsPage?: DocsPage
}

// Every page module exports `docsPage`; adding a documented item means adding a
// file, nothing else. `index.ts` matches the glob as well and is skipped below.
const modules = import.meta.glob('./**/*.{ts,tsx}', {
  eager: true,
}) as Record<string, DocsPageModule>

const docsPages = new Map<string, DocsPage>()

for (const [path, module] of Object.entries(modules)) {
  if (path === './index.ts') {
    continue
  }

  const page = module.docsPage

  if (!page) {
    continue
  }

  if (docsPages.has(page.item)) {
    console.warn(
      `[blocove/docs] Duplicate page for "${page.item}" in ${path}, keeping the first one.`,
    )
    continue
  }

  docsPages.set(page.item, page)
}

export function getDocsPage(name: string) {
  return docsPages.get(name)
}
