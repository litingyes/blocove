import type { RegistryCatalog, RegistryItem } from '@/lib/registry-catalog'
import { Link, useRouterState } from '@tanstack/react-router'
import { cn } from 'cn'
import { MenuIcon } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { docsNav } from '@/docs/nav'

function DocsNav({ catalog }: { catalog: RegistryCatalog }) {
  const pathname = useRouterState({
    select: state => state.location.pathname,
  })
  const items = new Map(catalog.items.map(item => [item.name, item]))

  // Sections group families (Rich Text Editor, Code Editor, ...); each family
  // keeps its own subgroups so a new family only adds a section.
  const sections = docsNav
    .map(section => ({
      label: section.label,
      groups: section.groups
        .map(group => ({
          label: group.label,
          items: group.items
            .map(name => items.get(name))
            .filter((item): item is RegistryItem => Boolean(item)),
        }))
        .filter(group => group.items.length > 0),
    }))
    .filter(section => section.groups.length > 0)

  return (
    <nav aria-label="Documentation" className="flex flex-col gap-6">
      {sections.map(section => (
        <div key={section.label} className="flex flex-col gap-1.5">
          <p className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {section.label}
          </p>
          {section.groups.map(group => (
            <div
              key={group.label ?? 'items'}
              className="flex flex-col gap-0.5"
            >
              {group.label
                ? (
                    <p className="px-2 pt-1 text-[11px] font-medium text-muted-foreground/80">
                      {group.label}
                    </p>
                  )
                : null}
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = pathname === `/items/${item.name}`

                  return (
                    <li key={item.name}>
                      <Link
                        to="/items/$name"
                        params={{ name: item.name }}
                        className={cn(
                          'block rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                          active && 'bg-muted font-medium text-foreground',
                        )}
                      >
                        {item.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </nav>
  )
}

export function DocsSidebar({ catalog }: { catalog: RegistryCatalog }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-y-auto py-8 pr-4">
        <DocsNav catalog={catalog} />
      </div>
    </aside>
  )
}

export function MobileDocsNav({ catalog }: { catalog: RegistryCatalog }) {
  return (
    <Sheet>
      <SheetTrigger className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted lg:hidden">
        <MenuIcon className="size-4" />
        Menu
      </SheetTrigger>
      <SheetContent side="left" className="w-72 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Documentation</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
          <DocsNav catalog={catalog} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
