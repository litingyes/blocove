import type { CSSProperties, ReactNode } from 'react'
import type { MediaAspectRatio } from '@/lib/blocove/media-theme'
import {
  BackgroundVideo as BackgroundVideoMedia,
  BackgroundVideoPlayer,
  BackgroundVideoSkin,
} from '@videojs/react/background'
import { cn } from 'cn'
import { mediaAspectRatioStyle, mediaThemeStyle } from '@/lib/blocove/media-theme'
import '@videojs/react/background/skin.css'

export interface AmbientVideoProps {
  /** The video source. Keep it short and loopable, and serve a format every target browser plays. */
  src: string
  /** Image shown before the first frame is available. */
  poster?: string
  /** The surface's aspect ratio; `auto` fills whatever box the layout gives it. */
  aspectRatio?: MediaAspectRatio
  /**
   * Whether the video plays on its own. The player always mutes and loops it, so
   * browsers allow playback without a gesture.
   */
  autoPlay?: boolean
  className?: string
  style?: CSSProperties
  /**
   * Content drawn over the video, such as a headline or a call to action. It is
   * rendered next to the player, so position it with your own classes.
   */
  children?: ReactNode
}

/**
 * Chrome-less ambient video for heroes and section backgrounds: muted, looped
 * and autoplaying, with no visible controls. Render it decorative-only, or put
 * real content on top and point the video at the same story.
 */
export function AmbientVideo({
  src,
  poster,
  aspectRatio = 'video',
  autoPlay = true,
  className,
  style,
  children,
}: AmbientVideoProps) {
  return (
    <div
      data-slot="ambient-video"
      className={cn('relative w-full overflow-hidden', className)}
      style={{
        ...mediaThemeStyle(),
        ...mediaAspectRatioStyle(aspectRatio),
        ...style,
      }}
    >
      <BackgroundVideoPlayer>
        <BackgroundVideoSkin className="h-full w-full">
          <BackgroundVideoMedia autoPlay={autoPlay} poster={poster} src={src} />
        </BackgroundVideoSkin>
      </BackgroundVideoPlayer>
      {children}
    </div>
  )
}
