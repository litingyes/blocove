import { markdownDemoContent } from '@/docs/examples/markdown/content'
import { MarkdownDemoFrame } from '@/docs/examples/markdown/frame'

/** A fence rendered by the Pele capability item. */
export default function MarkdownMermaidDemo() {
  return <MarkdownDemoFrame source={markdownDemoContent.mermaid} mermaid />
}
