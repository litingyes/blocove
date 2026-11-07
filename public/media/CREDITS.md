# Sample media credits

The files in this directory are excerpts of NASA material, committed only so the
documentation site and the browser test suite can play real audio and video
without a network request. The registry items themselves never ship these files.

NASA publishes most of its media for reuse. The relevant terms, quoted from the
[NASA Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/):

> NASA content — images, audio, video, and media files used in the rendition of
> 3-dimensional models … generally are not subject to copyright in the United
> States. You may use this material for educational or informational purposes,
> including photo collections, textbooks, public exhibits, computer graphical
> simulations and Internet Web pages. … NASA content used in a factual manner
> that does not imply endorsement may be used without needing explicit
> permission. NASA should be acknowledged as the source of the material.

Blocove is not affiliated with, sponsored by or endorsed by NASA. The NASA
insignia, logotype and identifiers are protected by law; they appear here only
because they are part of the footage, and this repository grants no rights to
them.

## Video, poster, cover and captions

- **Source:** _Around the Moon for All Humanity: Artemis II (Official Launch
  Trailer)_, NASA.
- **NASA image library ID:**
  `Around the Moon for All Humanity Artemis II (Official Launch Trailer)`
- **Files and landing pages:**
  - Video: <https://images.nasa.gov/details/Around%20the%20Moon%20for%20All%20Humanity%20Artemis%20II%20(Official%20Launch%20Trailer)>
  - Captions: the `.srt` published next to the same asset.
- **Published:** 2026-03-31, NASA Headquarters.

What this repository did to it:

| File                                            | Change                                                                                                            |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `sample-video.mp4`, `sample-video.webm`         | Cut from 00:00:20.440 for 8.00 s, scaled to 960×540, re-encoded to H.264/AAC (MP4) and VP9/Opus (WebM).           |
| `sample-video-alt.mp4`, `sample-video-alt.webm` | Cut from 00:00:02.836 for 8.00 s, same scale and encodings.                                                       |
| `sample-poster.jpg`                             | Frame at 00:00:24.000, scaled to 960×540, JPEG.                                                                   |
| `sample-cover.jpg`                              | The same frame, square-cropped to 600×600, JPEG.                                                                  |
| `sample-poster-alt.jpg`                         | Frame at 00:00:08.000, scaled to 960×540, JPEG.                                                                   |
| `sample-captions.vtt`                           | NASA's own subtitle cues that fall inside the first cut window, rebased onto the clip. The cue text is unchanged. |
| `hls/*`                                         | The two MP4 clips re-wrapped as HLS (fMP4/CMAF segments) by `scripts/generate-media-samples.sh`.                  |

## Audio

- **Source:** _Houston, We Have a Podcast_, episode 393, "Crew-11", NASA.
- **NASA image library ID:** `Ep393_Crew-11`
- **Landing page:** <https://images.nasa.gov/details/Ep393_Crew-11>
- **Published:** 2025-07-18, NASA Johnson Space Center.

What this repository did to it:

| File                                    | Change                                                                                            |
| --------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `sample-audio.m4a`, `sample-audio.webm` | The first 19.9 s of the episode opening, re-encoded to AAC 96 kb/s (M4A) and Opus 64 kb/s (WebM). |
| `hls/sample-audio*`                     | The same excerpt re-wrapped as HLS, AAC, by `scripts/generate-media-samples.sh`.                  |

## Regenerating

`node scripts/generate-media-samples.mjs` downloads the two sources into
`.cache/media-samples` (git-ignored), cuts the windows documented above, writes
the poster, the cover and the caption track, and then
`./scripts/generate-media-samples.sh` wraps the results into `hls/`.
