import type { Extensions } from '@tiptap/core'
import { createElement, Fragment } from 'react'
import { describe, expect, it, vi } from 'vitest'
import {
  collectEditorChildren,
  defineExtensionComponent,
  extensionSignature,
  isExtensionComponent,
  resolveExtensions,
} from '@/lib/blocove/rich-text-editor-extension'

interface TestProps {
  label?: string
  onChange?: () => void
}

function makeExtension(name: string, extensions: Extensions = []) {
  return defineExtensionComponent<TestProps>(name, () => extensions)
}

describe('defineExtensionComponent', () => {
  it('annotates the component with its declaration metadata', () => {
    const extension = [{}] as unknown as Extensions
    const component = makeExtension('bold', extension)

    expect(component.displayName).toBe('EditorExtension(bold)')
    expect(component.extensionName).toBe('bold')
    expect(component.extension).toBeTypeOf('function')
    expect(component.extension({})).toBe(extension)
    // Extension components only exist so the editor can collect them.
    expect(component({})).toBeNull()
  })
})

describe('isExtensionComponent', () => {
  it('recognizes declared components and rejects everything else', () => {
    expect(isExtensionComponent(makeExtension('bold'))).toBe(true)
    expect(isExtensionComponent(() => null)).toBe(false)
    expect(isExtensionComponent({ extensionName: 'bold' })).toBe(false)
    expect(isExtensionComponent(null)).toBe(false)
  })
})

describe('collectEditorChildren', () => {
  it('splits extension declarations from renderable content', () => {
    const bold = makeExtension('bold')
    const { extensions, content } = collectEditorChildren(
      createElement(
        Fragment,
        null,
        createElement(bold, { label: 'Bold' }),
        createElement('span', { id: 'toolbar' }),
        'text',
      ),
    )

    expect(extensions).toHaveLength(1)
    expect(extensions[0].component).toBe(bold)
    expect(extensions[0].props.label).toBe('Bold')
    expect(content).toHaveLength(2)
  })

  it('traverses arrays and fragments while preserving declaration order', () => {
    const first = makeExtension('first')
    const second = makeExtension('second')
    const { extensions, content } = collectEditorChildren([
      createElement(first),
      [
        createElement('span', { id: 'slot' }),
        createElement(second),
      ],
      createElement(Fragment, null, 'tail'),
    ])

    expect(extensions.map(config => config.component.extensionName)).toEqual([
      'first',
      'second',
    ])
    expect(content).toHaveLength(2)
  })

  it('skips empty nodes but keeps other renderable values', () => {
    const { extensions, content } = collectEditorChildren([
      null,
      undefined,
      false,
      true,
      0,
      'label',
    ])

    expect(extensions).toHaveLength(0)
    expect(content).toEqual([0, 'label'])
  })

  it('keeps only the first declaration of a duplicated extension', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const first = makeExtension('bold')
    const second = makeExtension('bold')
    const { extensions } = collectEditorChildren([
      createElement(first, { label: 'first' }),
      createElement(second, { label: 'second' }),
    ])

    expect(extensions).toHaveLength(1)
    expect(extensions[0].component).toBe(first)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('Duplicate extension "bold"')
  })
})

describe('resolveExtensions', () => {
  it('calls every factory with its declared props and flattens the result', () => {
    const firstExtension = { name: 'first' } as unknown as Extensions
    const factory = vi.fn(() => firstExtension)
    const component = defineExtensionComponent<TestProps>('probe', factory)

    const resolved = resolveExtensions([
      {
        component,
        props: { label: 'hello' },
      },
    ])

    expect(factory).toHaveBeenCalledWith({ label: 'hello' })
    expect(resolved).toEqual([firstExtension])
  })

  it('keeps only the first extension when two declarations register the same name', () => {
    // Prerequisite declarations are expected, so the duplicate is dropped
    // without reporting it.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const shared = { name: 'textStyle' } as unknown as Extensions[number]
    const color = { name: 'color' } as unknown as Extensions[number]
    const textStyle = defineExtensionComponent('text-style', () => [shared])
    const colorComponent = defineExtensionComponent('color', () => [shared, color])

    const resolved = resolveExtensions([
      { component: textStyle, props: {} },
      { component: colorComponent, props: {} },
    ])

    expect(resolved.map(extension => extension.name)).toEqual(['textStyle', 'color'])
    expect(resolved[0]).toBe(shared)
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('extensionSignature', () => {
  it('serializes extension names and plain props', () => {
    const component = makeExtension('bold')
    const signature = extensionSignature([
      {
        component,
        props: { label: 'Bold' },
      },
    ])

    expect(JSON.parse(signature)).toEqual([
      [
        'bold',
        { label: 'Bold' },
      ],
    ])
  })

  it('ignores function props and stays stable for equal declarations', () => {
    const component = makeExtension('link')
    const first = extensionSignature([
      {
        component,
        props: {
          label: 'Link',
          onClick: () => {},
        },
      },
    ])
    const second = extensionSignature([
      {
        component,
        props: {
          label: 'Link',
          onClick: () => {},
        },
      },
    ])

    expect(first).toBe(second)
    expect(first).not.toContain('onClick')
  })

  it('changes when plain props change', () => {
    const component = makeExtension('heading')
    const first = extensionSignature([
      {
        component,
        props: { level: 1 },
      },
    ])
    const second = extensionSignature([
      {
        component,
        props: { level: 2 },
      },
    ])

    expect(first).not.toBe(second)
  })
})

describe('extensionSignature reference props', () => {
  class FakeDocument {
    update() {}
  }

  function signatureOf(props: Record<string, unknown>) {
    return extensionSignature([
      {
        component: makeExtension('probe'),
        props,
      },
    ])
  }

  it('compares class instances by reference instead of serializing them', () => {
    const first = new FakeDocument()
    const second = new FakeDocument()

    expect(signatureOf({ document: first })).toBe(signatureOf({ document: first }))
    expect(signatureOf({ document: first })).not.toBe(signatureOf({ document: second }))
    // The token identifies the instance; its internals never reach the string.
    expect(signatureOf({ document: first })).toMatch(/"#\d+"/)
  })

  it('survives a circular plain object and a circular instance', () => {
    const circular: Record<string, unknown> = { label: 'loop' }
    circular.self = circular

    const node = new FakeDocument() as FakeDocument & { self?: unknown }
    node.self = node

    expect(() => signatureOf({ circular })).not.toThrow()
    expect(() => signatureOf({ node })).not.toThrow()
    // The walk bails out on an identity token before it can loop forever.
    expect(signatureOf({ circular })).toContain('#')
    expect(signatureOf({ node })).toContain('#')
  })

  it('walks arrays and nested plain objects by value', () => {
    const first = signatureOf({
      users: [
        { id: 'ada' },
        { id: 'alan' },
      ],
      config: { level: 1 },
    })
    const second = signatureOf({
      users: [
        { id: 'ada' },
        { id: 'alan' },
      ],
      config: { level: 1 },
    })
    const changed = signatureOf({
      users: [
        { id: 'ada' },
        { id: 'grace' },
      ],
      config: { level: 1 },
    })

    expect(first).toBe(second)
    expect(first).not.toBe(changed)
    expect(JSON.parse(first)).toEqual([
      [
        'probe',
        {
          users: [
            { id: 'ada' },
            { id: 'alan' },
          ],
          config: { level: 1 },
        },
      ],
    ])
  })

  it('compares a null-prototype object by value', () => {
    const bare = Object.assign(Object.create(null) as Record<string, unknown>, {
      level: 2,
    })

    expect(signatureOf({ options: bare })).toBe(signatureOf({
      options: { level: 2 },
    }))
  })

  it('stops walking past the depth limit', () => {
    const deep = {
      a: {
        b: {
          c: {
            d: { e: 'far-away' },
          },
        },
      },
    }
    const signature = signatureOf(deep)

    expect(signature).not.toContain('far-away')
    expect(signature).toContain('#')
  })

  it('keeps null and primitive props', () => {
    expect(signatureOf({ value: null, limit: 10, flag: true })).toBe(
      '[[\"probe\",{\"value\":null,\"limit\":10,\"flag\":true}]]',
    )
  })
})
