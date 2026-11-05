import type { Extension } from '@codemirror/state'
import type { EditorView } from '@codemirror/view'
import type { ReactNode } from 'react'
import { Fragment, isValidElement } from 'react'

// Marks a component as a code editor extension declaration. The value is a
// symbol so the base CodeEditor can recognize extension components from any
// item without importing them.
const extensionComponentMarker = Symbol.for('blocove.code-editor.extension-component')

/**
 * Configuration shared by every extension declaration. The editor root passes
 * the props of the root component, so a declaration can fall back to the value
 * set once on the editor instead of repeating it.
 */
export interface CodeEditorExtensionContext {
  /** Language selected on the editor root. */
  language?: string
}

export type CodeEditorExtensionFactory<P extends object = Record<string, never>> = (
  props: P,
  context: CodeEditorExtensionContext,
) => readonly Extension[]

/**
 * The editor-level options an item may have changed by the time the surface is
 * created, or afterwards through the root props.
 */
export interface CodeEditorSurfaceOptions {
  editable: boolean
  readOnly: boolean
  lineWrapping: boolean
  autoFocus: boolean
}

/**
 * What the editor hands a surface so it can build its own views. A surface
 * replaces the single editor view, so it is responsible for creating the
 * primary view and for applying the options above.
 */
export interface CodeEditorSurfaceMountContext {
  /** Element the surface is appended to. */
  host: HTMLElement
  /** Document of the primary, editable side. */
  doc: string
  /**
   * Extensions for the primary side: the shared ones plus the listener that
   * reports document changes through `onChange`.
   */
  primaryExtensions: Extension[]
  /**
   * Extensions for any comparison side: the shared ones plus the listener that
   * only refreshes the editor chrome.
   */
  secondaryExtensions: Extension[]
  options: CodeEditorSurfaceOptions
}

export interface CodeEditorSurfaceInstance {
  /**
   * The view the toolbar, the status bar and the item controls drive. The
   * controlled document is synced on it.
   */
  view: EditorView
  /** Re-apply the editor-level options to every view the surface owns. */
  update: (options: CodeEditorSurfaceOptions) => void
  destroy: () => void
}

/**
 * Builds the mount function for a declaration, or returns `null` to keep the
 * default single-editor surface. The factory runs when the editor is created,
 * so props are still treated as static configuration.
 */
export type CodeEditorSurfaceFactory<P extends object = Record<string, never>> = (
  props: P,
  context: CodeEditorExtensionContext,
) => ((mount: CodeEditorSurfaceMountContext) => CodeEditorSurfaceInstance) | null

/** A declaration that asked for its own content surface. */
export interface CodeEditorSurfaceConfig {
  component: CodeEditorExtensionComponent<any>
  props: Record<string, unknown>
}

export interface CodeEditorExtensionComponent<P extends object = Record<string, never>> {
  (props: P): ReactNode
  displayName?: string
  extension: CodeEditorExtensionFactory<P>
  /**
   * Optional content surface. Items that need more than one editor — the split
   * diff owns two — declare it here and keep the default shell untouched.
   */
  surface?: CodeEditorSurfaceFactory<P>
  extensionName: string
}

export interface CodeEditorExtensionConfig {
  component: CodeEditorExtensionComponent<any>
  props: Record<string, unknown>
}

export interface CodeEditorChildren {
  extensions: CodeEditorExtensionConfig[]
  /** The declaration that replaces the content surface, if any. */
  surface?: CodeEditorSurfaceConfig
  content: ReactNode[]
}

export interface CodeEditorExtensionOptions<P extends object = Record<string, never>> {
  surface?: CodeEditorSurfaceFactory<P>
}

/**
 * Declares a CodeMirror extension as a React component. The component renders
 * nothing; the base CodeEditor collects it from its children and appends the
 * extension to the editor configuration. Pass `surface` to replace the single
 * editor view with a richer one, such as the side-by-side diff.
 */
export function defineCodeEditorExtension<P extends object = Record<string, never>>(
  name: string,
  extension: CodeEditorExtensionFactory<P>,
  options: CodeEditorExtensionOptions<P> = {},
): CodeEditorExtensionComponent<P> {
  const ExtensionComponent = ((_props: P): ReactNode => null) as CodeEditorExtensionComponent<P>

  ExtensionComponent.displayName = `CodeEditorExtension(${name})`
  ExtensionComponent.extensionName = name
  ExtensionComponent.extension = extension

  if (options.surface) {
    ExtensionComponent.surface = options.surface
  }

  Object.defineProperty(ExtensionComponent, extensionComponentMarker, {
    value: true,
  })

  return ExtensionComponent
}

export function isCodeEditorExtensionComponent(
  value: unknown,
): value is CodeEditorExtensionComponent<any> {
  return (
    typeof value === 'function'
    && (value as unknown as Record<PropertyKey, unknown>)[extensionComponentMarker] === true
  )
}

/**
 * Splits editor children into extension declarations, the optional content
 * surface and renderable content. Fragments and arrays are traversed so
 * extension components can be grouped without losing their declaration order.
 */
export function collectCodeEditorChildren(children: ReactNode): CodeEditorChildren {
  const extensions: CodeEditorExtensionConfig[] = []
  const content: ReactNode[] = []

  const visit = (node: ReactNode) => {
    if (Array.isArray(node)) {
      for (const child of node) {
        visit(child)
      }
      return
    }

    if (node === null || node === undefined || node === false || node === true) {
      return
    }

    if (!isValidElement(node)) {
      content.push(node)
      return
    }

    if (node.type === Fragment) {
      visit((node.props as { children?: ReactNode }).children)
      return
    }

    if (isCodeEditorExtensionComponent(node.type)) {
      extensions.push({
        component: node.type,
        props: node.props as Record<string, unknown>,
      })
      return
    }

    content.push(node)
  }

  visit(children)

  const seen = new Set<string>()
  const deduped = extensions.filter((config) => {
    if (seen.has(config.component.extensionName)) {
      console.warn(
        `[blocove/code-editor] Duplicate extension "${config.component.extensionName}" ignored. Only the first declaration is registered.`,
      )
      return false
    }

    seen.add(config.component.extensionName)
    return true
  })

  // The first declaration that asks for its own surface wins, mirroring how the
  // extensions are deduped above.
  const surfaceConfig = deduped.find(config => config.component.surface)

  return {
    extensions: deduped,
    surface: surfaceConfig
      ? {
          component: surfaceConfig.component,
          props: surfaceConfig.props,
        }
      : undefined,
    content,
  }
}

export function resolveCodeEditorExtensions(
  configs: CodeEditorExtensionConfig[],
  context: CodeEditorExtensionContext = {},
): Extension[] {
  return configs.flatMap(({ component, props }) => [
    ...component.extension(props, context),
  ])
}

/**
 * Resolves the content surface declared by the children. Returns `null` when no
 * declaration asks for one, or when the declaration keeps the default surface,
 * so the editor can fall back to a single CodeMirror view.
 */
export function resolveCodeEditorSurface(
  config: CodeEditorSurfaceConfig | undefined,
  context: CodeEditorExtensionContext = {},
): ((mount: CodeEditorSurfaceMountContext) => CodeEditorSurfaceInstance) | null {
  if (!config) {
    return null
  }

  const resolve = config.component.surface

  return resolve
    ? resolve(config.props, context)
    : null
}

/**
 * A stable signature for the extension declarations. Changing it recreates the
 * editor instance, so extension props are treated as static configuration.
 */
export function codeEditorExtensionSignature(configs: CodeEditorExtensionConfig[]): string {
  return JSON.stringify(
    configs.map(({ component, props }) => [
      component.extensionName,
      Object.fromEntries(
        Object.entries(props).filter(([, value]) => typeof value !== 'function'),
      ),
    ]),
  )
}
