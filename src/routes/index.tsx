import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowUpRightIcon,
  BlocksIcon,
  BracesIcon,
  PaletteIcon,
  PenLineIcon,
  TerminalIcon,
  TypeIcon,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/')({
  component: Home,
  head: () => ({
    meta: [
      { title: 'Blocove — extensions for shadcn/ui' },
      {
        name: 'description',
        content:
          'Blocove extends shadcn/ui with composable registry items: a rich text editor built on Tiptap, plus the blocks and components you add to your own shadcn/ui project.',
      },
    ],
  }),
})

const principles = [
  {
    title: 'Extends, never replaces',
    body: 'Blocove sits on top of shadcn/ui. Add items to your existing shadcn/ui project: theme tokens and primitives stay owned by shadcn/ui, so your theme is never replaced.',
  },
  {
    title: 'Composable by design',
    body: 'Every node, mark and control is its own registry item. Install the ones you compose into your UI and keep the rest out of your bundle.',
  },
  {
    title: 'Source you own',
    body: 'Items install as source files in your project. There is no runtime package to wrap, theme or upgrade around.',
  },
]

const features = [
  {
    icon: PenLineIcon,
    title: 'Rich text editor',
    body: 'A Tiptap editor shell with toolbar, bubble menu and character count. Nodes and marks install separately, so the editor is exactly the one you composed.',
  },
  {
    icon: BlocksIcon,
    title: 'Composable items',
    body: 'Nodes, marks and blocks are independent items. Each one documents its live preview, install command and the files the CLI writes.',
  },
  {
    icon: TypeIcon,
    title: 'Typeset typography',
    body: 'Editor content renders through shadcn/typeset, so long-form text reads the same as the rest of your shadcn/ui project.',
  },
  {
    icon: PaletteIcon,
    title: 'Your theme stays yours',
    body: 'Blocove ships no base config or theme tokens. Items inherit the shadcn/ui theme you already use; b0 is only the baseline Blocove is developed against.',
  },
  {
    icon: TerminalIcon,
    title: 'Install however you like',
    body: 'Add items from a GitHub address, a registry URL or an @blocove namespace entry in components.json. Pin a tag for reproducible installs.',
  },
  {
    icon: BracesIcon,
    title: 'Plain JSON registry',
    body: 'The registry is static JSON served by the site, so the shadcn CLI needs no extra service to resolve items, files or dependencies.',
  },
]

const docsLinks = [
  {
    name: 'rich-text-editor-playground',
    title: 'Playground',
    body: 'A full-featured editor block composing every node, mark and control.',
  },
  {
    name: 'rich-text-editor',
    title: 'Editor shell',
    body: 'The editor root, toolbar, bubble menu and character count.',
  },
  {
    name: 'rich-text-editor-heading',
    title: 'Nodes',
    body: 'Headings, code blocks, details, images and tables.',
  },
  {
    name: 'rich-text-editor-bold',
    title: 'Marks',
    body: 'Bold, italic, underline, strikethrough, inline code and links.',
  },
]

function Home() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-4 py-12 sm:px-6">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <span className="w-fit rounded-full border px-3 py-1 text-xs text-muted-foreground">
            shadcn/ui extension registry
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Blocove extensions for shadcn/ui.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Blocove extends shadcn/ui for specific scenarios. It is not a
            replacement: add it to your existing shadcn/ui project and install
            only the items you compose, starting with a composable rich text
            editor built on Tiptap.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/items/$name"
            params={{ name: 'rich-text-editor-playground' }}
            className={buttonVariants({ size: 'lg' })}
          >
            Open the playground
          </Link>
          <Link
            to="/items/$name"
            params={{ name: 'rich-text-editor' }}
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            Read the editor docs
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-6 border-t pt-10">
        <SectionHeading
          eyebrow="Why Blocove"
          title="An extension layer, not another component library"
          description="Blocove only ships what shadcn/ui does not cover, and it ships it as source code that lands in your project."
        />
        <div className="grid gap-6 sm:grid-cols-3">
          {principles.map(principle => (
            <div key={principle.title} className="flex flex-col gap-2">
              <h3 className="font-semibold">{principle.title}</h3>
              <p className="text-sm text-muted-foreground">
                {principle.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6 border-t pt-10">
        <SectionHeading
          eyebrow="Features"
          title="What you get"
          description="Everything is a registry item: the editor shell, each node, each mark and a complete block."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <Card key={feature.title} className="gap-3">
                <CardHeader>
                  <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="size-4" />
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription>{feature.body}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-6 border-t pt-10">
        <SectionHeading
          eyebrow="Quick start"
          title="Add Blocove to an existing project"
          description="Start from your existing shadcn/ui project, then install the items you need."
        />
        <div className="grid gap-4 md:grid-cols-3">
          <CommandCard
            title="1. Set up shadcn/ui"
            command="npx shadcn@latest init"
            note="Blocove is built against the b0 preset; your own theme can differ."
          />
          <CommandCard
            title="2. Install from GitHub"
            command="npx shadcn@latest add litingyes/blocove/rich-text-editor"
            note="The editor shell plus the basic nodes."
          />
          <CommandCard
            title="3. Install an editor block"
            command="npx shadcn@latest add litingyes/blocove/rich-text-editor-playground"
            note="Brings the shell, every node and every mark."
          />
        </div>
      </section>

      <section className="flex flex-col gap-6 border-t pt-10">
        <SectionHeading
          eyebrow="Documentation"
          title="Start with the editor"
          description="Every item page has a live preview, the install command, a manual file walkthrough and an API reference."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {docsLinks.map(link => (
            <Link
              key={link.name}
              to="/items/$name"
              params={{ name: link.name }}
              className="group flex flex-col gap-1.5 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <span className="flex items-center gap-1 font-medium">
                {link.title}
                <ArrowUpRightIcon className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
              <span className="text-sm text-muted-foreground">
                {link.body}
              </span>
            </Link>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Need the source or the full item list?
          {' '}
          <a
            href="https://github.com/litingyes/blocove"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Browse the repository
          </a>
          .
        </p>
      </section>
    </div>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="max-w-2xl text-muted-foreground">{description}</p>
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
