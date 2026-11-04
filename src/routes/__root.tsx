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
        <div className="flex min-h-svh w-full flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
            <div className="mx-auto flex h-16 w-full max-w-[96rem] items-center justify-between px-4 sm:px-6">
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
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t">
            <div className="mx-auto flex w-full max-w-[96rem] flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:px-6">
              <span>
                Requires shadcn/ui with the b0 preset, then add items with
                {' '}
                <code className="rounded bg-muted px-1 py-0.5">
                  npx shadcn@latest add litingyes/folio/&lt;item&gt;
                </code>
              </span>
              <span>MIT License</span>
            </div>
          </footer>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
