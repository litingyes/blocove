export interface DocsNavGroup {
  /** Optional subgroup label rendered under the section heading. */
  label?: string
  items: string[]
}

export interface DocsNavSection {
  label: string
  groups: DocsNavGroup[]
}

/**
 * Documentation navigation and page order. Items are grouped per editor family,
 * so a new family (a code editor, for example) is another section rather than a
 * second nav tree. A family leads with its shell or complete block, then lists
 * the nodes, marks or extensions it is composed from as groups below. Registry
 * items that are not listed here (for example the internal helpers) do not get a
 * page.
 */
export const docsNav: DocsNavSection[] = [
  {
    label: 'Rich Text Editor',
    groups: [
      {
        items: ['rich-text-editor-playground', 'rich-text-editor'],
      },
      {
        label: 'Nodes',
        items: [
          'rich-text-editor-text',
          'rich-text-editor-paragraph',
          'rich-text-editor-hard-break',
          'rich-text-editor-heading',
          'rich-text-editor-code-block',
          'rich-text-editor-details',
          'rich-text-editor-image',
          'rich-text-editor-table',
        ],
      },
      {
        label: 'Marks',
        items: [
          'rich-text-editor-bold',
          'rich-text-editor-italic',
          'rich-text-editor-underline',
          'rich-text-editor-strike',
          'rich-text-editor-code',
          'rich-text-editor-link',
        ],
      },
    ],
  },
  {
    label: 'Code Editor',
    groups: [
      {
        label: 'Overview',
        items: ['code-editor'],
      },
      {
        label: 'Extensions',
        items: [
          'code-editor-shiki',
          'code-editor-languages',
          'code-editor-line-numbers',
          'code-editor-diff',
        ],
      },
    ],
  },
]

export const docsNavOrder = docsNav.flatMap(section =>
  section.groups.flatMap(group => group.items),
)

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
