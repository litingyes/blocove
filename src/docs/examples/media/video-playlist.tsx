import { videoPlaylistDemoItems } from '@/docs/examples/media/content'
import { VideoPlaylist } from '@/registry/blocove/blocks/video-playlist'

export default function VideoPlaylistDemo() {
  return (
    <VideoPlaylist
      className="max-w-3xl"
      items={videoPlaylistDemoItems}
    />
  )
}
