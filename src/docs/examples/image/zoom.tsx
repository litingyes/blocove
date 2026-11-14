import { imageSamples } from '@/docs/examples/image/content'
import { ImageDemoFrame } from '@/docs/examples/image/frame'
import { ImageZoom } from '@/registry/blocove/ui/image/zoom'

export default function ImageZoomDemo() {
  return (
    <ImageDemoFrame>
      <ImageZoom
        alt="The launch vehicle on the pad"
        aspectRatio="16 / 9"
        caption="A still from the Artemis II launch trailer."
        sizes="(min-width: 1024px) 640px, 100vw"
        src={imageSamples.launch}
        transform={imageSamples.resize}
        widths={imageSamples.widths}
      />
    </ImageDemoFrame>
  )
}
