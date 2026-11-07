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
  HlsVideoMedia: 'hls-video',
  HlsAudioMedia: 'hls-audio',
  LiveVideoPlayer: 'live',
  LiveAudioPlayer: 'live',
  MediaTracks: 'tracks',
} as const

export type MediaExport = keyof typeof mediaModules

/** Import order of the modules, matching the docs navigation. */
const moduleOrder = [
  'video',
  'audio',
  'ambient-video',
  'live',
  'hls-video',
  'hls-audio',
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

/** One caption declaration, shared by every builder that documents tracks. */
export interface MediaUsageTrack {
  src: string
  label: string
  srcLang: string
  default?: boolean
}

/**
 * The `tracks` constant the generated examples declare, or an empty string when
 * the demo shows no captions. The media element then references it by name.
 */
function trackConstants(tracks?: MediaUsageTrack[]) {
  if (!tracks?.length) {
    return ''
  }

  return [
    'const tracks = [',
    ...tracks.map(
      track =>
        `  { src: "${attribute(track.src)}", label: "${attribute(track.label)}", srcLang: "${track.srcLang}"${track.default ? ', default: true' : ''} },`,
    ),
    ']',
    '',
  ].join('\n')
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
  tracks?: MediaUsageTrack[]
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

  const constants = trackConstants(tracks)

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

export interface HlsMediaUsageOptions {
  /** Component name of the demo export. */
  name?: string
  /** The adaptive video player, playing an HLS manifest. */
  video: {
    title?: string
    poster?: string
    /** Manifest URL. */
    src: string
    /** Text tracks rendered inside the media element. */
    tracks?: MediaUsageTrack[]
  }
  /** The adaptive audio player, playing an HLS manifest. */
  audio: {
    title?: string
    poster?: string
    /** Manifest URL. */
    src: string
  }
}

/**
 * The copy-pasteable example for the HLS media page: the on-demand shells with
 * the adaptive media element swapped in for each, so the snippet matches the
 * demo and the imports match the installed namespace.
 */
export function hlsMediaUsage({
  name = 'HlsMediaDemo',
  video,
  audio,
}: HlsMediaUsageOptions) {
  const components: MediaExport[] = [
    'VideoPlayer',
    'HlsVideoMedia',
    'AudioPlayer',
    'HlsAudioMedia',
  ]

  if (video.tracks?.length) {
    components.push('MediaTracks')
  }

  const videoAttributes = [
    ...(video.title
      ? [`        title="${attribute(video.title)}"`]
      : []),
    ...(video.poster
      ? [`        poster="${attribute(video.poster)}"`]
      : []),
  ]

  const videoMediaAttributes = [`          src="${attribute(video.src)}"`]

  if (video.tracks?.length) {
    videoMediaAttributes.push('          tracks={tracks}')
  }

  const audioAttributes = [
    ...(audio.title
      ? [`        title="${attribute(audio.title)}"`]
      : []),
    ...(audio.poster
      ? [`        poster="${attribute(audio.poster)}"`]
      : []),
  ]

  const constants = trackConstants(video.tracks)

  return [
    importBlock(components),
    '',
    constants
      ? `${constants}`
      : null,
    `export function ${name}() {`,
    '  return (',
    '    <>',
    '      <VideoPlayer',
    ...videoAttributes,
    '      >',
    '        <HlsVideoMedia',
    ...videoMediaAttributes,
    '        />',
    '      </VideoPlayer>',
    '      <AudioPlayer',
    ...audioAttributes,
    '      >',
    `        <HlsAudioMedia src="${attribute(audio.src)}" />`,
    '      </AudioPlayer>',
    '    </>',
    '  )',
    '}',
    '',
  ]
    .filter(line => line !== null)
    .join('\n')
}

export interface LivePlayerUsageOptions {
  /** Component name of the demo export. */
  name?: string
  /** The live video player, playing an HLS manifest. */
  video: {
    title?: string
    poster?: string
    /** Manifest URL. */
    src: string
    /** How the manifest is played; the demo sets `'live'`. */
    streamType?: 'live' | 'on-demand' | 'unknown'
  }
  /** The live audio player, playing an HLS manifest. */
  audio: {
    title?: string
    poster?: string
    /** Manifest URL. */
    src: string
  }
}

/**
 * The copy-pasteable example for the live player page: the live presets with an
 * adaptive media element each, and the stream type pinned so the demo reads as
 * live even before the manifest is probed.
 */
export function livePlayerUsage({
  name = 'LivePlayerDemo',
  video,
  audio,
}: LivePlayerUsageOptions) {
  const videoAttributes = [
    ...(video.title
      ? [`        title="${attribute(video.title)}"`]
      : []),
    ...(video.poster
      ? [`        poster="${attribute(video.poster)}"`]
      : []),
  ]

  const audioAttributes = [
    ...(audio.title
      ? [`        title="${attribute(audio.title)}"`]
      : []),
    ...(audio.poster
      ? [`        poster="${attribute(audio.poster)}"`]
      : []),
  ]

  return [
    importBlock([
      'LiveVideoPlayer',
      'LiveAudioPlayer',
      'HlsVideoMedia',
      'HlsAudioMedia',
    ]),
    '',
    `export function ${name}() {`,
    '  return (',
    '    <>',
    '      <LiveVideoPlayer',
    ...videoAttributes,
    '      >',
    '        <HlsVideoMedia',
    `          src="${attribute(video.src)}"`,
    `          streamType="${video.streamType ?? 'live'}"`,
    '        />',
    '      </LiveVideoPlayer>',
    '      <LiveAudioPlayer',
    ...audioAttributes,
    '      >',
    `        <HlsAudioMedia src="${attribute(audio.src)}" />`,
    '      </LiveAudioPlayer>',
    '    </>',
    '  )',
    '}',
    '',
  ].join('\n')
}
