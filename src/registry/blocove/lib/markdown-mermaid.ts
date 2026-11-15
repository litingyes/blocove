import type { MountOptions } from 'pele'

export interface MarkdownMermaidInstance {
  destroy: () => void
}

export interface MarkdownMermaidOptions {
  onError?: (cause: unknown) => void
}

export interface MarkdownMermaidModule {
  mountAsync: (
    element: HTMLElement,
    source: string,
    options: MarkdownMermaidOptions & Omit<MountOptions, 'onError' | 'onRender' | 'sanitize'>,
  ) => Promise<MarkdownMermaidInstance>
}

/** Turns a React id into an SVG id prefix Pele accepts (`[A-Za-z0-9_-]`). */
export function markdownMermaidIdPrefix(id: string): string {
  return `diagram-${id.replace(/[^\w-]/g, '')}`
}

/**
 * The static mount options the item owns: a unique id prefix per diagram, zoom
 * controls when the diagram shrinks, and no images, so model-authored image URLs
 * cannot become tracking pixels.
 */
export function buildMarkdownMermaidOptions(
  idPrefix: string,
): Omit<MountOptions, 'onError' | 'onRender' | 'sanitize'> {
  return { idPrefix, zoom: 'auto', images: false }
}

let modulePromise: Promise<MarkdownMermaidModule> | undefined

/**
 * Loads `pele/lazy` once and reuses the module. The lazy entry point loads each
 * diagram type on first use, so a page that never renders a diagram does not pay
 * for the renderer.
 */
export function loadMarkdownMermaid(): Promise<MarkdownMermaidModule> {
  modulePromise ??= import('pele/lazy') as unknown as Promise<MarkdownMermaidModule>

  return modulePromise
}
