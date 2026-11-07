import { render, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ShellCommand } from '@/components/docs/shell-command'
import { addCommand, itemAddress } from '@/lib/docs-commands'

const command = addCommand('pnpm', itemAddress('rich-text-editor-block'))

function commandElement(container: HTMLElement) {
  const element = container.querySelector<HTMLElement>(
    '[data-slot="shell-command"]',
  )

  if (!element) {
    throw new Error('ShellCommand rendered no command element')
  }

  return element
}

describe('shellCommand', () => {
  it('renders the command verbatim, then highlights it in place', async () => {
    const { container } = render(<ShellCommand command={command} />)
    const element = commandElement(container)

    // The grammar loads lazily: the first paint must already read as the command.
    expect(element.textContent).toBe(command)

    await waitFor(() => {
      expect(element.querySelectorAll('span').length).toBeGreaterThan(1)
    })

    expect(element.textContent).toBe(command)
  })

  it('keeps a multi-line command intact', async () => {
    const multiLine = 'npx shadcn@latest init\nnpx shadcn@latest add code-editor'
    const { container } = render(<ShellCommand command={multiLine} />)
    const element = commandElement(container)

    await waitFor(() => {
      expect(element.querySelectorAll('span').length).toBeGreaterThan(1)
    })

    expect(element.textContent).toBe(multiLine)
  })
})
