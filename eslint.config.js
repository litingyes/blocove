// @ts-check

import antfu from '@antfu/eslint-config'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'

export default antfu(
  {
    type: 'app',
    react: true,
    formatters: {
      css: true,
      markdown: 'prettier',
    },
    ignores: ['src/routeTree.gen.ts'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { 'better-tailwindcss': betterTailwindcss },
    settings: {
      'better-tailwindcss': { entryPoint: 'src/styles.css' },
    },
    rules: {
      // Replaces prettier-plugin-tailwindcss: keep class names in canonical order.
      'better-tailwindcss/enforce-consistent-class-order': 'error',
    },
  },
  {
    // Route files export `Route`, registry components export variants next to
    // components, so the fast-refresh component-only rule does not apply.
    files: ['src/routes/**/*.tsx', 'src/registry/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  {
    // Keep pnpm-workspace.yaml minimal instead of adopting antfu's opinionated
    // pnpm settings (trustPolicy, shellEmulator, ...).
    files: ['pnpm-workspace.yaml'],
    rules: { 'pnpm/yaml-enforce-settings': 'off' },
  },
)
