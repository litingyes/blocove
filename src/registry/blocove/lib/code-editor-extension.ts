import type { Extension } from '@codemirror/state'
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

export interface CodeEditorExtensionComponent<P extends object = Record<string, never>> {
  (props: P): ReactNode
  displayName?: string
  extension: CodeEditorExtensionFactory<P>
  extensionName: string
}

export interface CodeEditorExtensionConfig {
  component: CodeEditorExtensionComponent<any>
  props: Record<string, unknown>
}

export interface CodeEditorChildren {
  extensions: CodeEditorExtensionConfig[]
  content: ReactNode[]
}

/**
 * Declares a CodeMirror extension as a React component. The component renders
 * nothing; the base CodeEditor collects it from its children and appends the
 * extension to the editor configuration.
 */
export function defineCodeEditorExtension<P extends object = Record<string, never>>(
  name: string,
  extension: CodeEditorExtensionFactory<P>,
): CodeEditorExtensionComponent<P> {
  const ExtensionComponent = ((_props: P): ReactNode => null) as CodeEditorExtensionComponent<P>

  ExtensionComponent.displayName = `CodeEditorExtension(${name})`
  ExtensionComponent.extensionName = name
  ExtensionComponent.extension = extension
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
 * Splits editor children into extension declarations and renderable content.
 * Fragments and arrays are traversed so extension components can be grouped
 * without losing their declaration order.
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

  return { extensions: deduped, content }
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
