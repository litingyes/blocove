/** The track kinds the captions menu understands. */
export type MediaTrackKind
  = | 'captions'
    | 'subtitles'
    | 'descriptions'
    | 'chapters'
    | 'metadata'

/** One text track, declared once and rendered as a `<track>` element. */
export interface MediaTrack {
  /** Track URL, usually a WebVTT file. */
  src: string
  /** Label shown in the captions menu. */
  label: string
  /** BCP 47 language tag, for example `en` or `zh-CN`. */
  srcLang: string
  /** Track kind. Defaults to captions. */
  kind?: MediaTrackKind
  /** Whether the browser turns the track on by default. */
  default?: boolean
}

export interface MediaTracksProps {
  /** The text tracks to render inside the media element. */
  tracks: MediaTrack[]
}

/**
 * Renders text tracks with captions as the kind and a stable key, so the same
 * declarations feed the video and audio media components.
 */
export function MediaTracks({ tracks }: MediaTracksProps) {
  return (
    <>
      {tracks.map(track => (
        <track
          key={`${track.kind ?? 'captions'}-${track.src}`}
          default={track.default}
          kind={track.kind ?? 'captions'}
          label={track.label}
          src={track.src}
          srcLang={track.srcLang}
        />
      ))}
    </>
  )
}
