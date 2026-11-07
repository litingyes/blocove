import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

// The docs site and the browser tests share one set of sample assets. They are
// committed, so this script exists to make their provenance reviewable and to
// regenerate them at any time. It downloads the source material from NASA (no
// other network access is needed) into `.cache/media-samples` and rewrites
// `public/media`.
//
// The samples used to be synthesised with ffmpeg's `lavfi` sources: a gradient
// sweep for the picture and a sine tone for the sound. They now come from real,
// freely reusable material, so the demos show an actual film frame and an actual
// spoken-word recording, and the captions come from the caption file NASA ships
// with the video instead of being written by hand.
//
// Two encodings per media type: MP4/AAC for the documentation previews (every
// desktop browser plays it), and WebM/VP9+Opus for the Chromium suite, whose
// bundled browser has no H.264 or AAC decoder.
//
// Sources (see `public/media/CREDITS.md` for the licensing):
//
//   video   NASA, "Around the Moon for All Humanity: Artemis II (Official Launch
//           Trailer)", 1080x608, 30 fps, 75.43 s, with its published SRT.
//   audio   NASA, "Houston, We Have a Podcast" Ep 393 (Crew-11) opening, 64 kb/s
//           AAC; the show notes carry the transcript of the passage clipped below.
//
// The downloaded files are cached and never committed; only the trimmed,
// re-encoded results are. Every download is size-checked and every input is
// probed, so an upstream replacement fails loudly instead of silently shifting
// the trims or the caption timings.

const root = process.cwd()
const outDir = path.join(root, 'public', 'media')
const cacheDir = path.join(root, '.cache', 'media-samples')

// NASA's asset host serves the files next to the metadata the images API
// returns. The identifiers contain spaces and parentheses, so they are encoded
// once here instead of at every call site.
const nasa = 'https://images-assets.nasa.gov'
const trailerId = 'Around the Moon for All Humanity Artemis II (Official Launch Trailer)'
const episodeId = 'Ep393_Crew-11'

const trailerBase = `${nasa}/video/${encodeURIComponent(trailerId)}/${encodeURIComponent(trailerId)}`

/**
 * The source clips. `bytes` pins the download: the repository relies on these
 * exact files, and a different size means NASA replaced one, in which case the
 * trims and the caption timings below have to be re-checked by hand.
 */
const sources = {
  trailer: {
    url: `${trailerBase}~medium.mp4`,
    file: 'artemis-ii-trailer-1080x608.mp4',
    bytes: 22_281_393,
    width: 1080,
    height: 608,
    duration: 75.433333,
  },
  captions: {
    url: `${trailerBase}.srt`,
    file: 'artemis-ii-trailer.srt',
    bytes: 1_806,
  },
  episode: {
    url: `${nasa}/audio/${episodeId}/${episodeId}~64k.m4a`,
    file: 'hwhap-393-crew-11.m4a',
    // Only the opening is needed, and the whole episode is 40 MB. The file is a
    // fast-start MP4, so a byte prefix decodes on its own; 1.25 MB is about the
    // first 160 s at this bitrate.
    range: [0, 1_310_719],
    bytes: 1_310_720,
  },
}

/**
 * The clips cut out of the trailer, in source seconds.
 *
 * Both windows start and end on a caption cue boundary from NASA's own SRT, so
 * the narration never stops mid-sentence and the caption track never has to be
 * invented or stretched:
 *
 *   main  20.440 - 28.440  cues 8-10, "We were always going to the Moon."
 *   alt    2.836 - 10.836  cues 1-4, "The Artemis II mission ... this rocket."
 *
 * The main clip is the one every shell plays (the player, the ambient
 * background, the HLS and the live demos), so its frames also supply the poster
 * and the cover art.
 */
const clips = {
  main: { start: 20.44, duration: 8.0 },
  alt: { start: 2.836, duration: 8.0 },
}

/** The audio excerpt: the show opening, cut between two of its pauses. */
const audio = { start: 0, duration: 19.9 }

/**
 * The stills are frames of the main and the alt clip, so the previews stay
 * consistent with the media they announce. The poster catches the astronaut
 * portrait the main clip opens on, and the cover is the same frame cropped
 * square, so the podcast block gets cover art from the same footage.
 */
const stillAt = {
  poster: 24.0,
  cover: 24.0,
  posterAlt: 8.0,
}

function run(args) {
  execFileSync('ffmpeg', [
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    ...args,
  ], {
    stdio: 'inherit',
  })
}

function probe(file) {
  return JSON.parse(execFileSync('ffprobe', [
    '-v',
    'error',
    '-show_streams',
    '-show_format',
    '-of',
    'json',
    file,
  ], {
    encoding: 'utf8',
  }))
}

function seconds(file) {
  return Number(probe(file).format.duration)
}

function streamOf(file, type) {
  const stream = probe(file).streams.find(candidate => candidate.codec_type === type)

  if (!stream) {
    throw new Error(`${path.basename(file)} has no ${type} stream`)
  }

  return stream
}

/** A readable byte count for the report printed at the end. */
function kb(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB`
}

async function download({ url, file, bytes, range }) {
  const target = path.join(cacheDir, file)
  const cached = await fsp.stat(target).catch(() => null)

  if (cached?.size === bytes) {
    console.log(`cached  ${file}`)
    return target
  }

  await fsp.mkdir(cacheDir, { recursive: true })

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const headers = range
        ? { range: `bytes=${range[0]}-${range[1]}` }
        : {}
      const response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(600_000),
      })

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`)
      }

      await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(target))

      const written = await fsp.stat(target)

      if (written.size !== bytes) {
        throw new Error(`expected ${bytes} bytes, received ${written.size}`)
      }

      console.log(`fetched ${file}`)
      return target
    }
    catch (error) {
      await fsp.rm(target, { force: true })

      if (attempt === 3) {
        throw new Error(
          `Could not download ${url} (${error.message}). The samples are committed, `
          + 'so only regenerate them when the host is reachable.',
        )
      }

      console.warn(`retrying ${file} after: ${error.message}`)
      await new Promise(resolve => setTimeout(resolve, attempt * 5_000))
    }
  }
}

/**
 * Asserts the downloaded source is still the one the trims were measured
 * against. A mismatch is not a retry: the byte sizes and the cue timings in
 * this file have to be updated together.
 */
function expectSource(file, { width, height, duration }) {
  const video = probe(file)
  const stream = video.streams.find(candidate => candidate.codec_type === 'video')
  const length = Number(video.format.duration)

  if (width && height && (stream?.width !== width || stream?.height !== height)) {
    throw new Error(
      `${path.basename(file)} is ${stream?.width}x${stream?.height}, expected ${width}x${height}; re-check the trims.`,
    )
  }

  if (duration && Math.abs(length - duration) > 0.2) {
    throw new Error(
      `${path.basename(file)} is ${length}s, expected ${duration}s; re-check the trims.`,
    )
  }
}

/** Cuts a window out of the trailer and encodes both delivery formats. */
function encodeClip(file, { start, duration }, stem) {
  // The seek sits after `-i` on purpose: an input seek lands on the nearest
  // keyframe, which would shift the picture against the caption timings that
  // are cut from the same numbers.
  const input = [
    '-i',
    file,
    '-ss',
    String(start),
    '-t',
    String(duration),
  ]

  run([
    ...input,
    '-vf',
    'scale=960:540,setsar=1',
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '28',
    '-profile:v',
    'main',
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-b:a',
    '96k',
    '-ar',
    '48000',
    '-movflags',
    '+faststart',
    path.join(outDir, `${stem}.mp4`),
  ])

  run([
    ...input,
    '-vf',
    'scale=960:540,setsar=1',
    '-c:v',
    'libvpx-vp9',
    '-crf',
    '44',
    '-b:v',
    '0',
    '-row-mt',
    '1',
    '-c:a',
    'libopus',
    '-b:a',
    '64k',
    '-ar',
    '48000',
    path.join(outDir, `${stem}.webm`),
  ])
}

/** Cuts the audio excerpt out of the episode and encodes both delivery formats. */
function encodeAudio(file) {
  const input = [
    '-i',
    file,
    '-ss',
    String(audio.start),
    '-t',
    String(audio.duration),
  ]

  run([
    ...input,
    '-ac',
    '2',
    '-ar',
    '48000',
    '-c:a',
    'aac',
    '-b:a',
    '96k',
    path.join(outDir, 'sample-audio.m4a'),
  ])

  run([
    ...input,
    '-ac',
    '2',
    '-ar',
    '48000',
    '-c:a',
    'libopus',
    '-b:a',
    '64k',
    path.join(outDir, 'sample-audio.webm'),
  ])
}

/** Writes one still as a JPEG at the delivery width. */
function encodeStill(file, at, out, filters = 'scale=960:540') {
  run([
    '-i',
    file,
    '-ss',
    String(at),
    '-frames:v',
    '1',
    '-vf',
    filters,
    '-q:v',
    '4',
    path.join(outDir, out),
  ])
}

function parseSrt(text) {
  const blocks = text
    .replace(/^\uFEFF/, '')
    .replaceAll('\r\n', '\n')
    .trim()
    .split(/\n{2,}/)

  return blocks.map((block) => {
    const lines = block.split('\n')
    const [from, to] = lines[1].split(' --> ')

    return {
      start: srtSeconds(from),
      end: srtSeconds(to),
      text: lines.slice(2).join('\n').trim(),
    }
  })
}

function srtSeconds(value) {
  const [hours, minutes, rest] = value.trim().split(':')
  const [secs, millis] = rest.split(',')

  return Number(hours) * 3600
    + Number(minutes) * 60
    + Number(secs)
    + Number(millis) / 1000
}

function vttTime(value) {
  const hours = Math.floor(value / 3600)
  const minutes = Math.floor((value % 3600) / 60)
  const secs = value - hours * 3600 - minutes * 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${secs.toFixed(3).padStart(6, '0')}`
}

/**
 * Turns the source SRT into the caption track of the main clip: the cues that
 * fall inside the cut window, rebased onto the clip and clamped to its length.
 * The cue text is NASA's, unchanged, including its own line breaks.
 */
function writeCaptions(file, window) {
  const cues = parseSrt(fs.readFileSync(file, 'utf8'))
    .filter(cue => cue.end > window.start && cue.start < window.start + window.duration)
    .map((cue) => {
      const start = Math.max(0, cue.start - window.start)
      const end = Math.min(window.duration, cue.end - window.start)

      return `${vttTime(start)} --> ${vttTime(end)}\n${cue.text}`
    })

  const body = [
    'WEBVTT',
    '',
    ...cues.map(cue => `${cue}\n`),
  ].join('\n')

  fs.writeFileSync(path.join(outDir, 'sample-captions.vtt'), body)
}

/**
 * Fails the run when an output does not match the contract the docs and the
 * browser suite rely on: the tests play the VP9/Opus files in a Chromium build
 * without H.264 or AAC, and the players expect the clips they are told about.
 */
const expected = {
  'sample-video.mp4': { codec: 'h264', audio: 'aac', duration: clips.main.duration },
  'sample-video.webm': { codec: 'vp9', audio: 'opus', duration: clips.main.duration },
  'sample-video-alt.mp4': { codec: 'h264', audio: 'aac', duration: clips.alt.duration },
  'sample-video-alt.webm': { codec: 'vp9', audio: 'opus', duration: clips.alt.duration },
  'sample-audio.m4a': { audio: 'aac', duration: audio.duration },
  'sample-audio.webm': { audio: 'opus', duration: audio.duration },
}

function verify() {
  for (const [file, contract] of Object.entries(expected)) {
    const target = path.join(outDir, file)
    const actual = seconds(target)

    if (Math.abs(actual - contract.duration) > 0.15) {
      throw new Error(`${file} is ${actual}s, expected ${contract.duration}s`)
    }

    if (contract.codec && streamOf(target, 'video').codec_name !== contract.codec) {
      throw new Error(`${file} is not ${contract.codec}`)
    }

    if (contract.audio && streamOf(target, 'audio').codec_name !== contract.audio) {
      throw new Error(`${file} is not ${contract.audio}`)
    }
  }
}

fs.mkdirSync(outDir, { recursive: true })

const trailer = await download(sources.trailer)
const captions = await download(sources.captions)
const episode = await download(sources.episode)

expectSource(trailer, sources.trailer)

if (seconds(episode) < 25) {
  throw new Error(`The episode excerpt is only ${seconds(episode)}s; extend the range.`)
}

encodeClip(trailer, clips.main, 'sample-video')
encodeClip(trailer, clips.alt, 'sample-video-alt')
encodeAudio(episode)

encodeStill(trailer, stillAt.poster, 'sample-poster.jpg')
encodeStill(trailer, stillAt.posterAlt, 'sample-poster-alt.jpg')
encodeStill(trailer, stillAt.cover, 'sample-cover.jpg', 'crop=min(iw\\,ih):min(iw\\,ih),scale=600:600')

writeCaptions(captions, clips.main)

verify()

console.log('')
console.log('output                    size     source')

for (const file of fs.readdirSync(outDir).sort()) {
  const full = path.join(outDir, file)

  if (!fs.statSync(full).isFile() || file.endsWith('.md')) {
    continue
  }

  const size = kb(fs.statSync(full).size)

  if (file.startsWith('sample-video-alt')) {
    console.log(`${file.padEnd(24)} ${size.padEnd(9)} trailer ${clips.alt.start}s +${clips.alt.duration}s`)
  }
  else if (file.startsWith('sample-video')) {
    console.log(`${file.padEnd(24)} ${size.padEnd(9)} trailer ${clips.main.start}s +${clips.main.duration}s`)
  }
  else if (file.startsWith('sample-audio')) {
    console.log(`${file.padEnd(24)} ${size.padEnd(9)} episode ${audio.start}s +${audio.duration}s`)
  }
  else if (file === 'sample-captions.vtt') {
    console.log(`${file.padEnd(24)} ${size.padEnd(9)} trailer SRT, main clip window`)
  }
  else {
    const stillFiles = {
      'sample-poster.jpg': stillAt.poster,
      'sample-poster-alt.jpg': stillAt.posterAlt,
      'sample-cover.jpg': stillAt.cover,
    }

    console.log(`${file.padEnd(24)} ${size.padEnd(9)} trailer ${stillFiles[file] ?? ''}s`)
  }
}
