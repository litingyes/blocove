import type { DocsKind } from '@/lib/registry-catalog'

/**
 * The three registry families, in the order every surface lists them. The
 * paperwork lives here so the docs nav, the catalog pages and the homepage
 * showcase all name and describe a family the same way.
 */
export const docsFamilies = {
  'rich-text-editor': {
    label: 'Rich Text Editor',
    description: 'A Tiptap shell with composable nodes and marks, typeset with shadcn/typeset.',
  },
  'code-editor': {
    label: 'Code Editor',
    description: 'A CodeMirror shell with composable extensions, highlighted with shiki.',
  },
  'media': {
    label: 'Media',
    description: 'Video.js audio and video players whose skins follow your shadcn/ui tokens, plus the blocks built on them.',
  },
} as const

export type DocsFamily = keyof typeof docsFamilies

export interface DocsNavGroup {
  /** Optional subgroup label rendered under the family heading. */
  label?: string
  items: string[]
}

export interface DocsNavSection {
  family: DocsFamily
  /**
   * Registry item that introduces the family. The sidebar renders it as the
   * family heading link instead of a list entry, so a family's shell does not
   * read as one block among its nodes. The item stays in `groups` on purpose:
   * the catalogs, the item counts and the reading order still include it.
   */
  entry?: string
  groups: DocsNavGroup[]
}

/**
 * Documentation navigation and page order, one tree per item kind. Components
 * lead with a family's shell, then list the nodes, marks or extensions it is
 * composed from; blocks list the complete compositions. The shell is also the
 * section's `entry`, so the sidebar can fold it into the family heading instead
 * of showing the same name twice. Registry items that are not listed here (for
 * example the internal helpers) do not get a page.
 */
export const docsNav: Record<DocsKind, DocsNavSection[]> = {
  components: [
    {
      family: 'rich-text-editor',
      entry: 'rich-text-editor',
      groups: [
        {
          items: ['rich-text-editor'],
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
            'rich-text-editor-blockquote',
            'rich-text-editor-list',
            'rich-text-editor-emoji',
            'rich-text-editor-mathematics',
            'rich-text-editor-mention',
          ],
        },
        {
          label: 'Extensions',
          items: [
            'rich-text-editor-drag-handle',
            'rich-text-editor-file-handler',
            'rich-text-editor-find-and-replace',
            'rich-text-editor-behavior',
            'rich-text-editor-typography',
            'rich-text-editor-unique-id',
            'rich-text-editor-invisible-characters',
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
            'rich-text-editor-highlight',
            'rich-text-editor-ruby',
            'rich-text-editor-subscript',
            'rich-text-editor-superscript',
            'rich-text-editor-text-style',
          ],
        },
      ],
    },
    {
      family: 'code-editor',
      entry: 'code-editor',
      groups: [
        {
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
    {
      family: 'media',
      groups: [
        {
          items: ['video-player', 'audio-player'],
        },
        {
          label: 'Ambient',
          items: ['ambient-video'],
        },
        {
          label: 'Live',
          items: ['live-player'],
        },
        {
          label: 'Sources',
          items: ['hls-media'],
        },
      ],
    },
  ],
  blocks: [
    {
      family: 'rich-text-editor',
      groups: [
        {
          items: ['rich-text-editor-block'],
        },
      ],
    },
    {
      family: 'code-editor',
      groups: [
        {
          items: ['code-editor-block'],
        },
      ],
    },
    {
      family: 'media',
      groups: [
        {
          label: 'Blocks',
          items: [
            'video-hero',
            'video-showcase',
            'audio-episode-player',
            'video-playlist',
          ],
        },
      ],
    },
  ],
}

/** Every page of one kind, in reading order. */
export function docsNavItems(kind: DocsKind): string[] {
  return docsNav[kind].flatMap(section =>
    section.groups.flatMap(group => group.items),
  )
}

export const docsNavOrder: Record<DocsKind, string[]> = {
  components: docsNavItems('components'),
  blocks: docsNavItems('blocks'),
}

/** One family's pages of one kind, in reading order. */
export function docsFamilyItems(kind: DocsKind, family: DocsFamily): string[] {
  return docsNav[kind]
    .filter(section => section.family === family)
    .flatMap(section => section.groups.flatMap(group => group.items))
}

/**
 * The previous and next page around `name`. Neighbours never cross the kind
 * boundary: the last component is followed by nothing, not by a block.
 */
export function getDocsNeighbors(kind: DocsKind, name: string) {
  const order = docsNavOrder[kind]
  const index = order.indexOf(name)

  return {
    previous: index > 0
      ? order[index - 1]
      : undefined,
    next: index >= 0 && index < order.length - 1
      ? order[index + 1]
      : undefined,
  }
}
