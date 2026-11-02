import type { ReactNode } from 'react'
import {
  createRootRoute,
  HeadContent,
  Link,
  Scripts,
} from '@tanstack/react-router'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Folio Registry',
      },
      {
        name: 'description',
        content:
          'A shadcn/ui extension registry: Folio blocks and tokens layered on top of shadcn/ui.',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function NotFound() {
  return (
    <div className="flex flex-col items-start gap-3 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">404</h1>
      <p className="text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Link to="/" className="text-sm underline-offset-4 hover:underline">
        Back to the registry
      </Link>
    </div>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-svh bg-background text-foreground antialiased">
        <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-6">
          <header className="flex h-16 items-center justify-between border-b">
            <Link to="/" className="text-sm font-semibold tracking-tight">
              Folio Registry
            </Link>
            <nav className="flex items-center gap-5 text-sm text-muted-foreground">
              <a
                href="https://ui.shadcn.com/docs/registry"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-foreground"
              >
                Docs
              </a>
              <a
                href="https://github.com/litingyes/folio"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-foreground"
              >
                GitHub
              </a>
            </nav>
          </header>
          <main className="flex-1 py-12">{children}</main>
          <footer className="flex flex-wrap items-center justify-between gap-2 border-t py-6 text-xs text-muted-foreground">
            <span>
              Requires shadcn/ui with the b0 preset, then add items with
              {' '}
              <code className="rounded bg-muted px-1 py-0.5">
                npx shadcn@latest add litingyes/folio/&lt;item&gt;
              </code>
            </span>
            <span>MIT License</span>
          </footer>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
