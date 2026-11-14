import { galleryImages } from '@/docs/examples/image/content'
import { ImageDemoFrame } from '@/docs/examples/image/frame'
import { ImageGallery } from '@/registry/blocove/ui/image/gallery'

export default function ImageGalleryDemo() {
  return (
    <ImageDemoFrame className="max-w-3xl">
      <ImageGallery
        aspectRatio="16 / 9"
        images={galleryImages}
        label="Frames from the sample clip"
        sizes="(min-width: 1024px) 768px, 100vw"
      />
    </ImageDemoFrame>
  )
}
