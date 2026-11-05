import viteReact from '@vitejs/plugin-react'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

// The registry components are tested through the exact import specifiers
// consumers use, so the tests resolve `@/components/blocove/*` and
// `@/lib/blocove/*` through the same tsconfig paths as the docs site.
export default defineConfig({
  plugins: [
    viteReact(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    testTimeout: 15000,
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.{ts,tsx}'],
          environment: 'happy-dom',
          environmentOptions: {
            happyDOM: {
              url: 'http://localhost:3000',
            },
          },
          setupFiles: ['./tests/setup/unit.ts'],
        },
      },
      {
        test: {
          name: 'browser',
          include: ['tests/e2e/**/*.test.{ts,tsx}'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [
              { browser: 'chromium' },
            ],
          },
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Including the whole registry tree keeps untested files in the report at
      // 0%, so a new item without tests fails the gate instead of being ignored.
      include: [
        'src/registry/blocove/**/*.{ts,tsx}',
        'src/lib/registry-catalog.ts',
        'src/lib/docs-commands.ts',
        'src/lib/theme.ts',
        'src/lib/theme-boot.ts',
      ],
      thresholds: {
        'lines': 80,
        'functions': 80,
        'statements': 78,
        'branches': 65,
        'src/registry/blocove/lib/**': {
          lines: 95,
          functions: 90,
          statements: 95,
          branches: 90,
          perFile: true,
        },
        'src/lib/registry-catalog.ts': {
          lines: 95,
          functions: 90,
          branches: 90,
          perFile: true,
        },
        'src/lib/docs-commands.ts': {
          lines: 95,
          functions: 90,
          branches: 90,
          perFile: true,
        },
        'src/lib/theme.ts': {
          lines: 95,
          functions: 90,
          branches: 90,
          statements: 95,
          perFile: true,
        },
        'src/lib/theme-boot.ts': {
          lines: 95,
          functions: 90,
          branches: 90,
          statements: 95,
          perFile: true,
        },
      },
    },
  },
})
