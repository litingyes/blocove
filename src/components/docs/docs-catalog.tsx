import type { DocsFamily } from '@/docs/nav'
import type { DocsKind, RegistryCatalog, RegistryItem } from '@/lib/registry-catalog'
import { Link } from '@tanstack/react-router'
import { ArrowRightIcon, ArrowUpRightIcon } from 'lucide-react'
import { docsFamilies, docsNav } from '@/docs/nav'
import { addCommand, itemAddress } from '@/lib/docs-commands'
import { CopyButton } from './copy-button'
import { ItemLink } from './item-link'

interface CatalogGroup {
  label?: string
  items: RegistryItem[]
}

interface CatalogSection {
  family: DocsFamily
  label: string
  description: string
  groups: CatalogGroup[]
}

export interface DocsCatalogProps {
  /** Which catalog to render: the components or the blocks. */
  kind: DocsKind
  catalog: RegistryCatalog
}

/**
 * The `/components` and `/blocks` catalogs. Both read the same navigation data
 * as the docs sidebar, so a page is listed exactly where the sidebar puts it and
 * a new family only has to be added to `docsNav`.
 */
export function DocsCatalog({ kind, catalog }: DocsCatalogProps) {
  const isBlocks = kind === 'blocks'
  const items = new Map(catalog.items.map(item => [item.name, item]))

  const sections: CatalogSection[] = docsNav[kind]
    .map(section => ({
      family: section.family,
      label: docsFamilies[section.family].label,
      description: docsFamilies[section.family].description,
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

  const total = sections.reduce(
    (count, section) =>
      count + section.groups.reduce((sum, group) => sum + group.items.length, 0),
    0,
  )

  return (
    <div
      data-slot="docs-catalog"
      data-kind={kind}
      className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-4 py-12 sm:px-6"
    >
      <header className="flex flex-col gap-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {isBlocks
            ? 'Blocks'
            : 'Components'}
        </p>
        <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {isBlocks
            ? 'Complete blocks, installed as one item.'
            : 'The pieces every block is composed from.'}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          {isBlocks
            ? 'A block is a finished surface: install it and the CLI also brings the components it composes. Start here when you want a working screen rather than a part.'
            : 'A component is one installable piece: an editor shell, a node, a mark or an extension. Browse them here and compose your own surface, or start from a block.'}
        </p>
        <p className="text-sm text-muted-foreground">
          {total}
          {' '}
          {isBlocks
            ? 'blocks'
            : 'components'}
          {' '}
          across
          {' '}
          {sections.length}
          {' '}
          families
        </p>
      </header>

      {sections.map(section => (
        <section
          key={section.family}
          id={section.family}
          className="flex scroll-mt-24 flex-col gap-6"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <h2 className="font-heading text-2xl font-semibold tracking-tight">
                {section.label}
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {section.description}
              </p>
            </div>
            {isBlocks
              ? (
                  <Link
                    to="/components"
                    hash={section.family}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Browse the components
                    <ArrowRightIcon className="size-3.5" />
                  </Link>
                )
              : (
                  <Link
                    to="/blocks"
                    hash={section.family}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    See the blocks
                    <ArrowRightIcon className="size-3.5" />
                  </Link>
                )}
          </div>

          {section.groups.map(group => (
            <div
              key={group.label ?? 'items'}
              className="flex flex-col gap-3"
            >
              {group.label
                ? (
                    <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {group.label}
                    </h3>
                  )
                : null}
              {isBlocks
                ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                      {group.items.map(item => (
                        <BlockCard key={item.name} item={item} />
                      ))}
                    </div>
                  )
                : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {group.items.map(item => (
                        <ComponentCard key={item.name} item={item} />
                      ))}
                    </div>
                  )}
            </div>
          ))}
        </section>
      ))}

      <section className="flex flex-col gap-2 rounded-xl border border-dashed bg-muted/30 p-5">
        <p className="font-heading text-base font-semibold">
          {isBlocks
            ? 'Need a smaller piece?'
            : 'Want the complete composition?'}
        </p>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {isBlocks
            ? 'Every block is composed from components you can install on their own, so you can keep the one control you need and leave the rest out.'
            : 'Blocks compose these components into a finished surface, installed as a single file you own.'}
        </p>
        {isBlocks
          ? (
              <Link
                to="/components"
                className="inline-flex w-fit items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
              >
                Browse the components
                <ArrowRightIcon className="size-3.5" />
              </Link>
            )
          : (
              <Link
                to="/blocks"
                className="inline-flex w-fit items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
              >
                Browse the blocks
                <ArrowRightIcon className="size-3.5" />
              </Link>
            )}
      </section>
    </div>
  )
}

function ComponentCard({ item }: { item: RegistryItem }) {
  return (
    <ItemLink
      kind="components"
      name={item.name}
      className="group flex flex-col gap-1.5 rounded-lg border p-4 transition-colors hover:bg-muted/50"
    >
      <span className="flex items-center justify-between gap-2 font-medium">
        {item.title}
        <ArrowUpRightIcon className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
      <span className="line-clamp-2 text-sm text-muted-foreground">
        {item.description}
      </span>
      <code className="mt-auto pt-1 font-mono text-[11px] text-muted-foreground/80">
        {item.name}
      </code>
    </ItemLink>
  )
}

function BlockCard({ item }: { item: RegistryItem }) {
  const command = addCommand('npm', itemAddress(item.name))

  return (
    <div
      data-slot="docs-catalog-block"
      className="flex flex-col gap-3 rounded-xl border p-5 transition-colors hover:bg-muted/40"
    >
      <ItemLink
        kind="blocks"
        name={item.name}
        className="group flex items-center justify-between gap-2 font-heading text-lg font-semibold tracking-tight"
      >
        {item.title}
        <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </ItemLink>
      <p className="text-sm text-muted-foreground">
        {item.description}
      </p>
      <div className="mt-auto flex items-center gap-2 rounded-md bg-muted px-2.5 py-1.5">
        <code className="min-w-0 flex-1 truncate font-mono text-xs">
          {command}
        </code>
        <CopyButton
          value={command}
          label="Copy install command"
          variant="ghost"
          size="icon-xs"
        />
      </div>
    </div>
  )
}
