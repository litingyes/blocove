import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    // The docs site renders the registry source through the exact import
    // specifiers consumers use, so previews run the shipped code.
    alias: {
      '@/components/ui/editor': fileURLToPath(
        new URL('./src/registry/folio/ui/editor.tsx', import.meta.url),
      ),
      '@/lib/editor-extension': fileURLToPath(
        new URL('./src/registry/folio/lib/editor-extension.ts', import.meta.url),
      ),
    },
  },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart(),
    nitro(),
    viteReact(),
  ],
})

export default config
