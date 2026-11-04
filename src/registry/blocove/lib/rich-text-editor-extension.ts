import type { Extensions } from '@tiptap/core'
import type { ReactNode } from 'react'
import { Fragment, isValidElement } from 'react'

// Marks a component as an editor extension declaration. The value is a symbol
// so the base Editor can recognize extension components from any item without
// importing them.
const extensionComponentMarker = Symbol.for('blocove.rich-text-editor.extension-component')

export type ExtensionFactory<P extends object> = (props: P) => Extensions

export interface ExtensionComponent<P extends object = Record<string, never>> {
  (props: P): ReactNode
  displayName?: string
  extension: ExtensionFactory<P>
  extensionName: string
}

export interface ExtensionConfig {
  component: ExtensionComponent<any>
  props: Record<string, unknown>
}

export interface EditorChildren {
  extensions: ExtensionConfig[]
  content: ReactNode[]
}

/**
 * Declares a Tiptap extension as a React component. The component renders
 * nothing; the base Editor collects it from its children and registers the
 * extension before creating the editor instance.
 */
export function defineExtensionComponent<P extends object = Record<string, never>>(
  name: string,
  extension: ExtensionFactory<P>,
): ExtensionComponent<P> {
  const ExtensionComponent = ((_props: P): ReactNode => null) as ExtensionComponent<P>

  ExtensionComponent.displayName = `EditorExtension(${name})`
  ExtensionComponent.extensionName = name
  ExtensionComponent.extension = extension
  Object.defineProperty(ExtensionComponent, extensionComponentMarker, {
    value: true,
  })

  return ExtensionComponent
}

export function isExtensionComponent(value: unknown): value is ExtensionComponent<any> {
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
export function collectEditorChildren(children: ReactNode): EditorChildren {
  const extensions: ExtensionConfig[] = []
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

    if (isExtensionComponent(node.type)) {
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
        `[blocove/rich-text-editor] Duplicate extension "${config.component.extensionName}" ignored. Only the first declaration is registered.`,
      )
      return false
    }

    seen.add(config.component.extensionName)
    return true
  })

  return { extensions: deduped, content }
}

export function resolveExtensions(configs: ExtensionConfig[]): Extensions {
  return configs.flatMap(({ component, props }) => component.extension(props))
}

/**
 * A stable signature for the extension declarations. Prop changes recreate the
 * editor instance, so extension props are treated as static configuration.
 */
export function extensionSignature(configs: ExtensionConfig[]): string {
  return JSON.stringify(
    configs.map(({ component, props }) => [
      component.extensionName,
      Object.fromEntries(
        Object.entries(props).filter(([, value]) => typeof value !== 'function'),
      ),
    ]),
  )
}
