import process from 'node:process'
import { Server } from '@hocuspocus/server'

/**
 * The Hocuspocus server behind the collaboration demo.
 *
 * Run it next to the docs site and point the site at it:
 *
 *   pnpm collab:dev
 *   VITE_COLLAB_URL=ws://localhost:1234 pnpm dev
 *
 * Any host that keeps a Node process alive can run this file (Railway, Fly.io,
 * Render, a VPS). A platform that cannot keep a websocket open, or that spreads
 * the peers of one room across instances, is not a fit without the Redis
 * extension.
 */
const port = Number(process.env.COLLAB_PORT ?? 1234)

const server = new Server({
  name: 'blocove-collab',
  quiet: true,
})

await server.listen(port)

console.log(`Hocuspocus is listening on ws://localhost:${port}`)
