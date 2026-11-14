import { imageSamples } from '@/docs/examples/image/content'
import { ImageDemoFrame } from '@/docs/examples/image/frame'
import { ImageFigure } from '@/registry/blocove/ui/image/figure'

export default function ImageFigureDemo() {
  return (
    <ImageDemoFrame>
      <ImageFigure
        alt="The launch vehicle on the pad"
        aspectRatio="16 / 9"
        caption="A still from the Artemis II launch trailer."
        credit="NASA"
        sizes="(min-width: 1024px) 640px, 100vw"
        src={imageSamples.launch}
        transform={imageSamples.resize}
        widths={imageSamples.widths}
      />
    </ImageDemoFrame>
  )
}
