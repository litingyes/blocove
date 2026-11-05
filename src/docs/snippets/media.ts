// Every page shows the same shipped composition, so the imports and the markup
// stay in sync with the items the CLI installs.
/** Export name -> module stem inside `components/blocove/media`. */
const mediaModules = {
  VideoPlayer: 'video',
  VideoMedia: 'video',
  AudioPlayer: 'audio',
  AudioMedia: 'audio',
  BackgroundVideo: 'ambient-video',
  AmbientVideo: 'ambient-video',
  MediaTracks: 'tracks',
} as const

export type MediaExport = keyof typeof mediaModules

/** Import order of the modules, matching the docs navigation. */
const moduleOrder = [
  'video',
  'audio',
  'ambient-video',
  'tracks',
] as const

const importRoot = '@/components/blocove/media'

function importBlock(names: MediaExport[]) {
  const used = new Set(names)

  return moduleOrder
    .map(stem => ({
      stem,
      exports: [...used]
        .filter(name => mediaModules[name] === stem)
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

export interface VideoPlayerUsageOptions {
  /** Component name of the demo export. */
  name?: string
  title?: string
  poster?: string
  src: string
  /** Video source shown in the snippet. */
  aspectRatio?: string
  /** Text tracks rendered inside the media element. */
  tracks?: { src: string, label: string, srcLang: string, default?: boolean }[]
}

/**
 * The copy-pasteable example for the video player page: the shell, the native
 * media element and, when the demo shows captions, the track declarations.
 */
export function videoPlayerUsage({
  name = 'VideoPlayerDemo',
  title,
  poster,
  src,
  aspectRatio,
  tracks,
}: VideoPlayerUsageOptions) {
  const components: MediaExport[] = ['VideoPlayer', 'VideoMedia']

  if (tracks?.length) {
    components.push('MediaTracks')
  }

  const attributes = [
    ...(title
      ? [`      title="${attribute(title)}"`]
      : []),
    ...(poster
      ? [`      poster="${attribute(poster)}"`]
      : []),
    ...(aspectRatio
      ? [`      aspectRatio="${aspectRatio}"`]
      : []),
  ]

  const mediaAttributes = [`        src="${attribute(src)}"`]

  if (tracks?.length) {
    mediaAttributes.push('        tracks={tracks}')
  }

  const constants = tracks?.length
    ? [
        `const tracks = [`,
        ...tracks.map(
          track =>
            `  { src: "${attribute(track.src)}", label: "${attribute(track.label)}", srcLang: "${track.srcLang}"${track.default ? ', default: true' : ''} },`,
        ),
        `]`,
        '',
      ].join('\n')
    : ''

  return [
    importBlock(components),
    '',
    constants
      ? `${constants}`
      : null,
    `export function ${name}() {`,
    '  return (',
    '    <VideoPlayer',
    ...attributes,
    '    >',
    '      <VideoMedia',
    ...mediaAttributes,
    '      />',
    '    </VideoPlayer>',
    '  )',
    '}',
    '',
  ]
    .filter(line => line !== null)
    .join('\n')
}

export interface AudioPlayerUsageOptions {
  name?: string
  title?: string
  poster?: string
  src: string
}

/** The copy-pasteable example for the audio player page. */
export function audioPlayerUsage({
  name = 'AudioPlayerDemo',
  title,
  poster,
  src,
}: AudioPlayerUsageOptions) {
  const attributes = [
    ...(title
      ? [`      title="${attribute(title)}"`]
      : []),
    ...(poster
      ? [`      poster="${attribute(poster)}"`]
      : []),
  ]

  return [
    importBlock(['AudioPlayer', 'AudioMedia']),
    '',
    `export function ${name}() {`,
    '  return (',
    '    <AudioPlayer',
    ...attributes,
    '    >',
    `      <AudioMedia src="${attribute(src)}" />`,
    '    </AudioPlayer>',
    '  )',
    '}',
    '',
  ].join('\n')
}

export interface AmbientVideoUsageOptions {
  name?: string
  src: string
  poster?: string
  aspectRatio?: string
}

/** The copy-pasteable example for the ambient video page. */
export function ambientVideoUsage({
  name = 'AmbientVideoDemo',
  src,
  poster,
  aspectRatio,
}: AmbientVideoUsageOptions) {
  return [
    importBlock(['AmbientVideo']),
    '',
    `export function ${name}() {`,
    '  return (',
    '    <AmbientVideo',
    `      src="${attribute(src)}"`,
    ...(poster
      ? [`      poster="${attribute(poster)}"`]
      : []),
    ...(aspectRatio
      ? [`      aspectRatio="${aspectRatio}"`]
      : []),
    '    />',
    '  )',
    '}',
    '',
  ].join('\n')
}
