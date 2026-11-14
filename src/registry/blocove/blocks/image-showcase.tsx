import type { ReactNode } from 'react'
import type { ImageTransform } from '@/components/blocove/image/image'
import { cn } from 'cn'
import { ExternalLinkIcon } from 'lucide-react'
import { ImageGallery } from '@/components/blocove/image/gallery'
import { ImageZoom } from '@/components/blocove/image/zoom'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export interface ImageShowcaseItem {
  /** The full-size source. */
  src: string
  /** Alternative text. */
  alt: string
  /** The smaller source used by the gallery; defaults to `src`. */
  thumbnailSrc?: string
  /** Caption shown under the lead image or the gallery preview. */
  caption?: ReactNode
}

export interface ImageShowcaseProps {
  /** The title of the story the images belong to. */
  title: string
  /** The images, in reading order; the first one leads the block. */
  images: readonly ImageShowcaseItem[]
  /** A small label above the title. */
  eyebrow?: string
  /** Supporting copy under the title. */
  description?: string
  /** Attribution shown under the lead image. */
  credit?: ReactNode
  /** Small facts rendered as badges, for example dates or counts. */
  meta?: string[]
  /** Extra actions rendered next to the facts. */
  actions?: ReactNode
  /** Optional link to the original source, rendered as "View original". */
  href?: string
  /** Widths the lead image requests. */
  widths?: readonly number[]
  /** Turns a source and a width into the URL that serves it. */
  transform?: ImageTransform
  /** Layout sizes of the lead image. */
  sizes?: string
  /** Extra classes for the section. */
  className?: string
}

/**
 * An editorial image story: a lead photograph with its caption and credit, the
 * facts and actions that give it context, and a gallery for the rest of the set.
 * The lead image keeps the zoom behaviour, so the block reads as one composed
 * surface rather than a stack of unrelated parts.
 */
export function ImageShowcase({
  title,
  images,
  eyebrow,
  description,
  credit,
  meta,
  actions,
  href,
  widths,
  transform,
  sizes,
  className,
}: ImageShowcaseProps) {
  if (images.length === 0) {
    return null
  }

  const [lead, ...rest] = images
  const hasFooter = Boolean(meta?.length) || Boolean(actions) || Boolean(href)

  return (
    <section
      data-slot="image-showcase"
      className={cn('flex w-full flex-col gap-4', className)}
    >
      <header className="flex flex-col gap-2">
        {eyebrow
          ? (
              <Badge variant="secondary" className="w-fit">
                {eyebrow}
              </Badge>
            )
          : null}
        <h3 className="font-heading text-2xl font-semibold tracking-tight text-balance">
          {title}
        </h3>
        {description
          ? (
              <p className="max-w-2xl text-sm text-muted-foreground">
                {description}
              </p>
            )
          : null}
      </header>

      <ImageZoom
        alt={lead.alt}
        caption={lead.caption}
        sizes={sizes}
        src={lead.src}
        transform={transform}
        widths={widths}
      />

      {credit
        ? (
            <p className="text-xs text-muted-foreground">
              {credit}
            </p>
          )
        : null}

      {hasFooter
        ? (
            <>
              <Separator />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {meta?.map(item => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {actions}
                  {href
                    ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
                        >
                          View original
                          <ExternalLinkIcon className="size-3.5" />
                        </a>
                      )
                    : null}
                </div>
              </div>
            </>
          )
        : null}

      {rest.length > 0
        ? (
            <ImageGallery
              images={rest}
              label={`More from ${title}`}
              sizes={sizes}
              transform={transform}
              widths={widths}
            />
          )
        : null}
    </section>
  )
}
