import { showcaseImages } from '@/docs/examples/image/content'
import { ImageShowcase } from '@/registry/blocove/blocks/image-showcase'

export default function ImageShowcaseDemo() {
  return (
    <ImageShowcase
      className="w-full"
      credit="NASA"
      description="A lead photograph with its caption and credit, the facts that give it context, and a gallery for the rest of the set."
      eyebrow="Photo essay"
      href="https://images.nasa.gov/details/Around%20the%20Moon%20for%20All%20Humanity%20Artemis%20II%20(Official%20Launch%20Trailer)"
      images={showcaseImages}
      meta={['Four stills', 'Artemis II']}
      sizes="(min-width: 1024px) 768px, 100vw"
      title="Around the Moon"
    />
  )
}
