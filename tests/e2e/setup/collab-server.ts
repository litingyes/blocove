import { Server } from '@hocuspocus/server'

/**
 * The browser project syncs the collaboration tests through a real Hocuspocus
 * server: the registry items must work against a websocket provider, not only
 * against the in-page transport the docs site falls back to. It listens on a
 * fixed loopback port that the tests connect to.
 */
export const collaborationPort = 4711

let server: Server | undefined

export async function setup() {
  server = new Server({
    name: 'blocove-e2e',
    quiet: true,
  })

  await server.listen(collaborationPort)
}

export async function teardown() {
  await server?.destroy()
  server = undefined
}
