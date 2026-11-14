import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

// The docs site and the browser suite share one set of sample images. They are
// committed, so this script exists to make their provenance reviewable and to
// regenerate them at any time. The source material is already in the repository
// (`public/media`, NASA material — see `public/media/CREDITS.md`), so this script
// needs no network access and never downloads anything.
//
// It writes `public/image`:
//
//   sample-launch-{320,480,640,960}.jpg  one source frame at four widths, the
//                                        srcset material for the shell and blocks
//   sample-frame-{a,b,c}.jpg            three frames from the sample video, so
//                                        the gallery shows distinct pictures
//   sample-before-960.jpg               the launch frame, desaturated, for the
//   sample-after-960.jpg                comparison block's before/after pair
//
// `public/image/CREDITS.md` describes the transformations.

const root = process.cwd()
const outDir = path.join(root, 'public', 'image')
const poster = path.join(root, 'public', 'media', 'sample-poster.jpg')
const video = path.join(root, 'public', 'media', 'sample-video.mp4')

const launchWidths = [320, 480, 640, 960]
const frameTimes = [
  { file: 'sample-frame-a.jpg', at: 1 },
  { file: 'sample-frame-b.jpg', at: 3.5 },
  { file: 'sample-frame-c.jpg', at: 6 },
]

function ffmpeg(args) {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], {
    stdio: 'inherit',
  })
}

function assertSource(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`${path.relative(root, file)} is missing; regenerate the media samples first`)
  }
}

fs.mkdirSync(outDir, { recursive: true })
assertSource(poster)
assertSource(video)

for (const width of launchWidths) {
  ffmpeg([
    '-i',
    poster,
    '-vf',
    `scale=${width}:-1`,
    '-q:v',
    '4',
    path.join(outDir, `sample-launch-${width}.jpg`),
  ])
}

for (const { file, at } of frameTimes) {
  ffmpeg([
    '-ss',
    String(at),
    '-i',
    video,
    '-frames:v',
    '1',
    '-vf',
    'scale=960:-1',
    '-q:v',
    '4',
    path.join(outDir, file),
  ])
}

// The comparison demos an edit: the same frame, desaturated as the "before" and
// untouched as the "after".
ffmpeg([
  '-i',
  poster,
  '-vf',
  'eq=saturation=0,scale=960:-1',
  '-q:v',
  '4',
  path.join(outDir, 'sample-before-960.jpg'),
])
ffmpeg([
  '-i',
  poster,
  '-vf',
  'scale=960:-1',
  '-q:v',
  '4',
  path.join(outDir, 'sample-after-960.jpg'),
])

console.log(`Wrote ${fs.readdirSync(outDir).filter(name => name.endsWith('.jpg')).length} sample images to public/image`)
