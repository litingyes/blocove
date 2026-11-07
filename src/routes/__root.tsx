import type { ReactNode } from 'react'
import {
  createRootRoute,
  HeadContent,
  Link,
  Scripts,
} from '@tanstack/react-router'
import { BrandLogo } from '@/components/brand-logo'
import { ThemeCustomizer } from '@/components/docs/theme-customizer'
import { ThemeProvider } from '@/components/docs/theme-provider'
import { ThemeToggle } from '@/components/docs/theme-toggle'
import { themeBootScript } from '@/lib/theme-boot'

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
        title: 'Blocove — composable building blocks for shadcn/ui',
      },
      {
        name: 'description',
        content:
          'Composable building blocks for shadcn/ui. A registry of rich text, code editor and media items that extend shadcn/ui instead of replacing it.',
      },
      {
        name: 'theme-color',
        content: '#191a19',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        sizes: 'any',
        href: '/favicon.svg',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
    ],
    // Replays the persisted theme onto <html> before first paint, so a dark or
    // customised visit never flashes the default palette.
    scripts: [
      {
        children: themeBootScript,
      },
    ],
  }),
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

function NotFound() {
  return (
    <div className="flex flex-col items-start gap-3 py-24">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">404</h1>
      <p className="text-muted-foreground">
        The page you are looking for does not exist.
      </p>
      <Link to="/" className="text-sm underline-offset-4 hover:underline">
        Back to the registry
      </Link>
    </div>
  )
}

/**
 * One header destination. The two catalogs are separate route trees, so the
 * typed link needs its own literal per section; only the styling and the active
 * marker are shared.
 */
function HeaderNavLink({
  to,
  children,
}: {
  to: 'components' | 'blocks'
  children: ReactNode
}) {
  const className
    = 'rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[status=active]:bg-muted/60 data-[status=active]:text-foreground'

  if (to === 'components') {
    return (
      <Link to="/components" className={className} activeProps={{ 'aria-current': 'page' }}>
        {children}
      </Link>
    )
  }

  return (
    <Link to="/blocks" className={className} activeProps={{ 'aria-current': 'page' }}>
      {children}
    </Link>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    // The boot script sets the theme class and the inline tokens before
    // hydration, so the element intentionally differs from the server markup.
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-svh bg-background text-foreground antialiased">
        <ThemeProvider>
          <div className="flex min-h-svh w-full flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
              <div className="mx-auto flex h-16 w-full max-w-[96rem] items-center gap-3 px-4 sm:gap-4 sm:px-6">
                <Link
                  to="/"
                  aria-label="Blocove home"
                  className="inline-flex shrink-0 items-center"
                >
                  <BrandLogo className="h-9 w-auto" />
                </Link>
                {/* The two catalogs are siblings, so they get sibling navs
                    instead of one mixed list. */}
                <nav
                  aria-label="Catalog"
                  className="flex items-center gap-0.5 sm:gap-1"
                >
                  <HeaderNavLink to="components">Components</HeaderNavLink>
                  <HeaderNavLink to="blocks">Blocks</HeaderNavLink>
                </nav>
                <div className="ms-auto flex items-center gap-1 text-sm text-muted-foreground">
                  <a
                    href="https://github.com/litingyes/blocove"
                    target="_blank"
                    rel="noreferrer"
                    className="hidden px-1.5 transition-colors hover:text-foreground sm:inline"
                  >
                    GitHub
                  </a>
                  <span
                    aria-hidden="true"
                    className="mx-1 hidden h-4 w-px bg-border sm:block"
                  />
                  <ThemeToggle />
                  <ThemeCustomizer />
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t">
              <div className="mx-auto flex w-full max-w-[96rem] flex-wrap items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:px-6">
                <span>
                  Requires shadcn/ui, then add items with
                  {' '}
                  <code className="rounded bg-muted px-1 py-0.5">
                    npx shadcn@latest add litingyes/blocove/&lt;item&gt;
                  </code>
                </span>
                <div className="flex items-center gap-4">
                  <a
                    href="https://ui.shadcn.com/docs/registry"
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-foreground"
                  >
                    shadcn registry docs
                  </a>
                  <a
                    href="/media/CREDITS.md"
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-foreground"
                  >
                    Sample media: NASA
                  </a>
                  <span>MIT License</span>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
