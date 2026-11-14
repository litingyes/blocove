import { imageSamples } from '@/docs/examples/image/content'
import { ImageDemoFrame } from '@/docs/examples/image/frame'
import { ImageCompare } from '@/registry/blocove/ui/image/compare'

export default function ImageCompareDemo() {
  return (
    <ImageDemoFrame className="max-w-3xl">
      <ImageCompare
        after={{ alt: 'The frame in color', src: imageSamples.after }}
        before={{ alt: 'The frame in black and white', src: imageSamples.before }}
        beforeLabel="Black and white"
        afterLabel="Color"
      />
    </ImageDemoFrame>
  )
}
