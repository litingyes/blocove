import { markdownDemoContent } from '@/docs/examples/markdown/content'
import { MarkdownDemoFrame } from '@/docs/examples/markdown/frame'

/** A fence rendered by the shadcn/ui chart capability item. */
export default function MarkdownChartDemo() {
  return <MarkdownDemoFrame source={markdownDemoContent.chart} chart />
}
