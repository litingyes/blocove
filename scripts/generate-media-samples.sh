#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Regenerates the local HLS fixtures in public/media/hls.
#
# DEVELOPMENT CONVENIENCE ONLY. This script is not part of the build, is not
# wired into any package.json script, and nothing runs it on install or test.
# The files it writes are committed, so the docs site and the browser tests
# can play HLS without touching the network.
#
# It re-wraps the progressive samples produced by its Node sibling, so run that
# first when the source clips are missing:
#
#     node scripts/generate-media-samples.mjs
#     ./scripts/generate-media-samples.sh
#
# Requirements: ffmpeg and ffprobe. Homebrew's install prefix
# (/opt/homebrew/bin) is picked up when the binaries are not on PATH. Override
# with FFMPEG=/path/to/ffmpeg.
#
# The script is idempotent: it deletes and rewrites public/media/hls on every
# run, and re-running it produces the same playlists and fragments.
#
# Output (all in public/media/hls, all relative to each other):
#   sample-video.m3u8        ABR master: 640x360 (@~140 kb/s) and 960x540
#                            (@~300 kb/s), H.264/AAC, 8 s, fMP4/CMAF segments
#   sample-video-360p.m3u8   the two variant playlists the master lists
#   sample-video-540p.m3u8
#   sample-video-*-init.mp4  the fMP4 initialization segments (#EXT-X-MAP)
#   sample-video-*-NNN.m4s   the media fragments
#   sample-audio.m3u8        audio-only AAC master, ~20 s
#   sample-audio-aac.m3u8    the audio media playlist the master lists
#   sample-audio-init.mp4    its initialization segment + fragments
#   sample-audio-NNN.m4s
#   sample-live.m3u8         live video master, listing the EVENT playlist
#                            below; the master has to name a variant, because
#                            the Video.js 10 HLS engine resolves a source as a
#                            multivariant playlist and never falls back to a
#                            bare media playlist
#   sample-live-video.m3u8   EVENT playlist, no #EXT-X-ENDLIST, so players
#                            treat it as a live stream; reuses the 360p
#                            fragments (the playlist itself is its own file)
#   sample-live-audio.m3u8   live audio master, listing the EVENT playlist below
#   sample-live-audio-aac.m3u8  audio EVENT playlist, no #EXT-X-ENDLIST, reuses
#                            the audio fragments
# ---------------------------------------------------------------------------

set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
out="$root/public/media/hls"
video="$root/public/media/sample-video.mp4"
audio="$root/public/media/sample-audio.m4a"

if [[ -z "${FFMPEG:-}" ]]; then
  if command -v ffmpeg >/dev/null 2>&1; then
    FFMPEG="$(command -v ffmpeg)"
  elif [[ -x /opt/homebrew/bin/ffmpeg ]]; then
    FFMPEG=/opt/homebrew/bin/ffmpeg
  else
    echo "error: ffmpeg not found; install it or set FFMPEG=/path/to/ffmpeg" >&2
    exit 1
  fi
fi

# ffprobe ships next to ffmpeg; used by the check at the end.
if [[ -z "${FFPROBE:-}" ]]; then
  if [[ -x "$(dirname "$FFMPEG")/ffprobe" ]]; then
    FFPROBE="$(dirname "$FFMPEG")/ffprobe"
  elif command -v ffprobe >/dev/null 2>&1; then
    FFPROBE="$(command -v ffprobe)"
  else
    echo "error: ffprobe not found; install it or set FFPROBE=/path/to/ffprobe" >&2
    exit 1
  fi
fi

for source in "$video" "$audio"; do
  if [[ ! -f "$source" ]]; then
    echo "error: missing $source" >&2
    echo "       the source clips are committed under public/media; restore them first" >&2
    exit 1
  fi
done

rm -rf "$out"
mkdir -p "$out"

# --- Adaptive video master, fMP4/CMAF fragments ------------------------------
#
# One encode, two renditions:
#   * `split` + two scales give the 640x360 and 960x540 rungs. The source clip is
#     the 960x540 progressive sample cut from NASA's 1080x608 trailer, so the
#     540p rung is the source resolution and the 360p rung is a real downscale:
#     both exist so the quality menu has a ladder to switch between.
#   * `-hls_time 2` cuts 8 s into four fragments; `force_key_frames` puts a
#     keyframe on every fragment boundary, so each fragment decodes on its own
#     (`independent_segments` then tells players so).
#   * `-hls_segment_type fmp4` emits CMAF fragments plus one init segment per
#     rendition, and `-master_pl_name` writes the ABR master playlist itself.
#   * `%v` in the file names expands to the variant name from `var_stream_map`.
#   * `-crf 30` keeps the committed fragments small without softening the Moon
#     and launch footage the trailer is cut from; 64 kb/s mono
#     AAC matches the source (48 kHz mono) and keeps the master small.
"$FFMPEG" -hide_banner -loglevel error -y -i "$video" \
  -filter_complex "[0:v]split=2[v360in][v540in];[v360in]scale=-2:360,setsar=1[v360];[v540in]scale=-2:540,setsar=1[v540]" \
  -map "[v360]" -map "[v540]" -map 0:a -map 0:a \
  -c:v libx264 -preset medium -crf 30 -profile:v main -pix_fmt yuv420p \
  -force_key_frames "expr:gte(t,n_forced*2)" \
  -c:a aac -b:a 64k -ac 1 -ar 48000 \
  -f hls \
  -hls_time 2 \
  -hls_playlist_type vod \
  -hls_segment_type fmp4 \
  -hls_flags independent_segments \
  -hls_fmp4_init_filename "sample-video-%v-init.mp4" \
  -hls_segment_filename "$out/sample-video-%v-%03d.m4s" \
  -master_pl_name sample-video.m3u8 \
  -var_stream_map "v:0,a:0,name:360p v:1,a:1,name:540p" \
  "$out/sample-video-%v.m3u8"

# --- Audio-only on-demand playlist ------------------------------------------
#
# `atrim=duration=19.9` matches the length of the committed excerpt. It keeps
# the cut off the encoder's flush frame, so the five fragments come out as
# 4.01/3.99/4.01/3.99/3.90 s instead of ending with a ~20 ms sliver.
"$FFMPEG" -hide_banner -loglevel error -y -i "$audio" \
  -af "atrim=duration=19.9,asetpts=N/SR/TB" \
  -c:a aac -b:a 64k -ac 1 -ar 48000 \
  -f hls \
  -hls_time 4 \
  -hls_playlist_type vod \
  -hls_segment_type fmp4 \
  -hls_fmp4_init_filename "sample-audio-init.mp4" \
  -hls_segment_filename "$out/sample-audio-%03d.m4s" \
  "$out/sample-audio-aac.m3u8"

# The audio master. The HLS engine resolves a source as a multivariant
# playlist, so an audio-only manifest still needs a master above the media
# playlist; without one the element attaches MediaSource and then waits forever.
cat > "$out/sample-audio.m3u8" <<'EOF'
#EXTM3U
#EXT-X-VERSION:7
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-STREAM-INF:BANDWIDTH=128000,CODECS="mp4a.40.2"
sample-audio-aac.m3u8
EOF

# --- Live fixtures -----------------------------------------------------------
#
# A live playlist is the on-demand one without the end marker and with the
# EVENT type: players keep polling for new fragments instead of showing a
# finished stream. The fragments are shared with the on-demand fixtures, which
# keeps the directory small; only the playlist header differs, so it is derived
# from the generated playlist instead of being re-encoded.
live_from() {
  local source="$1" target="$2"

  sed \
    -e 's/^#EXT-X-PLAYLIST-TYPE:VOD$/#EXT-X-PLAYLIST-TYPE:EVENT/' \
    -e '/^#EXT-X-ENDLIST$/d' \
    "$out/$source" > "$out/$target"
}

live_from sample-video-360p.m3u8 sample-live-video.m3u8
live_from sample-audio-aac.m3u8 sample-live-audio-aac.m3u8

# Each live master names its EVENT playlist. A master is required, not cosmetic:
# the engine resolves a source as a multivariant playlist, and a bare media
# playlist leaves MediaSource attached with no fragments requested.
write_live_master() {
  local target="$1" stream_inf="$2" media="$3"

  cat > "$out/$target" <<EOF
#EXTM3U
#EXT-X-VERSION:7
#EXT-X-INDEPENDENT-SEGMENTS
#EXT-X-STREAM-INF:$stream_inf
$media
EOF
}

write_live_master sample-live.m3u8 \
  'BANDWIDTH=900000,RESOLUTION=640x360,CODECS="avc1.64001f,mp4a.40.2"' \
  sample-live-video.m3u8

write_live_master sample-live-audio.m3u8 \
  'BANDWIDTH=128000,CODECS="mp4a.40.2"' \
  sample-live-audio-aac.m3u8

# --- Sanity check ------------------------------------------------------------
#
# The EVENT playlists must stay open ended, each master must name a variant that
# exists, and every playlist must parse.
for playlist in sample-live-video.m3u8 sample-live-audio-aac.m3u8; do
  if grep -q '^#EXT-X-ENDLIST$' "$out/$playlist"; then
    echo "error: $playlist must not contain #EXT-X-ENDLIST" >&2
    exit 1
  fi
done

for master in sample-video.m3u8 sample-audio.m3u8 sample-live.m3u8 sample-live-audio.m3u8; do
  if ! grep -q '^#EXT-X-STREAM-INF:' "$out/$master"; then
    echo "error: $master must be a multivariant playlist" >&2
    exit 1
  fi

  while read -r variant; do
    if [[ ! -f "$out/$variant" ]]; then
      echo "error: $master references missing $variant" >&2
      exit 1
    fi
  done < <(grep -v '^#' "$out/$master" | grep -v '^$')
done

for playlist in "$out"/*.m3u8; do
  if ! "$FFPROBE" -v error -show_entries format=format_name -of csv=p=0 "$playlist" >/dev/null 2>&1; then
    echo "error: $(basename "$playlist") does not parse" >&2
    exit 1
  fi
done

# --- Report ------------------------------------------------------------------
ls -l "$out"
echo
echo "public/media/hls: $(du -sh "$out" | cut -f1) in $(ls "$out" | wc -l | tr -d ' ') files"
