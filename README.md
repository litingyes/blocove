# Folio Registry

A [shadcn/ui registry](https://ui.shadcn.com/docs/registry) that **extends**
[shadcn/ui](https://ui.shadcn.com) for specific scenarios. Folio is not a
replacement for shadcn/ui: it builds on top of it, so shadcn/ui is installed
first and Folio only adds the blocks and tokens it needs.

The default and supported baseline is the shadcn/ui **`b0` preset** (Base UI,
`base-nova` style, neutral palette, Lucide icons, Inter font).

The site is built with [TanStack Start](https://tanstack.com/start) and the
registry itself is plain JSON, so the same items work with the shadcn CLI from a
GitHub address, a URL, or a namespace.

## Requirements

- Node.js >= 22.22
- pnpm >= 11 (`corepack enable` is enough)
- A project already set up with shadcn/ui using the `b0` preset:

  ```bash
  npx shadcn@latest init --preset b0
  ```

## Install items

From a project with `components.json` and shadcn/ui installed:

```bash
# The Folio baseline: official shadcn/ui components used by Folio blocks.
npx shadcn@latest add litingyes/folio/base

# A Folio block, straight from GitHub. No configuration required.
npx shadcn@latest add litingyes/folio/login-01
```

Pin a release for reproducible installs:

```bash
npx shadcn@latest add litingyes/folio/login-01#v0.1.0
```

### Namespace

After the site is deployed, add the registry to `components.json`:

```json
{
  "registries": {
    "@folio": "https://<your-domain>/r/{name}.json"
  }
}
```

or with the CLI:

```bash
npx shadcn@latest registry add @folio=https://<your-domain>/r/{name}.json
```

Then install by namespace:

```bash
npx shadcn@latest add @folio/base
```

> Registry dependencies that point at shadcn/ui use the official item names
> (`button`, `card`, `font-inter`, ...), which the CLI resolves from
> `ui.shadcn.com` using your project style. Dependencies between Folio items use
> GitHub addresses (`litingyes/folio/...`), so resolution works for both GitHub
> and namespace installs. The repository must stay public.

## Items

| Item       | Type             | Description                                                          |
| ---------- | ---------------- | -------------------------------------------------------------------- |
| `base`     | `registry:base`  | Installs the shadcn/ui (b0) primitives Folio extensions compose with |
| `login-01` | `registry:block` | A login form composed from shadcn/ui primitives                      |

`base` ships no files of its own: it declares the official shadcn/ui items
(`font-inter`, `button`, `card`, `input`, `label`) and the npm packages those
components need. Theme tokens stay owned by shadcn/ui and come from your `b0`
initialization; Folio does not overwrite them.

### Upgrading from v0.1

Folio no longer re-ships shadcn/ui primitives. The `button`, `input`, `label`,
`card`, `theme` and `utils` items were removed from `HEAD` because they were
verbatim copies of shadcn/ui. Install the official components instead:

```bash
npx shadcn@latest add button card input label
```

Installs pinned to the `v0.1.0` tag keep working, since tags are immutable.

## Project layout

```txt
registry.json                  # registry catalog entry point (name, homepage, include)
src/registry/folio/
  registry.json                # item definitions, included by the root registry
  blocks/                      # registry:block items (extensions only)
src/components/ui/             # official shadcn/ui components (installed with the CLI)
src/hooks/                     # official shadcn/ui hooks (installed with the CLI)
src/lib/highlighter.tsx        # official shadcn/ui helper (installed with the CLI)
src/routes/                    # TanStack Start site (catalog and item pages)
src/styles.css                 # Tailwind CSS entry (b0 preset theme)
scripts/build-catalog.mjs      # public/r/registry.json -> src/generated/registry.json
scripts/check-preset.mjs       # asserts the project still resolves to the b0 preset
public/r/                      # generated registry JSON (gitignored)
```

- `src/registry/folio/` is the single source of truth for Folio extensions.
- `src/components/ui/`, `src/hooks/` and `src/lib/highlighter.tsx` are vendored
  from shadcn/ui. This repository installs the **full** official component set so
  the whole shadcn/ui surface is available as context for composing new
  extensions. Consumers only install the items they use.

## Local development

```bash
pnpm install         # installs dependencies and the git hooks
pnpm dev             # http://localhost:3000, regenerates public/r first
```

Useful scripts:

| Script                   | Description                                         |
| ------------------------ | --------------------------------------------------- |
| `pnpm registry:build`    | `shadcn build` into `public/r`                      |
| `pnpm registry:prepare`  | Build registry JSON and generate the site catalog   |
| `pnpm registry:validate` | Validate `litingyes/folio` from GitHub              |
| `pnpm preset:check`      | Fail unless the project resolves to the `b0` preset |
| `pnpm typecheck`         | TypeScript                                          |
| `pnpm lint`              | ESLint: lint and formatting                         |
| `pnpm lint:fix`          | ESLint with autofix                                 |
| `pnpm check`             | preset check, typecheck, lint and production build  |

The generated files (`public/r`, `src/generated`) are gitignored. `predev`,
`prebuild` and `pretypecheck` regenerate them automatically.

### Vendored shadcn/ui files

`src/components/ui/**`, `src/hooks/**` and `src/lib/highlighter.tsx` are excluded
from ESLint so they stay identical to upstream and can be updated with
`pnpm exec shadcn add --overwrite`.

To refresh them, run:

```bash
pnpm exec shadcn add --all -y
pnpm run typecheck
```

Upstream `scroll-area.tsx` ships an unused `import * as React from "react"` that
trips `noUnusedLocals`; Folio removes that one line locally. If a refresh adds it
back, delete it again.

### Git hooks

`pnpm install` runs `prepare` and installs the git hooks with
[lefthook](https://lefthook.dev). The `pre-commit` hook runs
[lint-staged](https://github.com/lint-staged/lint-staged), which applies
`eslint --fix` to every staged file and stages the result again, so lint and
formatting errors never reach a commit.

- Skip the hook once with `LEFTHOOK=0 git commit ...` or
  `git commit --no-verify`; CI still runs `pnpm lint`.
- Reinstall the hooks with `pnpm exec lefthook install`.

ESLint is the single source of truth for linting and formatting
([`@antfu/eslint-config`](https://github.com/antfu/eslint-config)).
`.css`, `.md`, `.json` and `.yaml` files are formatted through its `formatters`
integration, and Tailwind class names are kept in canonical order by
`eslint-plugin-better-tailwindcss`.

## Adding an item

Folio only ships extensions. Never copy a shadcn/ui component into the registry:
reference it instead.

1. Put the source files under `src/registry/folio/` (`blocks/`, `hooks/`, ...).
2. Import shadcn/ui components from `@/components/ui/*`. The CLI rewrites those
   imports to the consumer's `ui` alias on install.
3. Add an item to `src/registry/folio/registry.json`. Paths are relative to that
   file:
   ```json
   {
     "name": "settings-dialog",
     "type": "registry:block",
     "title": "Settings Dialog",
     "description": "A settings dialog composed from shadcn/ui primitives.",
     "dependencies": ["cn"],
     "registryDependencies": ["button", "dialog", "field", "input", "label"],
     "files": [
       {
         "path": "blocks/settings-dialog/components/settings-dialog.tsx",
         "type": "registry:component"
       }
     ]
   }
   ```
4. Run `pnpm run registry:prepare` and check `public/r/<name>.json`.
5. Commit the source and item definition, then tag a release.

Conventions:

- List every npm package a file imports in `dependencies`; list official
  shadcn/ui items by their registry name (`button`, `font-inter`, ...) in
  `registryDependencies`; list other Folio items with the GitHub address
  (`litingyes/folio/<item>`).
- Give every item a `title` and `description`; they are surfaced in the catalog
  and are useful for LLM tooling.
- `registry:page` and `registry:file` items require a `target`. Prefer
  framework-agnostic components for blocks.
- `@folio/base` assumes the consumer project is set up with shadcn/ui: Tailwind
  CSS v4, `shadcn/tailwind.css` and the `@theme inline` color mappings.

## Verify an install

```bash
pnpm run preset:check        # project still resolves to b0
pnpm run registry:prepare
pnpm dev
npx shadcn@latest view http://localhost:3000/r/base.json
npx shadcn@latest add --dry-run http://localhost:3000/r/login-01.json
```

For a full end-to-end check, create a throwaway project, run
`npx shadcn@latest init --preset b0`, install `base` and `login-01`, then run its
`typecheck` and `build`.

## Deploy

The build produces static registry JSON in `public/r` plus the TanStack Start
server output. Any host supported by TanStack Start works (Vercel, Netlify,
Cloudflare or a Node server); make sure `/r/*.json` is served publicly.

After the first deploy:

1. Set `homepage` in the root `registry.json` to the public URL.
2. Update the namespace URL in this README and in the site footer.
3. Re-run `pnpm run registry:prepare` and tag a release.

## License

MIT
