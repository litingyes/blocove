/**
 * The browser suite plays the WebM samples on purpose: the Chromium build
 * Vitest drives ships no H.264 or AAC decoder, while every Chromium can play
 * VP9 and Opus.
 */
export const mediaFixtures = {
  video: '/media/sample-video.webm',
  videoAlt: '/media/sample-video-alt.webm',
  audio: '/media/sample-audio.webm',
  poster: '/media/sample-poster.jpg',
  posterAlt: '/media/sample-poster-alt.jpg',
  captions: '/media/sample-captions.vtt',
}

/**
 * The HLS fixtures are mounted but never played in the browser suite: the
 * manifests declare H.264/AAC renditions, and the Chromium build Vitest drives
 * decodes neither. Assert the media element and the MediaSource wiring instead.
 */
export const hlsFixtures = {
  video: '/media/hls/sample-video.m3u8',
  audio: '/media/hls/sample-audio.m3u8',
  liveVideo: '/media/hls/sample-live.m3u8',
  liveAudio: '/media/hls/sample-live-audio.m3u8',
}

export const mediaFixtureTracks = [
  {
    src: mediaFixtures.captions,
    label: 'English',
    srcLang: 'en',
    default: true,
  },
]
