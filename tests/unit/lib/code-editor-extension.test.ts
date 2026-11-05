import type { Extension } from '@codemirror/state'
import { createElement, Fragment } from 'react'
import { describe, expect, it, vi } from 'vitest'
import {
  codeEditorExtensionSignature,
  collectCodeEditorChildren,
  defineCodeEditorExtension,
  isCodeEditorExtensionComponent,
  resolveCodeEditorExtensions,
} from '@/lib/blocove/code-editor-extension'
import { isExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'

interface TestProps {
  language?: string
  onChange?: () => void
}

function makeExtension(name: string, extensions: Extension[] = []) {
  return defineCodeEditorExtension<TestProps>(name, () => extensions)
}

describe('defineCodeEditorExtension', () => {
  it('annotates the component with its declaration metadata', () => {
    const component = makeExtension('line-numbers')

    expect(component.displayName).toBe('CodeEditorExtension(line-numbers)')
    expect(component.extensionName).toBe('line-numbers')
    expect(component.extension).toBeTypeOf('function')
    expect(component({})).toBeNull()
  })
})

describe('isCodeEditorExtensionComponent', () => {
  it('recognizes declared components and rejects everything else', () => {
    expect(isCodeEditorExtensionComponent(makeExtension('diff'))).toBe(true)
    expect(isCodeEditorExtensionComponent(() => null)).toBe(false)
    expect(isCodeEditorExtensionComponent({ extensionName: 'diff' })).toBe(false)
  })

  it('does not recognize rich text editor declarations', () => {
    const richText = Object.assign(() => null, { extensionName: 'bold' })
    Object.defineProperty(richText, Symbol.for('blocove.rich-text-editor.extension-component'), {
      value: true,
    })

    expect(isCodeEditorExtensionComponent(richText)).toBe(false)
    expect(isExtensionComponent(makeExtension('diff'))).toBe(false)
  })
})

describe('collectCodeEditorChildren', () => {
  it('splits extension declarations from renderable chrome', () => {
    const shiki = makeExtension('shiki')
    const { extensions, content } = collectCodeEditorChildren(
      createElement(
        Fragment,
        null,
        createElement(shiki, { language: 'tsx' }),
        createElement('div', { id: 'toolbar' }),
      ),
    )

    expect(extensions).toHaveLength(1)
    expect(extensions[0].component).toBe(shiki)
    expect(extensions[0].props.language).toBe('tsx')
    expect(content).toHaveLength(1)
  })

  it('traverses arrays and fragments while preserving declaration order', () => {
    const first = makeExtension('first')
    const second = makeExtension('second')
    const { extensions } = collectCodeEditorChildren([
      createElement(first),
      [
        createElement(second),
      ],
    ])

    expect(extensions.map(config => config.component.extensionName)).toEqual([
      'first',
      'second',
    ])
  })

  it('keeps only the first declaration of a duplicated extension', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const first = makeExtension('diff')
    const second = makeExtension('diff')
    const { extensions } = collectCodeEditorChildren([
      createElement(first),
      createElement(second),
    ])

    expect(extensions).toHaveLength(1)
    expect(extensions[0].component).toBe(first)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('Duplicate extension "diff"')
  })
})

describe('resolveCodeEditorExtensions', () => {
  it('passes the editor context to the extension factories', () => {
    const extension = { language: 'tsx' } as unknown as Extension
    const factory = vi.fn(() => [extension])
    const component = defineCodeEditorExtension<TestProps>('languages', factory)

    const resolved = resolveCodeEditorExtensions(
      [
        { component, props: {} },
      ],
      { language: 'tsx' },
    )

    expect(factory).toHaveBeenCalledWith({}, { language: 'tsx' })
    expect(resolved).toEqual([extension])
  })

  it('defaults the context to an empty object', () => {
    const factory = vi.fn(() => [] as Extension[])
    const component = defineCodeEditorExtension('plain', factory)

    resolveCodeEditorExtensions([
      { component, props: {} },
    ])

    expect(factory).toHaveBeenCalledWith({}, {})
  })
})

describe('codeEditorExtensionSignature', () => {
  it('ignores function props and changes with plain props', () => {
    const component = makeExtension('shiki')
    const first = codeEditorExtensionSignature([
      {
        component,
        props: {
          language: 'tsx',
          onChange: () => {},
        },
      },
    ])
    const second = codeEditorExtensionSignature([
      {
        component,
        props: {
          language: 'tsx',
          onChange: () => {},
        },
      },
    ])
    const changed = codeEditorExtensionSignature([
      {
        component,
        props: { language: 'css' },
      },
    ])

    expect(first).toBe(second)
    expect(first).not.toContain('onChange')
    expect(first).not.toBe(changed)
  })
})
