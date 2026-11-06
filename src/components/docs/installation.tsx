import type { DocsPageData } from '@/docs/types'
import type { PackageManager } from '@/lib/docs-commands'
import type { RegistryItem } from '@/lib/registry-catalog'
import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { TerminalIcon } from 'lucide-react'
import { useState } from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  addCommand,
  installCommand,
  itemAddress,
  namespaceAddress,
  packageManagers,
} from '@/lib/docs-commands'
import { installedFilePath } from '@/lib/registry-catalog'
import { getRegistrySource } from '@/lib/registry-source'
import { CodePanel } from './code-panel'
import { CopyButton } from './copy-button'
import { PackageManagerIcon } from './package-manager-icons'

function PackageManagerCommand({
  build,
}: {
  build: (packageManager: PackageManager) => string
}) {
  const [packageManager, setPackageManager] = useState<PackageManager>('pnpm')
  const command = build(packageManager)

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2">
        <TerminalIcon className="size-4 text-muted-foreground" />
        <div className="flex items-center gap-0.5">
          {packageManagers.map(manager => (
            <button
              key={manager}
              type="button"
              onClick={() => setPackageManager(manager)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs transition-colors',
                packageManager === manager
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <PackageManagerIcon manager={manager} />
              {manager}
            </button>
          ))}
        </div>
        <CopyButton
          value={command}
          label="Copy command"
          variant="ghost"
          size="icon-xs"
          className="ms-auto"
        />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm">
        <code>{command}</code>
      </pre>
    </div>
  )
}

function TypesetNote() {
  return (
    <div className="mt-4 rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
      Typography is provided by
      {' '}
      <a
        href="https://ui.shadcn.com/docs/typeset"
        target="_blank"
        rel="noreferrer"
        className="font-medium text-foreground underline-offset-4 hover:underline"
      >
        shadcn/typeset
      </a>
      . Copy
      {' '}
      <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
        typeset.css
      </code>
      {' '}
      next to your stylesheet, import it after Tailwind and add the
      {' '}
      <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
        .typeset-docs
      </code>
      {' '}
      preset. See the
      {' '}
      <Link
        to="/components/$name"
        params={{ name: 'rich-text-editor' }}
        hash="usage"
        className="font-medium text-foreground underline-offset-4 hover:underline"
      >
        Rich text editor setup
      </Link>
      .
    </div>
  )
}

function CommandInstall({
  item,
  data,
}: {
  item: RegistryItem
  data?: DocsPageData
}) {
  return (
    <div className="flex flex-col gap-4">
      <PackageManagerCommand
        build={packageManager =>
          addCommand(packageManager, itemAddress(item.name))}
      />

      <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        <p>
          Requires a shadcn/ui project set up with Base UI primitives. Blocove
          is developed against the
          {' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            b0
          </code>
          {' '}
          preset, but it installs no base config or theme tokens: your own
          preset, fonts and colors stay in place.
        </p>
        <p>
          Or install from the namespace after adding the registry:
          {' '}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs break-all">
            {addCommand('npm', namespaceAddress(item.name))}
          </code>
        </p>
      </div>

      {data?.demoDeps?.length
        ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">
                This example also uses:
                {' '}
                {data.demoDeps.map(name => (
                  <code
                    key={name}
                    className="me-1 rounded bg-muted px-1 py-0.5 font-mono text-xs"
                  >
                    {name}
                  </code>
                ))}
              </p>
              <PackageManagerCommand
                build={packageManager =>
                  addCommand(
                    packageManager,
                    data.demoDeps!.map(name => itemAddress(name)).join(' '),
                  )}
              />
            </div>
          )
        : null}

      {data?.requiresTypeset
        ? <TypesetNote />
        : null}
    </div>
  )
}

function ManualInstall({
  item,
  data,
}: {
  item: RegistryItem
  data?: DocsPageData
}) {
  const fileSources = (item.files ?? []).map(file => ({
    ...file,
    installedPath: installedFilePath(item, file),
    source: getRegistrySource(file.path),
  }))

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">1. Install dependencies</h3>
        {item.dependencies.length > 0
          ? (
              <PackageManagerCommand
                build={packageManager =>
                  installCommand(packageManager, item.dependencies)}
              />
            )
          : (
              <p className="text-sm text-muted-foreground">
                This item has no npm dependencies.
              </p>
            )}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">2. Install registry items</h3>
        {item.registryDependencies.length > 0
          ? (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {item.registryDependencies.map(dependency => (
                    <code
                      key={dependency}
                      className="rounded-md bg-muted px-2 py-1 font-mono text-xs"
                    >
                      {dependency}
                    </code>
                  ))}
                </div>
                <PackageManagerCommand
                  build={packageManager =>
                    addCommand(
                      packageManager,
                      item.registryDependencies.join(' '),
                    )}
                />
              </>
            )
          : (
              <p className="text-sm text-muted-foreground">
                This item has no registry dependencies.
              </p>
            )}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">3. Add the files</h3>
        <p className="text-xs text-muted-foreground">
          Paths are where the CLI writes each file, relative to your project
          root (`src/` is prepended in projects that use a
          {' '}
          <code className="rounded bg-muted px-1 py-0.5">src</code>
          {' '}
          directory).
        </p>
        {fileSources.length === 0
          ? (
              <p className="text-sm text-muted-foreground">
                This item ships no files.
              </p>
            )
          : (
              fileSources.map(file => (
                <div key={file.path} className="flex flex-col gap-2">
                  <p className="font-mono text-xs text-muted-foreground">
                    {file.installedPath}
                  </p>
                  {file.source
                    ? (
                        <CodePanel
                          code={file.source}
                          language="tsx"
                          title={file.path}
                        />
                      )
                    : (
                        <p className="text-sm text-muted-foreground">
                          Source not available.
                        </p>
                      )}
                </div>
              ))
            )}
      </div>

      {data?.requiresTypeset
        ? <TypesetNote />
        : null}
    </div>
  )
}

/**
 * Installation section with the CLI command and a manual walkthrough.
 */
export function Installation({
  item,
  data,
}: {
  item: RegistryItem
  data?: DocsPageData
}) {
  return (
    <Tabs defaultValue="command" className="gap-4">
      <TabsList variant="line">
        <TabsTrigger value="command">Command</TabsTrigger>
        <TabsTrigger value="manual">Manual</TabsTrigger>
      </TabsList>
      <TabsContent value="command">
        <CommandInstall item={item} data={data} />
      </TabsContent>
      <TabsContent value="manual">
        <ManualInstall item={item} data={data} />
      </TabsContent>
    </Tabs>
  )
}
