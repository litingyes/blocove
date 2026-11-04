import type { ComponentType } from 'react'

export interface DocsExample {
  title: string
  component: ComponentType
  code: string
  language?: string
  previewClassName?: string
}

export interface DocsSnippet {
  title?: string
  code: string
  language?: string
}

export interface DocsApiRow {
  prop: string
  type: string
  default: string
}

export interface DocsApiEntry {
  name: string
  description?: string
  extends?: string
  rows: DocsApiRow[]
}

export interface DocsPageData {
  examples?: DocsExample[]
  usage?: DocsSnippet[]
  api?: DocsApiEntry[]
  /** Other registry items whose install commands the demo needs. */
  demoDeps?: string[]
  /** Whether the item renders rich text through the shadcn/typeset stylesheet. */
  requiresTypeset?: boolean
  note?: string
}

/**
 * A documentation page module. `item` is the registry item the page documents;
 * pages are registered from the module tree, so adding a page only requires a
 * new file exporting `docsPage`.
 */
export interface DocsPage extends DocsPageData {
  item: string
}
