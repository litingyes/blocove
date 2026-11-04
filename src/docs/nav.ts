export interface DocsNavGroup {
  label: string
  items: string[]
}

/**
 * Documentation navigation and page order. Registry items that are not listed
 * here (for example the internal editor helper) do not get a page.
 */
export const docsNav: DocsNavGroup[] = [
  {
    label: 'Base',
    items: ['base'],
  },
  {
    label: 'Editor',
    items: ['editor'],
  },
  {
    label: 'Nodes',
    items: [
      'editor-text',
      'editor-paragraph',
      'editor-hard-break',
      'editor-heading',
      'editor-code-block',
      'editor-details',
      'editor-image',
      'editor-table',
    ],
  },
  {
    label: 'Marks',
    items: [
      'editor-bold',
      'editor-italic',
      'editor-underline',
      'editor-strike',
      'editor-code',
      'editor-link',
    ],
  },
  {
    label: 'Blocks',
    items: ['login-01'],
  },
]

export const docsNavOrder = docsNav.flatMap(group => group.items)

export function getDocsNeighbors(name: string) {
  const index = docsNavOrder.indexOf(name)

  return {
    previous: index > 0
      ? docsNavOrder[index - 1]
      : undefined,
    next: index >= 0 && index < docsNavOrder.length - 1
      ? docsNavOrder[index + 1]
      : undefined,
  }
}
