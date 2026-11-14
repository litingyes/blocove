import { markdownDemoContent } from '@/docs/examples/markdown/content'
import { MarkdownDemoFrame } from '@/docs/examples/markdown/frame'

/** Inline and display math rendered by the KaTeX capability item. */
export default function MarkdownMathDemo() {
  return <MarkdownDemoFrame source={markdownDemoContent.math} math />
}
