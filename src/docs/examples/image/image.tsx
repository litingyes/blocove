import { imageSamples } from '@/docs/examples/image/content'
import { ImageDemoFrame } from '@/docs/examples/image/frame'
import { Image } from '@/registry/blocove/ui/image/image'

export default function ImageDemo() {
  return (
    <ImageDemoFrame>
      <Image
        alt="The launch vehicle on the pad"
        aspectRatio="16 / 9"
        placeholder="var(--muted)"
        sizes="(min-width: 1024px) 640px, 100vw"
        src={imageSamples.launch}
        transform={imageSamples.resize}
        widths={imageSamples.widths}
      />
    </ImageDemoFrame>
  )
}
