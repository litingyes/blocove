import { HocuspocusProvider } from '@hocuspocus/provider'
import { expect, it } from 'vitest'
import { render } from 'vitest-browser-react'
import { page, userEvent } from 'vitest/browser'
import * as Y from 'yjs'
import { RichTextEditorCollaborationBlock } from '@/registry/blocove/blocks/rich-text-editor-collaboration-block'

const serverUrl = 'ws://127.0.0.1:4711'

interface Peer {
  name: string
  color: string
  document: Y.Doc
  provider: HocuspocusProvider
}

function createPeer(room: string, name: string, color: string): Peer {
  const document = new Y.Doc()
  const provider = new HocuspocusProvider({
    url: serverUrl,
    name: room,
    document,
  })
  provider.setAwarenessField('user', { name, color })

  return { name, color, document, provider }
}

function createRoom() {
  return `e2e-${Math.random().toString(36).slice(2)}`
}

function editors() {
  return page.getByRole('textbox', { name: 'Rich text editor' })
}

it('syncs two editors through a real Hocuspocus server', async () => {
  const room = createRoom()
  const ada = createPeer(room, 'Ada Lovelace', '#2563eb')
  const alan = createPeer(room, 'Alan Turing', '#059669')

  try {
    await render(
      <>
        <RichTextEditorCollaborationBlock
          document={ada.document}
          provider={ada.provider}
          user={{ name: ada.name, color: ada.color }}
        />
        <RichTextEditorCollaborationBlock
          document={alan.document}
          provider={alan.provider}
          user={{ name: alan.name, color: alan.color }}
        />
      </>,
    )

    // Both providers connect to the server and advertise their user.
    await expect.element(page.getByText('2 online').first()).toBeVisible()
    await expect.element(page.getByText('Live').first()).toBeVisible()

    await editors().nth(1).click()
    await userEvent.keyboard('Hello from Alan')

    await expect.element(editors().nth(0)).toMatchTextContent(/Hello from Alan/)
  }
  finally {
    ada.provider.destroy()
    alan.provider.destroy()
    ada.document.destroy()
    alan.document.destroy()
  }
})

it('reports offline when the websocket server is unreachable', async () => {
  const room = createRoom()
  const document = new Y.Doc()
  const provider = new HocuspocusProvider({
    url: 'ws://127.0.0.1:4799',
    name: room,
    document,
  })

  try {
    await render(
      <RichTextEditorCollaborationBlock
        document={document}
        provider={provider}
        user={{ name: 'Ada Lovelace', color: '#2563eb' }}
      />,
    )

    // The status item tells the truth instead of pretending the document is
    // shared: an unreachable server settles on "Offline".
    await expect.element(page.getByText('Offline')).toBeVisible()
    await expect.element(page.getByText('Live')).not.toBeInTheDocument()
  }
  finally {
    provider.destroy()
    document.destroy()
  }
})
