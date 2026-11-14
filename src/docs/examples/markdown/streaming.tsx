import type { MarkdownComponents } from '@/lib/blocove/markdown-parse'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { markdownDemoContent } from '@/docs/examples/markdown/content'
import { MarkdownCodeBlock } from '@/registry/blocove/ui/markdown/code-block'
import { Markdown } from '@/registry/blocove/ui/markdown/markdown'

const capabilities: MarkdownComponents = { code: MarkdownCodeBlock }

/** Tokens are fed a few characters at a time, the way a model streams them. */
const chunkSize = 4
const tickMs = 30

/**
 * The streaming demo: the same shell fed one chunk at a time. The parse cache
 * keeps finished blocks by identity, so only the block under the cursor costs
 * anything per tick.
 */
export function MarkdownStreamingDemo() {
  const [source, setSource] = useState('')
  const [streaming, setStreaming] = useState(true)
  // Bumping the run tears down the live interval and starts the source over, so
  // the effect never has to reset state synchronously.
  const [run, setRun] = useState(0)
  const total = markdownDemoContent.streaming.length

  useEffect(() => {
    const text = markdownDemoContent.streaming
    let cursor = 0

    const timer = window.setInterval(() => {
      cursor = Math.min(cursor + chunkSize, text.length)
      setSource(text.slice(0, cursor))

      if (cursor >= text.length) {
        window.clearInterval(timer)
        setStreaming(false)
      }
    }, tickMs)

    return () => window.clearInterval(timer)
  }, [run])

  const replay = useCallback(() => {
    setSource('')
    setStreaming(true)
    setRun(previous => previous + 1)
  }, [])

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span aria-live="polite">
          {streaming
            ? `Streaming… ${source.length} / ${total} characters`
            : `Complete · ${total} characters`}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={replay}>
          {streaming
            ? 'Restart'
            : 'Replay'}
        </Button>
      </div>
      <div className="rounded-lg border bg-background p-4 sm:p-6">
        <Markdown source={source} streaming={streaming} components={capabilities} />
      </div>
    </div>
  )
}
