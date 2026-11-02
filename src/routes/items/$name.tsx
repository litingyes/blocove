import type { RegistryCatalog } from '@/lib/registry-catalog'

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
import { itemTypeLabels } from '@/lib/registry-catalog'

const catalog = catalogJson as unknown as RegistryCatalog

export const Route = createFileRoute('/items/$name')({ component: ItemPage })

function ItemPage() {
  const { name } = Route.useParams()
  const item = catalog.items.find(entry => entry.name === name)

  if (!item) {
    return (
      <div className="flex flex-col items-start gap-3 py-24">
        <h1 className="text-2xl font-semibold tracking-tight">
          Item not found
        </h1>
        <p className="text-muted-foreground">
          No registry item named
          {' '}
          <code className="font-mono">{name}</code>
          .
        </p>
        <Link to="/" className="text-sm underline-offset-4 hover:underline">
          Back to the registry
        </Link>
      </div>
    )
  }

  const installFromGitHub = `npx shadcn@latest add litingyes/folio/${item.name}`
  const installFromNamespace = `npx shadcn@latest add @folio/${item.name}`

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <Link
          to="/"
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          ← All items
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            {item.title}
          </h1>
          <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
            {itemTypeLabels[item.type] ?? item.type}
          </span>
          <code className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
            {item.name}
          </code>
        </div>
        <p className="max-w-2xl text-muted-foreground">{item.description}</p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Install</h2>
        <p className="text-sm text-muted-foreground">
          Requires a project initialized with shadcn/ui and the b0 preset:
          {' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            npx shadcn@latest init --preset b0
          </code>
        </p>
        <div className="flex flex-col gap-2">
          <code className="rounded-md bg-muted px-3 py-2 text-xs break-all">
            {installFromGitHub}
          </code>
          <code className="rounded-md bg-muted px-3 py-2 text-xs break-all">
            {installFromNamespace}
          </code>
        </div>
        <div className="flex flex-wrap gap-3 pt-1">
          <a
            href={`/r/${item.name}.json`}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            View JSON
          </a>
          <a
            href="https://github.com/litingyes/folio"
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            Source on GitHub
          </a>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Files</CardTitle>
            <CardDescription>
              Installed into your project at the target paths below.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {item.files.length === 0
              ? (
                  <p className="text-sm text-muted-foreground">
                    {item.type === 'registry:base'
                      ? 'This item installs shadcn/ui prerequisites and ships no files of its own.'
                      : 'This item only applies theme tokens.'}
                  </p>
                )
              : (
                  item.files.map(file => (
                    <div
                      key={file.path}
                      className="flex flex-col gap-0.5 rounded-md border px-3 py-2"
                    >
                      <code className="text-xs break-all">{file.path}</code>
                      <span className="text-[11px] text-muted-foreground">
                        {file.type}
                        {file.target
                          ? ` → ${file.target}`
                          : null}
                      </span>
                    </div>
                  ))
                )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Dependencies</CardTitle>
            <CardDescription>
              npm packages and registry items installed with this item.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <DependencyGroup
              label="npm"
              values={item.dependencies}
              empty="No npm dependencies."
            />
            <DependencyGroup
              label="registry"
              values={item.registryDependencies}
              empty="No registry dependencies."
            />
            {item.categories.length > 0
              ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.categories.map(category => (
                      <span
                        key={category}
                        className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )
              : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DependencyGroup({
  label,
  values,
  empty,
}: {
  label: string
  values: string[]
  empty: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {values.length === 0
        ? (
            <span className="text-sm text-muted-foreground">{empty}</span>
          )
        : (
            <div className="flex flex-wrap gap-1.5">
              {values.map(value => (
                <code
                  key={value}
                  className="rounded-md bg-muted px-2 py-1 text-[11px]"
                >
                  {value}
                </code>
              ))}
            </div>
          )}
    </div>
  )
}
