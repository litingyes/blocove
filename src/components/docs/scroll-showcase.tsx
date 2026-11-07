import type { ReactNode } from 'react'
import type { DocsFamily } from '@/docs/nav'
import { Link } from '@tanstack/react-router'
import { cn } from 'cn'
import { ArrowUpRightIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import VideoPlaylistDemo from '@/docs/examples/media/video-playlist'
import { docsFamilies, docsFamilyItems } from '@/docs/nav'
import { useScrollShowcase } from '@/hooks/use-scroll-showcase'
import { registryItemsByName } from '@/lib/registry-data'
import { CodeEditorBlock } from '@/registry/blocove/blocks/code-editor-block'
import { RichTextEditorBlock } from '@/registry/blocove/blocks/rich-text-editor-block'
import { ItemLink } from './item-link'

interface Showcase {
  family: DocsFamily
  /** Registry item the panel installs and documents. */
  block: string
  demo: ReactNode
  /** Extra classes for the preview frame, used to bound a tall demo. */
  frameClassName?: string
}

/**
 * One complete block per family, in the brand order. The demo is created once at
 * module scope and mounted for the active family only, so the media player and
 * the editors never run side by side while the visitor scrolls past the steps.
 */
const showcases: Showcase[] = [
  {
    family: 'rich-text-editor',
    block: 'rich-text-editor-block',
    demo: <RichTextEditorBlock />,
    // The demo document is long; a bounded surface keeps the previews at
    // comparable heights while the sticky panel follows the scroll.
    frameClassName: '[&_[data-slot=editor-content]]:max-h-88 [&_[data-slot=editor-content]]:overflow-y-auto',
  },
  {
    family: 'code-editor',
    block: 'code-editor-block',
    demo: <CodeEditorBlock />,
  },
  {
    family: 'media',
    block: 'video-playlist',
    demo: <VideoPlaylistDemo />,
  },
]

/**
 * The homepage showcase: the steps scroll on one side while the preview sticks
 * to the other and follows the step that crosses the middle of the viewport.
 * Tabs would hide two of the three blocks behind a control; scrolling keeps the
 * live surface in view the whole way down.
 */
export function ScrollShowcase() {
  const { active, sectionRefs } = useScrollShowcase(showcases.length)
  const current = showcases[active] ?? showcases[0]
  const currentFamily = docsFamilies[current.family]
  const currentTitle
    = registryItemsByName.get(current.block)?.title ?? currentFamily.label

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-10">
      <div className="sticky top-16 z-10 order-1 -mx-4 min-w-0 self-start border-b bg-background px-4 py-3 lg:top-20 lg:order-2 lg:mx-0 lg:border-b-0 lg:px-0 lg:py-0">
        <div className="flex items-center justify-between gap-2 pb-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {currentFamily.label}
          </p>
          <ItemLink
            kind="blocks"
            name={current.block}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Block docs
            <ArrowUpRightIcon className="size-3" />
          </ItemLink>
        </div>
        <div
          key={current.family}
          data-slot="home-showcase"
          aria-label={currentTitle}
          className={cn(
            'max-h-[45svh] overflow-y-auto rounded-xl border bg-muted/20 p-4 *:mx-auto sm:p-6 lg:max-h-none lg:overflow-visible',
            current.frameClassName,
          )}
        >
          {current.demo}
        </div>
      </div>

      <div className="order-2 flex min-w-0 flex-col lg:order-1">
        {showcases.map((showcase, index) => {
          const family = docsFamilies[showcase.family]
          const title
            = registryItemsByName.get(showcase.block)?.title ?? family.label
          const componentCount = docsFamilyItems(
            'components',
            showcase.family,
          ).length
          const blockCount = docsFamilyItems('blocks', showcase.family).length
          const isActive = index === active

          return (
            <article
              key={showcase.family}
              ref={sectionRefs[index]}
              data-slot="showcase-step"
              data-active={isActive || undefined}
              className={cn(
                'flex flex-col justify-center gap-3 py-10 transition-opacity duration-300 motion-reduce:transition-none lg:min-h-[80vh] lg:py-0',
                isActive
                  ? 'opacity-100'
                  : 'opacity-40',
              )}
            >
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {String(index + 1).padStart(2, '0')}
                {' · '}
                {family.label}
              </p>
              <h3 className="font-heading text-xl font-semibold tracking-tight">
                {title}
              </h3>
              <p className="max-w-md text-sm text-muted-foreground">
                {family.description}
              </p>
              <p className="text-xs text-muted-foreground">
                {componentCount}
                {' '}
                {componentCount === 1
                  ? 'component'
                  : 'components'}
                {' · '}
                {blockCount}
                {' '}
                {blockCount === 1
                  ? 'block'
                  : 'blocks'}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <ItemLink
                  kind="blocks"
                  name={showcase.block}
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  Block docs
                  <ArrowUpRightIcon />
                </ItemLink>
                <Link
                  to="/components"
                  hash={showcase.family}
                  className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                >
                  Components
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
