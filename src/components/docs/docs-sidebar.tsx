import type { DocsKind, RegistryCatalog, RegistryItem } from '@/lib/registry-catalog'
import { useRouterState } from '@tanstack/react-router'
import { cn } from 'cn'
import { MenuIcon } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { docsFamilies, docsNav } from '@/docs/nav'
import { docsItemPath } from '@/lib/registry-catalog'
import { ItemLink } from './item-link'

function DocsNav({
  catalog,
  kind,
}: {
  catalog: RegistryCatalog
  kind: DocsKind
}) {
  const pathname = useRouterState({
    select: state => state.location.pathname,
  })
  const items = new Map(catalog.items.map(item => [item.name, item]))
  const isCurrent = (name: string) => pathname === docsItemPath(kind, name)

  // Sections group families (Rich Text Editor, Code Editor, ...); each family
  // keeps its own subgroups so a new family only adds a section. Only the
  // page's kind is listed: a component page never links a block, and the way
  // back to the other catalog is the header. A family's `entry` (its shell) is
  // folded into the heading link instead of repeating the name in the list.
  const sections = docsNav[kind]
    .map((section) => {
      const entry = section.entry
        ? items.get(section.entry)
        : undefined

      return {
        family: section.family,
        label: docsFamilies[section.family].label,
        entry,
        groups: section.groups
          .map(group => ({
            label: group.label,
            items: group.items
              .map(name => items.get(name))
              .filter((item): item is RegistryItem => Boolean(item))
              .filter(item => item.name !== entry?.name),
          }))
          .filter(group => group.items.length > 0),
      }
    })
    .filter(section => section.groups.length > 0 || Boolean(section.entry))

  return (
    <nav
      aria-label={kind === 'blocks'
        ? 'Block documentation'
        : 'Component documentation'}
      className="flex flex-col gap-6"
    >
      {sections.map(section => (
        <div key={section.family} className="flex flex-col gap-1.5">
          {section.entry
            ? (
                <ItemLink
                  kind={kind}
                  name={section.entry.name}
                  aria-current={
                    isCurrent(section.entry.name)
                      ? 'page'
                      : undefined
                  }
                  className={cn(
                    'block rounded-md px-2 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase transition-colors hover:bg-muted/60 hover:text-foreground',
                    isCurrent(section.entry.name) && 'text-foreground',
                  )}
                >
                  {section.label}
                </ItemLink>
              )
            : (
                <p className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {section.label}
                </p>
              )}
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
                  const active = isCurrent(item.name)

                  return (
                    <li key={item.name}>
                      <ItemLink
                        kind={kind}
                        name={item.name}
                        className={cn(
                          'block rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                          active && 'bg-muted font-medium text-foreground',
                        )}
                      >
                        {item.title}
                      </ItemLink>
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

export function DocsSidebar({
  catalog,
  kind,
}: {
  catalog: RegistryCatalog
  kind: DocsKind
}) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-y-auto py-8 pr-4">
        <DocsNav catalog={catalog} kind={kind} />
      </div>
    </aside>
  )
}

export function MobileDocsNav({
  catalog,
  kind,
}: {
  catalog: RegistryCatalog
  kind: DocsKind
}) {
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
          <DocsNav catalog={catalog} kind={kind} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
