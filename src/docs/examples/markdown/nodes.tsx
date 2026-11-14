import { markdownDemoContent } from '@/docs/examples/markdown/content'
import { MarkdownDemoFrame } from '@/docs/examples/markdown/frame'

/**
 * One demo per node family, so a page can show how a single kind of node looks
 * next to the others without repeating the frame.
 */
export function MarkdownHeadingsDemo() {
  return <MarkdownDemoFrame source={markdownDemoContent.headings} />
}

export function MarkdownInlineDemo() {
  return <MarkdownDemoFrame source={markdownDemoContent.inline} />
}

export function MarkdownListsDemo() {
  return <MarkdownDemoFrame source={markdownDemoContent.lists} />
}

export function MarkdownTableDemo() {
  return <MarkdownDemoFrame source={markdownDemoContent.table} />
}

export function MarkdownQuoteDemo() {
  return <MarkdownDemoFrame source={markdownDemoContent.quote} />
}

export function MarkdownMediaDemo() {
  return <MarkdownDemoFrame source={markdownDemoContent.media} />
}

export function MarkdownFootnotesDemo() {
  return <MarkdownDemoFrame source={markdownDemoContent.footnotes} />
}
