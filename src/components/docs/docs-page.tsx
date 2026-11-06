import type { TocItem } from './docs-toc'
import type { DocsPageData } from '@/docs/types'
import type { DocsKind, RegistryCatalog, RegistryItem } from '@/lib/registry-catalog'
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { apiId } from '@/lib/docs-anchor'
import { buildPageMarkdown } from '@/lib/docs-markdown'
import { docsMarkdownPath, itemTypeLabels } from '@/lib/registry-catalog'
import { ApiReference } from './api-reference'
import { CodePanel } from './code-panel'
import { ComponentPreview } from './component-preview'
import { CopyPageMenu } from './copy-page-button'
import { MobileDocsNav } from './docs-sidebar'
import { DocsToc } from './docs-toc'
import { Installation } from './installation'
import { ItemLink } from './item-link'

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t pt-8">
      <h2 className="font-heading text-lg font-semibold tracking-tight">{title}</h2>
      {description
        ? <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        : null}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function PageActions({
  kind,
  markdown,
  markdownHref,
  previous,
  next,
}: {
  kind: DocsKind
  markdown: string
  markdownHref: string
  previous?: RegistryItem
  next?: RegistryItem
}) {
  return (
    <div className="flex items-center gap-2">
      <CopyPageMenu markdown={markdown} href={markdownHref} />
      <div className="flex items-center gap-1">
        {previous
          ? (
              <ItemLink
                kind={kind}
                name={previous.name}
                aria-label={`Previous: ${previous.title}`}
                className={buttonVariants({
                  variant: 'outline',
                  size: 'icon-sm',
                })}
              >
                <ArrowLeftIcon />
              </ItemLink>
            )
          : (
              <Button
                variant="outline"
                size="icon-sm"
                disabled
                aria-label="Previous page"
              >
                <ArrowLeftIcon />
              </Button>
            )}
        {next
          ? (
              <ItemLink
                kind={kind}
                name={next.name}
                aria-label={`Next: ${next.title}`}
                className={buttonVariants({
                  variant: 'outline',
                  size: 'icon-sm',
                })}
              >
                <ArrowRightIcon />
              </ItemLink>
            )
          : (
              <Button
                variant="outline"
                size="icon-sm"
                disabled
                aria-label="Next page"
              >
                <ArrowRightIcon />
              </Button>
            )}
      </div>
    </div>
  )
}

export interface DocsPageProps {
  /** Section the page is rendered under: components or blocks. */
  kind: DocsKind
  catalog: RegistryCatalog
  item: RegistryItem
  data?: DocsPageData
  previous?: RegistryItem
  next?: RegistryItem
}

/**
 * A registry item page: header, preview + code, installation, usage and API.
 */
export function DocsPage({
  kind,
  catalog,
  item,
  data,
  previous,
  next,
}: DocsPageProps) {
  const examples = data?.examples ?? []
  const usage = data?.usage ?? []
  const api = data?.api ?? []
  const markdown = buildPageMarkdown(item, data)
  const markdownHref = docsMarkdownPath(kind, item.name)
  const hasPreview = examples.length > 0
  const hasUsage = usage.length > 0
  const hasApi = api.length > 0

  const toc: TocItem[] = []

  if (hasPreview) {
    toc.push({ id: 'preview', label: 'Preview' })
  }

  toc.push({ id: 'installation', label: 'Installation' })

  if (hasUsage) {
    toc.push({ id: 'usage', label: 'Usage' })
  }

  if (hasApi) {
    toc.push({ id: 'api-reference', label: 'API Reference' })
    for (const entry of api) {
      toc.push({
        id: apiId(entry.name),
        label: entry.name,
      })
    }
  }

  return (
    <div className="min-w-0 py-8 lg:py-10 xl:grid xl:grid-cols-[minmax(0,1fr)_200px] xl:gap-10">
      <article className="flex min-w-0 flex-col gap-10">
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 lg:hidden">
            <MobileDocsNav catalog={catalog} kind={kind} />
            <PageActions
              kind={kind}
              markdown={markdown}
              markdownHref={markdownHref}
              previous={previous}
              next={next}
            />
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                {item.title}
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                {item.description}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border px-2 py-0.5 text-muted-foreground">
                  {itemTypeLabels[item.type] ?? item.type}
                </span>
                <code className="rounded-full bg-muted px-2 py-0.5 font-mono text-muted-foreground">
                  {item.name}
                </code>
                <a
                  href={`/r/${item.name}.json`}
                  className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  View JSON
                </a>
              </div>
            </div>

            <div className="hidden shrink-0 lg:block">
              <PageActions
                kind={kind}
                markdown={markdown}
                markdownHref={markdownHref}
                previous={previous}
                next={next}
              />
            </div>
          </div>

          {data?.note
            ? (
                <p className="max-w-2xl rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                  {data.note}
                </p>
              )
            : null}
        </header>

        {hasPreview
          ? (
              <section id="preview" className="scroll-mt-24">
                <h2 className="sr-only">Preview</h2>
                <div className="flex flex-col gap-6">
                  {examples.map((example) => {
                    const Example = example.component

                    return (
                      <ComponentPreview
                        key={example.title}
                        title={example.title}
                        code={example.code}
                        language={example.language ?? 'tsx'}
                        previewClassName={example.previewClassName}
                      >
                        <Example />
                      </ComponentPreview>
                    )
                  })}
                </div>
              </section>
            )
          : null}

        <Section
          id="installation"
          title="Installation"
          description="Add the item with the shadcn CLI, or copy the source manually."
        >
          <Installation item={item} data={data} />
        </Section>

        {hasUsage
          ? (
              <Section id="usage" title="Usage">
                <div className="flex flex-col gap-4">
                  {usage.map(snippet => (
                    <CodePanel
                      key={snippet.title ?? snippet.code.slice(0, 24)}
                      code={snippet.code}
                      language={snippet.language ?? 'tsx'}
                      title={snippet.title}
                    />
                  ))}
                </div>
              </Section>
            )
          : null}

        {hasApi
          ? (
              <Section
                id="api-reference"
                title="API Reference"
                description="Props accepted by the exported components."
              >
                <ApiReference entries={api} />
              </Section>
            )
          : null}

        {!hasPreview && !hasUsage && !hasApi
          ? (
              <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">
                  No component files
                </p>
                <p className="mt-1">
                  This item is a helper installed as a dependency of other
                  items. It ships no UI of its own, so there is no preview,
                  usage snippet or API table.
                </p>
              </div>
            )
          : null}
      </article>

      <DocsToc items={toc} />
    </div>
  )
}
