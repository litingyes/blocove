import { markdownDemoContent } from '@/docs/examples/markdown/content'
import { MarkdownDemoFrame } from '@/docs/examples/markdown/frame'

/** A fence rendered by the shiki capability item. */
export default function MarkdownCodeBlockDemo() {
  return <MarkdownDemoFrame source={markdownDemoContent.code} code />
}
