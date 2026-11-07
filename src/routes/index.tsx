import { createFileRoute, Link } from '@tanstack/react-router'
import {
  BlocksIcon,
  BracesIcon,
  CodeIcon,
  PaletteIcon,
  PenLineIcon,
  PlayIcon,
  TerminalIcon,
  TypeIcon,
} from 'lucide-react'
import { CopyButton } from '@/components/docs/copy-button'
import { ScrollShowcase } from '@/components/docs/scroll-showcase'
import { ShellCommand } from '@/components/docs/shell-command'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { addCommand, itemAddress } from '@/lib/docs-commands'

export const Route = createFileRoute('/')({
  component: Home,
  head: () => ({
    meta: [
      { title: 'Blocove — composable building blocks for shadcn/ui' },
      {
        name: 'description',
        content:
          'Composable building blocks for shadcn/ui: a Tiptap rich text editor, a CodeMirror code editor and Video.js audio and video players, installed as registry items you own. Extend, never replace.',
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
    body: 'A Tiptap shell with toolbar, bubble menu and character count. Nodes and marks install separately.',
  },
  {
    icon: CodeIcon,
    title: 'Code editor',
    body: 'A CodeMirror shell with shiki highlighting, languages, line numbers and a diff view.',
  },
  {
    icon: PlayIcon,
    title: 'Audio and video',
    body: 'Video.js players with skins themed by your shadcn/ui tokens, from single players to full sections.',
  },
  {
    icon: BlocksIcon,
    title: 'Blocks that compose',
    body: 'Complete surfaces built from the components: one install, and the CLI brings the pieces along.',
  },
  {
    icon: TypeIcon,
    title: 'Typeset typography',
    body: 'Editor content renders through shadcn/typeset, so long-form text reads like the rest of your project.',
  },
  {
    icon: PaletteIcon,
    title: 'Your theme stays yours',
    body: 'Blocove ships no base config or theme tokens. Items inherit the shadcn/ui theme you already use.',
  },
  {
    icon: TerminalIcon,
    title: 'Install however you like',
    body: 'Add items from a GitHub address, a registry URL or an @blocove namespace entry in components.json.',
  },
  {
    icon: BracesIcon,
    title: 'Plain JSON registry',
    body: 'The registry is static JSON served by the site, so the shadcn CLI needs no extra service to resolve items.',
  },
]

const installCommand = addCommand(
  'npm',
  itemAddress('rich-text-editor-block'),
)

function Home() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-4 py-12 sm:px-6 sm:py-16">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <span className="w-fit rounded-full border px-3 py-1 text-xs text-muted-foreground">
            shadcn/ui extension registry
          </span>
          <h1 className="max-w-4xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Composable building blocks for shadcn/ui.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Blocove adds a Tiptap rich text editor, a CodeMirror code editor and
            Video.js audio and video players to the shadcn/ui project you already
            have. Every node, mark, control and block installs on its own, and
            nothing you already own is replaced.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/components" className={buttonVariants({ size: 'lg' })}>
            Browse components
          </Link>
          <Link
            to="/blocks"
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            Browse blocks
          </Link>
        </div>
        <div className="flex w-full max-w-xl items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
          <TerminalIcon className="size-4 shrink-0 text-muted-foreground" />
          <ShellCommand
            command={installCommand}
            className="min-w-0 flex-1 overflow-x-auto text-xs whitespace-nowrap"
          />
          <CopyButton
            value={installCommand}
            label="Copy install command"
            variant="ghost"
            size="icon-xs"
          />
        </div>
      </section>

      <section id="showcase" className="flex flex-col gap-6">
        <SectionHeading
          eyebrow="Showcase"
          title="One complete block per family"
          description="Scroll through the families to try each block live, then install it with one command."
        />
        <ScrollShowcase />
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
              <h3 className="font-heading font-semibold">{principle.title}</h3>
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
          description="Everything is a registry item: an editor shell, each node and mark, a media player and the blocks built on them."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            title="2. Install a block"
            command={addCommand('npm', itemAddress('code-editor-block'))}
            note="One item, and the CLI brings the components it composes."
          />
          <CommandCard
            title="3. Or start with a component"
            command={addCommand('npm', itemAddress('rich-text-editor'))}
            note="The editor shell plus the basic nodes."
          />
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
      <h2 className="font-heading text-2xl font-semibold tracking-tight">{title}</h2>
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
        <ShellCommand
          command={command}
          className="block rounded-md bg-muted px-3 py-2 text-xs break-all"
        />
      </CardContent>
    </Card>
  )
}
