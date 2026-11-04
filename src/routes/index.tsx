import type { RegistryCatalog, RegistryItem } from '@/lib/registry-catalog'

import { createFileRoute, Link } from '@tanstack/react-router'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import catalogJson from '@/generated/registry.json'
import { groupItemsByType, itemTypeLabels } from '@/lib/registry-catalog'

const catalog = catalogJson as unknown as RegistryCatalog
const groups = groupItemsByType(
  catalog.items.filter(item => !item.categories.includes('internal')),
)

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-4 py-12 sm:px-6">
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <span className="w-fit rounded-full border px-3 py-1 text-xs text-muted-foreground">
            shadcn/ui extension
          </span>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight">
            Blocove extensions for shadcn/ui.
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Blocove extends shadcn/ui for specific scenarios. It is not a
            replacement: install shadcn/ui first with the b0 preset, then add
            the rich text editor, blocks and components that Blocove ships as
            source code you own.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <CommandCard
            title="1. Set up shadcn/ui"
            command="npx shadcn@latest init --preset b0"
            note="Blocove defaults to the b0 preset."
          />
          <CommandCard
            title="2. Install from GitHub"
            command="npx shadcn@latest add litingyes/blocove/base"
            note="No registry configuration required."
          />
          <CommandCard
            title="3. Install by namespace"
            command="npx shadcn@latest add @blocove/base"
            note="After adding the @blocove registry to components.json."
          />
        </div>
      </section>

      {[
        ...groups.entries(),
      ].map(([type, items]) => (
        <section key={type} className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              {itemTypeLabels[type] ?? type}
            </h2>
            <span className="text-xs text-muted-foreground">
              {items.length}
              {' '}
              {items.length === 1
                ? 'item'
                : 'items'}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map(item => (
              <ItemCard key={item.name} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function CommandCard({
  title,
  command,
  note,
}: {
  title: string
  command: string
  note: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        <CardDescription>{note}</CardDescription>
      </CardHeader>
      <CardContent>
        <code className="block rounded-md bg-muted px-3 py-2 text-xs break-all">
          {command}
        </code>
      </CardContent>
    </Card>
  )
}

function ItemCard({ item }: { item: RegistryItem }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base">{item.title}</CardTitle>
          <span className="shrink-0 rounded-full border px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            {item.name}
          </span>
        </div>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto flex items-end justify-between gap-3">
        <code className="rounded-md bg-muted px-2 py-1 text-[11px] break-all text-muted-foreground">
          npx shadcn@latest add litingyes/blocove/
          {item.name}
        </code>
        <Link
          to="/items/$name"
          params={{ name: item.name }}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          View
        </Link>
      </CardContent>
    </Card>
  )
}
