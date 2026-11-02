# Folio Registry

A [shadcn/ui registry](https://ui.shadcn.com/docs/registry) for the Folio design
system: components, blocks and theme tokens that are installed as source code
into your project.

The site is built with [TanStack Start](https://tanstack.com/start) and the
registry itself is plain JSON, so the same items work with the shadcn CLI from a
GitHub address, a URL, or a namespace.

## Requirements

- Node.js >= 22.12
- npm

## Install items

From any project with a `components.json` file (run `npx shadcn@latest init`
first if needed):

```bash
# A single item, straight from GitHub. No configuration required.
npx shadcn@latest add litingyes/folio/button

# The whole design system base: theme tokens, primitives and dependencies.
npx shadcn@latest add litingyes/folio/base
```

Pin a release for reproducible installs:

```bash
npx shadcn@latest add litingyes/folio/button#v0.1.0
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

> Registry dependencies between Folio items use GitHub addresses
> (`litingyes/folio/...`), so dependency resolution works for both GitHub and
> namespace installs. The repository must stay public.

## Items

| Item       | Type             | Description                                  |
| ---------- | ---------------- | -------------------------------------------- |
| `base`     | `registry:base`  | Theme, primitives and dependencies in one go |
| `theme`    | `registry:theme` | Light and dark design tokens                 |
| `utils`    | `registry:lib`   | The `cn` class-name helper                   |
| `button`   | `registry:ui`    | Button built on Base UI                      |
| `input`    | `registry:ui`    | Text input built on Base UI                  |
| `label`    | `registry:ui`    | Form label                                   |
| `card`     | `registry:ui`    | Card container and slots                     |
| `login-01` | `registry:block` | A login form composed from Folio primitives  |

The `base` item assumes the consumer project is already set up with shadcn/ui
(Tailwind CSS v4, `shadcn/tailwind.css` and the `@theme inline` color mappings).
`registry:page` items are intentionally not shipped: page targets are
framework-specific, so blocks ship composable components instead.

## Project layout

```txt
registry.json                  # registry catalog entry point (name, homepage, include)
src/registry/folio/
  registry.json                # item definitions, included by the root registry
  ui/                          # registry:ui items
  blocks/                      # registry:block items
  lib/                         # registry:lib items
src/routes/                    # TanStack Start site (catalog and item pages)
scripts/build-catalog.mjs      # public/r/registry.json -> src/generated/registry.json
public/r/                      # generated registry JSON (gitignored)
```

`src/registry/folio/` is the single source of truth. The site reads a catalog
generated from the build output, and consumers install the same source files.

## Local development

```bash
npm install
npm run dev          # http://localhost:3000, regenerates public/r first
```

Useful scripts:

| Script                      | Description                                        |
| --------------------------- | -------------------------------------------------- |
| `npm run registry:build`    | `shadcn build` into `public/r`                     |
| `npm run registry:prepare`  | Build registry JSON and generate the site catalog  |
| `npm run registry:validate` | Validate `litingyes/folio` from GitHub             |
| `npm run typecheck`         | TypeScript                                         |
| `npm run lint`              | ESLint                                             |
| `npm run format`            | Prettier                                           |
| `npm run check`             | typecheck, lint, format check and production build |

The generated files (`public/r`, `src/generated`) are gitignored. `predev`,
`prebuild` and `pretypecheck` regenerate them automatically.

## Adding an item

1. Put the source files under `src/registry/folio/` (`ui/`, `blocks/`, `lib/`,
   `hooks/`).
2. Add an item to `src/registry/folio/registry.json`. Paths are relative to that
   file:
   ```json
   {
     "name": "badge",
     "type": "registry:ui",
     "title": "Badge",
     "description": "A small status indicator.",
     "dependencies": ["cn"],
     "files": [{ "path": "ui/badge.tsx", "type": "registry:ui" }]
   }
   ```
3. Run `npm run registry:prepare` and check `public/r/<name>.json`.
4. Commit the source and item definition, then tag a release.

Conventions:

- Imports inside registry items use the `@/registry/folio/...` path. The CLI
  rewrites them to the consumer's aliases on install.
- List every npm package a file imports in `dependencies`; list Folio items in
  `registryDependencies` using the GitHub address (`litingyes/folio/<item>`).
- Give every item a `title` and `description`; they are surfaced in the catalog
  and are useful for LLM tooling.
- `registry:page` and `registry:file` items require a `target`. Prefer
  framework-agnostic components for blocks.

## Verify an install

```bash
npm run registry:prepare
npm run dev
npx shadcn@latest view http://localhost:3000/r/button.json
npx shadcn@latest add --dry-run http://localhost:3000/r/button.json
```

For a full end-to-end check, create a throwaway project, run
`npx shadcn@latest init`, install `base` and `login-01`, then run its
`typecheck` and `build`.

## Deploy

The build produces static registry JSON in `public/r` plus the TanStack Start
server output. Any host supported by TanStack Start works (Vercel, Netlify,
Cloudflare or a Node server); make sure `/r/*.json` is served publicly.

After the first deploy:

1. Set `homepage` in the root `registry.json` to the public URL.
2. Update the namespace URL in this README and in the site footer.
3. Re-run `npm run registry:prepare` and tag a release.

## License

MIT
