import type { Plugin } from 'vite'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

/**
 * TanStack Start hydrates through `<StrictMode>` in development. Video.js 10.3.0
 * loops inside its menu state when the player's layout effects run twice, which
 * unmounts the whole page (videojs/video.js#9261, still open). The docs previews
 * render the shipped registry source, so the dev entry is served with a
 * passthrough element instead of StrictMode until the upstream fix lands.
 * Production builds never double-invoke effects, so nothing changes there.
 */
function relaxStrictMode(): Plugin {
  return {
    name: 'blocove:relax-strict-mode',
    apply: 'serve',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('default-entry/client')) {
        return null
      }

      return code.replace(
        `import { StrictMode, startTransition } from 'react'`,
        `import { Fragment as StrictMode, startTransition } from 'react'`,
      )
    },
  }
}

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    // The docs site renders the registry source through the exact import
    // specifiers consumers use, so previews run the shipped code.
    alias: {
      '@/components/blocove/rich-text-editor': fileURLToPath(
        new URL('./src/registry/blocove/ui/rich-text-editor', import.meta.url),
      ),
      '@/components/blocove/code-editor': fileURLToPath(
        new URL('./src/registry/blocove/ui/code-editor', import.meta.url),
      ),
      '@/components/blocove/media': fileURLToPath(
        new URL('./src/registry/blocove/ui/media', import.meta.url),
      ),
      '@/lib/blocove': fileURLToPath(
        new URL('./src/registry/blocove/lib', import.meta.url),
      ),
    },
  },
  plugins: [
    devtools(),
    tailwindcss(),
    relaxStrictMode(),
    tanstackStart(),
    nitro(),
    viteReact(),
  ],
})

export default config
