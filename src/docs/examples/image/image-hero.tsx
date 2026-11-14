import { imageSamples } from '@/docs/examples/image/content'
import { ImageDemoFrame } from '@/docs/examples/image/frame'
import { ImageHero } from '@/registry/blocove/blocks/image-hero'

export default function ImageHeroDemo() {
  return (
    <ImageDemoFrame className="max-w-3xl">
      <ImageHero
        alt="The launch vehicle on the pad"
        description="One frame, four widths, no layout shift while it loads."
        eyebrow="Image family"
        sizes="(min-width: 1024px) 768px, 100vw"
        src={imageSamples.launch}
        title="A hero that reserves its own space"
        transform={imageSamples.resize}
        widths={imageSamples.widths}
      />
    </ImageDemoFrame>
  )
}
