import { describe, expect, it } from 'vitest'
import {
  addCommand,
  installCommand,
  itemAddress,
  namespaceAddress,
  packageManagers,
} from '@/lib/docs-commands'

describe('itemAddress', () => {
  it('points at the GitHub addressed registry item', () => {
    expect(itemAddress('rich-text-editor')).toBe('litingyes/blocove/rich-text-editor')
  })
})

describe('namespaceAddress', () => {
  it('uses the @blocove namespace', () => {
    expect(namespaceAddress('code-editor')).toBe('@blocove/code-editor')
  })
})

describe('addCommand', () => {
  it('builds the add command for every package manager', () => {
    expect(packageManagers).toEqual(['pnpm', 'npm', 'yarn', 'bun'])
    expect(addCommand('pnpm', '@blocove/rich-text-editor'))
      .toBe('pnpm dlx shadcn@latest add @blocove/rich-text-editor')
    expect(addCommand('npm', '@blocove/rich-text-editor'))
      .toBe('npx shadcn@latest add @blocove/rich-text-editor')
    expect(addCommand('yarn', '@blocove/rich-text-editor'))
      .toBe('yarn dlx shadcn@latest add @blocove/rich-text-editor')
    expect(addCommand('bun', '@blocove/rich-text-editor'))
      .toBe('bunx --bun shadcn@latest add @blocove/rich-text-editor')
  })
})

describe('installCommand', () => {
  it('builds the install command for every package manager', () => {
    expect(installCommand('pnpm', ['cn', '@tiptap/core@3.32.2']))
      .toBe('pnpm add cn @tiptap/core@3.32.2')
    expect(installCommand('npm', ['cn']))
      .toBe('npm install cn')
    expect(installCommand('yarn', ['cn']))
      .toBe('yarn add cn')
    expect(installCommand('bun', ['cn']))
      .toBe('bun add cn')
  })

  it('returns an empty string when there is nothing to install', () => {
    expect(installCommand('pnpm', [])).toBe('')
  })
})
