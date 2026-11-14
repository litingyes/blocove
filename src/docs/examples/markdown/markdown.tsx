import { markdownDemoContent } from '@/docs/examples/markdown/content'
import { MarkdownDemoFrame } from '@/docs/examples/markdown/frame'

/** The shell with both capability items composed. */
export default function MarkdownOverviewDemo() {
  return <MarkdownDemoFrame source={markdownDemoContent.overview} code math />
}
