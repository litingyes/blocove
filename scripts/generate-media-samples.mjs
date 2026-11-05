import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

// The docs site and the browser tests share one set of sample assets. They are
// committed, so this script exists to make their provenance reviewable and to
// regenerate them at any time. It needs ffmpeg on PATH and rewrites
// `public/media`.
//
// Two encodings per media type: MP4/AAC for the documentation previews (every
// desktop browser plays it), and WebM/VP9+Opus for the Chromium suite, whose
// bundled browser has no H.264 or AAC decoder.

const root = process.cwd()
const outDir = path.join(root, 'public', 'media')
const width = 960
const height = 540

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

/** A slow gradient sweep with a quiet tone, so the player shows a moving picture. */
function videoInputs({ seconds, colors, frequency, speed }) {
  return {
    inputs: [
      '-f',
      'lavfi',
      '-i',
      `gradients=s=${width}x${height}:c0=${colors[0]}:c1=${colors[1]}:x0=0:y0=0:x1=${width}:y1=${height}:d=${seconds}:speed=${speed}:rate=30`,
      '-f',
      'lavfi',
      '-i',
      `sine=frequency=${frequency}:sample_rate=48000:duration=${seconds}`,
    ],
    maps: ['-map', '0:v', '-map', '[a]'],
    filters: [
      '-filter_complex',
      `[1:a]volume=0.15,afade=t=in:d=0.4,afade=t=out:st=${seconds - 0.6}:d=0.6[a]`,
      '-vf',
      `fade=t=in:d=0.5,fade=t=out:st=${seconds - 0.8}:d=0.8,format=yuv420p`,
    ],
  }
}

function encodeVideo(source, seconds, outFile, codec) {
  const common = [
    ...source.inputs,
    ...source.filters,
    ...source.maps,
    '-t',
    String(seconds),
  ]

  run(codec === 'mp4'
    ? [
        ...common,
        '-c:v',
        'libx264',
        '-preset',
        'slow',
        '-crf',
        '30',
        '-profile:v',
        'main',
        '-c:a',
        'aac',
        '-b:a',
        '96k',
        '-movflags',
        '+faststart',
        path.join(outDir, outFile),
      ]
    : [
        ...common,
        '-c:v',
        'libvpx-vp9',
        '-crf',
        '40',
        '-b:v',
        '0',
        '-row-mt',
        '1',
        '-c:a',
        'libopus',
        '-b:a',
        '64k',
        path.join(outDir, outFile),
      ])
}

function encodeAudio(seconds, outFile, codec) {
  const common = [
    '-f',
    'lavfi',
    '-i',
    `sine=frequency=261.63:sample_rate=48000:duration=${seconds}`,
    '-af',
    `volume=0.15,afade=t=in:d=0.8,afade=t=out:st=${seconds - 1.5}:d=1.5`,
    '-ac',
    '1',
    '-t',
    String(seconds),
  ]

  run(codec === 'm4a'
    ? [
        ...common,
        '-c:a',
        'aac',
        '-b:a',
        '64k',
        path.join(outDir, outFile),
      ]
    : [
        ...common,
        '-c:a',
        'libopus',
        '-b:a',
        '48k',
        path.join(outDir, outFile),
      ])
}

fs.mkdirSync(outDir, { recursive: true })

// The primary clip: the poster, the cover and most demos use it.
const main = {
  seconds: 8,
  colors: ['0x0f172a', '0x7c8aa0'],
  frequency: 392,
  speed: 0.02,
}
encodeVideo(videoInputs(main), main.seconds, 'sample-video.mp4', 'mp4')
encodeVideo(videoInputs(main), main.seconds, 'sample-video.webm', 'webm')

// A second clip so the playlist demo swaps the media for real, not just the
// title: same length, different palette.
const alt = {
  seconds: 8,
  colors: ['0x2a1b12', '0xb08a5e'],
  frequency: 330,
  speed: 0.03,
}
encodeVideo(videoInputs(alt), alt.seconds, 'sample-video-alt.mp4', 'mp4')
encodeVideo(videoInputs(alt), alt.seconds, 'sample-video-alt.webm', 'webm')

encodeAudio(20, 'sample-audio.m4a', 'm4a')
encodeAudio(20, 'sample-audio.webm', 'webm')

// Stills: the poster is a frame of the main clip and the cover is a square
// crop, so the samples stay visually consistent with each other.
run([
  '-i',
  path.join(outDir, 'sample-video.mp4'),
  '-ss',
  '1',
  '-frames:v',
  '1',
  '-q:v',
  '6',
  path.join(outDir, 'sample-poster.jpg'),
])

run([
  '-i',
  path.join(outDir, 'sample-video.mp4'),
  '-ss',
  '2',
  '-frames:v',
  '1',
  '-vf',
  'crop=min(iw\\,ih):min(iw\\,ih),scale=600:600',
  '-q:v',
  '6',
  path.join(outDir, 'sample-cover.jpg'),
])

run([
  '-i',
  path.join(outDir, 'sample-video-alt.mp4'),
  '-ss',
  '1',
  '-frames:v',
  '1',
  '-q:v',
  '6',
  path.join(outDir, 'sample-poster-alt.jpg'),
])

// Captions are text, so they are written directly instead of generated.
const captions = `WEBVTT

00:00:00.500 --> 00:00:03.000
Blocove composes the player from small registry items.

00:00:03.200 --> 00:00:06.000
The shell, the media and the tracks install separately.

00:00:06.200 --> 00:00:08.000
Change the source, keep the interface.

00:00:08.000 --> 00:00:20.000
The audio sample keeps the same spoken track.
`

fs.writeFileSync(path.join(outDir, 'sample-captions.vtt'), captions)

const files = fs.readdirSync(outDir).sort()

for (const file of files) {
  const bytes = fs.statSync(path.join(outDir, file)).size

  console.log(`${file} ${(bytes / 1024).toFixed(1)} KB`)
}
