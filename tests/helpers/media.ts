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

export const mediaFixtureTracks = [
  {
    src: mediaFixtures.captions,
    label: 'English',
    srcLang: 'en',
    default: true,
  },
]
