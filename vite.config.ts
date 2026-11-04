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
      '@/components/ui/code-editor/editor': fileURLToPath(
        new URL('./src/registry/blocove/ui/code-editor/editor.tsx', import.meta.url),
      ),
      '@/components/ui/rich-text-editor/editor': fileURLToPath(
        new URL('./src/registry/blocove/ui/rich-text-editor/editor.tsx', import.meta.url),
      ),
      '@/lib/code-editor-extension': fileURLToPath(
        new URL(
          './src/registry/blocove/lib/code-editor-extension.ts',
          import.meta.url,
        ),
      ),
      '@/lib/code-editor-shiki': fileURLToPath(
        new URL(
          './src/registry/blocove/lib/code-editor-shiki.ts',
          import.meta.url,
        ),
      ),
      '@/lib/rich-text-editor-extension': fileURLToPath(
        new URL(
          './src/registry/blocove/lib/rich-text-editor-extension.ts',
          import.meta.url,
        ),
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
