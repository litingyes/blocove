import type { ImageGalleryItem } from '@/components/blocove/image/gallery'

/**
 * The sample photographs shipped in `public/image`, shared by every demo so the
 * docs render real pictures without a network request. They are derived from the
 * NASA Artemis II material already credited in `public/media/CREDITS.md`; see
 * `public/image/CREDITS.md` for the transformations.
 */
export const imageSamples = {
  launch: '/image/sample-launch-960.jpg',
  widths: [320, 480, 640, 960] as const,
  /** The same frame at the requested width, matching the generated files. */
  resize: (src: string, width: number) => src.replace(/-\d+(?=\.jpg$)/, `-${width}`),
  before: '/image/sample-before-960.jpg',
  after: '/image/sample-after-960.jpg',
} as const

/** A frame from the sample clip, with an honest caption. */
export const galleryImages: ImageGalleryItem[] = [
  {
    alt: 'A frame from the launch trailer',
    caption: 'The opening of the sample clip.',
    src: '/image/sample-frame-a.jpg',
  },
  {
    alt: 'A second frame from the launch trailer',
    caption: 'Another still from the same sequence.',
    src: '/image/sample-frame-b.jpg',
  },
  {
    alt: 'A third frame from the launch trailer',
    caption: 'The closing frame of the sample clip.',
    src: '/image/sample-frame-c.jpg',
  },
]

/** The photo story the showcase block renders. */
export const showcaseImages = [
  {
    alt: 'The launch vehicle on the pad',
    caption: 'A still from the launch trailer.',
    src: imageSamples.launch,
  },
  ...galleryImages,
]
