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

/**
 * Keeps the first extension registered under each name.
 *
 * Items declare the extensions they depend on, so the same extension is
 * routinely produced twice: every text style attribute item carries the text
 * style mark, and every list item carries the list item node and the list
 * keymap. That is the intended composition, which is why the duplicate is
 * dropped silently. A declaration that repeats an extension on purpose is
 * reported by `collectEditorChildren` instead.
 */
export function dedupeExtensions(extensions: Extensions): Extensions {
  const registered = new Set<string>()

  return extensions.filter((extension) => {
    if (registered.has(extension.name)) {
      return false
    }

    registered.add(extension.name)
    return true
  })
}

/**
 * Expands the declarations into Tiptap extensions, dropping extensions two
 * declarations both provide.
 */
export function resolveExtensions(configs: ExtensionConfig[]): Extensions {
  return dedupeExtensions(
    configs.flatMap(({ component, props }) => component.extension(props)),
  )
}

// Reference identity for props the signature cannot serialize: a Yjs document,
// a collaboration provider, an awareness instance. They are static
// configuration, so two renders that pass the same object must produce the same
// signature, and different objects must produce different ones.
const identityTokens = new WeakMap<object, number>()
let nextIdentityToken = 0

function identityToken(value: object): string {
  let token = identityTokens.get(value)

  if (token === undefined) {
    nextIdentityToken += 1
    token = nextIdentityToken
    identityTokens.set(value, token)
  }

  return `#${token}`
}

// Plain objects are serialized by value, but only a few levels deep: extension
// props are shallow configuration, and an unbounded walk would follow a graph
// such as a document model into itself.
const maxSignatureDepth = 4

function signatureValue(value: unknown, depth: number): unknown {
  if (typeof value === 'function') {
    return undefined
  }

  if (value === null || typeof value !== 'object') {
    return value
  }

  if (depth >= maxSignatureDepth) {
    return identityToken(value)
  }

  if (Array.isArray(value)) {
    return value.map(item => signatureValue(item, depth + 1))
  }

  const prototype = Object.getPrototypeOf(value)

  if (prototype !== Object.prototype && prototype !== null) {
    return identityToken(value)
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      signatureValue(item, depth + 1),
    ]),
  )
}

/**
 * A stable signature for the extension declarations. Prop changes recreate the
 * editor instance, so extension props are treated as static configuration.
 *
 * Values are compared by value only while they are plain data. Class instances
 * (a Yjs document, a provider) are compared by reference, because serializing
 * them would either throw on the first cycle or embed an unbounded state
 * snapshot in a memo dependency. Functions never take part: callbacks and
 * renderers are expected to be new on every render.
 */
export function extensionSignature(configs: ExtensionConfig[]): string {
  return JSON.stringify(
    configs.map(({ component, props }) => [
      component.extensionName,
      signatureValue(props, 0),
    ]),
  )
}
