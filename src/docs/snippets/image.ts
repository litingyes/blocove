// Every page shows the same shipped composition, so the imports and the markup
// stay in sync with the items the CLI installs.
/** Export name -> module stem inside `components/blocove/image`. */
const imageModules = {
  Image: 'image',
  ImageFigure: 'figure',
  ImageZoom: 'zoom',
  ImageGallery: 'gallery',
  ImageCompare: 'compare',
} as const

export type ImageExport = keyof typeof imageModules

/** Import order of the modules, matching the docs navigation. */
const moduleOrder = [
  'image',
  'figure',
  'zoom',
  'gallery',
  'compare',
] as const

const importRoot = '@/components/blocove/image'

function importBlock(names: ImageExport[]) {
  const used = new Set(names)

  return moduleOrder
    .map(stem => ({
      stem,
      exports: [...used]
        .filter(name => imageModules[name] === stem)
        .sort((a, b) => a.localeCompare(b)),
    }))
    .filter(group => group.exports.length > 0)
    .map(({ stem, exports }) =>
      `import { ${exports.join(', ')} } from "${importRoot}/${stem}"`,
    )
    .join('\n')
}

/** Escapes a value so it can be embedded in a double-quoted JSX attribute. */
function attribute(value: string) {
  return value.replaceAll('"', '&quot;')
}

/**
 * The transform line the srcset examples declare. The sample files are named
 * after their width, so the copied code resolves the same variants the demos do.
 */
// The generated snippet contains a template literal; it is data here, not code.
// eslint-disable-next-line no-template-curly-in-string
const resizeLine = '  transform={(src, width) => src.replace(/-960\\.jpg$/, `-${width}.jpg`)}'

function widthsLines(widths?: readonly number[]) {
  return widths?.length
    ? [`      widths={[${widths.join(', ')}]}`, resizeLine]
    : []
}

function sizesLine(sizes?: string) {
  return sizes
    ? [`      sizes="${attribute(sizes)}"`]
    : []
}

export interface ImageUsageOptions {
  name?: string
  alt?: string
  src?: string
  aspectRatio?: string
  widths?: readonly number[]
  sizes?: string
  placeholder?: string
}

/** The copy-pasteable example for the Image page. */
export function imageUsage({
  name = 'ImageDemo',
  alt = 'The launch vehicle on the pad',
  src = '/image/sample-launch-960.jpg',
  aspectRatio = '16 / 9',
  widths,
  sizes,
  placeholder,
}: ImageUsageOptions = {}) {
  return [
    importBlock(['Image']),
    '',
    `export function ${name}() {`,
    '  return (',
    '    <Image',
    `      src="${attribute(src)}"`,
    `      alt="${attribute(alt)}"`,
    `      aspectRatio="${aspectRatio}"`,
    ...widthsLines(widths),
    ...sizesLine(sizes),
    ...(placeholder
      ? [`      placeholder="${attribute(placeholder)}"`]
      : []),
    '    />',
    '  )',
    '}',
    '',
  ].join('\n')
}

export interface ImageFigureUsageOptions extends ImageUsageOptions {
  caption?: string
  credit?: string
}

/** The copy-pasteable example for the Image Figure page. */
export function imageFigureUsage({
  name = 'ImageFigureDemo',
  alt = 'The launch vehicle on the pad',
  src = '/image/sample-launch-960.jpg',
  aspectRatio = '16 / 9',
  widths,
  sizes,
  caption = 'A still from the Artemis II launch trailer.',
  credit = 'NASA',
}: ImageFigureUsageOptions = {}) {
  return [
    importBlock(['ImageFigure']),
    '',
    `export function ${name}() {`,
    '  return (',
    '    <ImageFigure',
    `      src="${attribute(src)}"`,
    `      alt="${attribute(alt)}"`,
    `      aspectRatio="${aspectRatio}"`,
    ...widthsLines(widths),
    ...sizesLine(sizes),
    `      caption="${attribute(caption)}"`,
    `      credit="${attribute(credit)}"`,
    '    />',
    '  )',
    '}',
    '',
  ].join('\n')
}

export interface ImageZoomUsageOptions extends ImageUsageOptions {
  thumbnailSrc?: string
  caption?: string
}

/** The copy-pasteable example for the Image Zoom page. */
export function imageZoomUsage({
  name = 'ImageZoomDemo',
  alt = 'The launch vehicle on the pad',
  src = '/image/sample-launch-960.jpg',
  thumbnailSrc,
  aspectRatio = '16 / 9',
  widths,
  sizes,
  caption = 'A still from the Artemis II launch trailer.',
}: ImageZoomUsageOptions = {}) {
  return [
    importBlock(['ImageZoom']),
    '',
    `export function ${name}() {`,
    '  return (',
    '    <ImageZoom',
    `      src="${attribute(src)}"`,
    `      alt="${attribute(alt)}"`,
    ...(thumbnailSrc
      ? [`      thumbnailSrc="${attribute(thumbnailSrc)}"`]
      : []),
    `      aspectRatio="${aspectRatio}"`,
    ...widthsLines(widths),
    ...sizesLine(sizes),
    `      caption="${attribute(caption)}"`,
    '    />',
    '  )',
    '}',
    '',
  ].join('\n')
}

export interface ImageGalleryUsageItem {
  src: string
  alt: string
}

export interface ImageGalleryUsageOptions {
  name?: string
  images?: ImageGalleryUsageItem[]
  columns?: 2 | 3 | 4
}

/** The copy-pasteable example for the Image Gallery page. */
export function imageGalleryUsage({
  name = 'ImageGalleryDemo',
  images = [
    { alt: 'A frame from the launch trailer', src: '/image/sample-frame-a.jpg' },
    { alt: 'A second frame from the launch trailer', src: '/image/sample-frame-b.jpg' },
    { alt: 'A third frame from the launch trailer', src: '/image/sample-frame-c.jpg' },
  ],
  columns = 3,
}: ImageGalleryUsageOptions = {}) {
  return [
    importBlock(['ImageGallery']),
    '',
    'const images = [',
    ...images.map(
      image =>
        `  { src: "${attribute(image.src)}", alt: "${attribute(image.alt)}" },`,
    ),
    ']',
    '',
    `export function ${name}() {`,
    '  return (',
    '    <ImageGallery',
    '      images={images}',
    `      columns={${columns}}`,
    '      aspectRatio="16 / 9"',
    '    />',
    '  )',
    '}',
    '',
  ].join('\n')
}

export interface ImageCompareUsageOptions {
  name?: string
  before: ImageGalleryUsageItem
  after: ImageGalleryUsageItem
  beforeLabel?: string
  afterLabel?: string
}

/** The copy-pasteable example for the Image Compare page. */
export function imageCompareUsage({
  name = 'ImageCompareDemo',
  before,
  after,
  beforeLabel = 'Black and white',
  afterLabel = 'Color',
}: ImageCompareUsageOptions) {
  return [
    importBlock(['ImageCompare']),
    '',
    `export function ${name}() {`,
    '  return (',
    '    <ImageCompare',
    `      before={{ src: "${attribute(before.src)}", alt: "${attribute(before.alt)}" }}`,
    `      after={{ src: "${attribute(after.src)}", alt: "${attribute(after.alt)}" }}`,
    `      beforeLabel="${attribute(beforeLabel)}"`,
    `      afterLabel="${attribute(afterLabel)}"`,
    '    />',
    '  )',
    '}',
    '',
  ].join('\n')
}
