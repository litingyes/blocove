# Blocove Registry

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/brand/blocove-lockup-white.svg" />
  <img src="public/brand/blocove-lockup-black.svg" alt="Blocove" width="240" />
</picture>

A [shadcn/ui registry](https://ui.shadcn.com/docs/registry) that **extends**
[shadcn/ui](https://ui.shadcn.com) for specific scenarios. Blocove is not a
replacement for shadcn/ui: it builds on top of it, so shadcn/ui is installed
first and Blocove only adds the blocks and components it needs.

The default and supported baseline is the shadcn/ui **`b0` preset** (Base UI,
`base-nova` style, neutral palette, Lucide icons, Inter font). The flagship
additions are two editor families: a composable [Tiptap](https://tiptap.dev)
rich text editor, whose shell, nodes and marks are separate registry items with
their own documentation page and whose content is typeset with
[shadcn/typeset](https://ui.shadcn.com/docs/typeset), and a
[CodeMirror](https://codemirror.net) code editor with
[shiki](https://shiki.style) highlighting, split into a shell and composable
extensions.

Items are grouped per editor family. The rich text editor lives under the
`rich-text-editor-*` prefix and installs into `components/blocove/rich-text-editor/`,
the code editor under `code-editor-*` into `components/blocove/code-editor/`, so a
new family can be added next to them without renaming existing items. Blocove owns
its own namespace, so its files never mix with shadcn/ui's `components/ui`.

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
# The Blocove baseline: official shadcn/ui components used by Blocove items.
npx shadcn@latest add litingyes/blocove/base

# The rich text editor shell. It installs the basic nodes as well.
npx shadcn@latest add litingyes/blocove/rich-text-editor

# Add only the nodes and marks you compose into the editor.
npx shadcn@latest add litingyes/blocove/rich-text-editor-heading litingyes/blocove/rich-text-editor-bold
```

Pin a release for reproducible installs:

```bash
npx shadcn@latest add litingyes/blocove/rich-text-editor#v0.2.0
```

### Namespace

After the site is deployed, add the registry to `components.json`:

```json
{
  "registries": {
    "@blocove": "https://blocove.vercel.app/r/{name}.json"
  }
}
```

or with the CLI:

```bash
npx shadcn@latest registry add @blocove=https://blocove.vercel.app/r/{name}.json
```

Then install by namespace:

```bash
npx shadcn@latest add @blocove/rich-text-editor
```

> Registry dependencies that point at shadcn/ui use the official item names
> (`button`, `kbd`, `toggle`, ...), which the CLI resolves from `ui.shadcn.com`
> using your project style. Dependencies between Blocove items use GitHub
> addresses (`litingyes/blocove/...`), so resolution works for both GitHub and
> namespace installs. The repository must stay public.

## Rich text editor

The editor is declarative: each Tiptap node or mark is a component that registers
its extension, and the base editor collects them from its children. The
`rich-text-editor` item installs the shell and the basic nodes; add the nodes and marks
you compose on top.

The family installs into `components/blocove/rich-text-editor/`, so imports are
namespaced: `@/components/blocove/rich-text-editor/editor`,
`@/components/blocove/rich-text-editor/bold`, and so on. The internal helper
installs as `@/lib/blocove/rich-text-editor-extension`.

```tsx
import { EditorBold, EditorBoldToolbar } from '@/components/blocove/rich-text-editor/bold'
import {
  Editor,
  EditorBubbleMenu,
  EditorCharacterCount,
  EditorContent,
  EditorToolbar,
} from '@/components/blocove/rich-text-editor/editor'
import { EditorHardBreak } from '@/components/blocove/rich-text-editor/hard-break'
import { EditorHeading, EditorHeadingToolbar } from '@/components/blocove/rich-text-editor/heading'
import { EditorLink, EditorLinkToolbar } from '@/components/blocove/rich-text-editor/link'
import { EditorParagraph } from '@/components/blocove/rich-text-editor/paragraph'
import { EditorText } from '@/components/blocove/rich-text-editor/text'

export function RichTextEditorExample() {
  return (
    <Editor defaultValue="<h2>Hello</h2><p>Blocove editor</p>">
      <EditorText />
      <EditorParagraph />
      <EditorHardBreak />
      <EditorHeading />
      <EditorBold />
      <EditorLink />

      <EditorToolbar>
        <EditorHeadingToolbar />
        <EditorBoldToolbar />
        <EditorLinkToolbar />
      </EditorToolbar>

      <EditorBubbleMenu>
        <EditorBoldToolbar />
      </EditorBubbleMenu>

      <EditorContent className="min-h-40" />
      <EditorCharacterCount />
    </Editor>
  )
}
```

### Typeset setup

Editor content is wrapped in a shadcn/typeset container. Download the stylesheet
next to your main CSS file, import it after Tailwind, and add the preset:

```bash
curl -o src/typeset.css https://ui.shadcn.com/typeset.css
```

```css
/* src/styles.css */
@import 'tailwindcss';
@import './typeset.css';
@import '@fontsource-variable/inter';
@import '@fontsource-variable/jetbrains-mono';

@theme inline {
  --font-inter: 'Inter Variable', sans-serif;
  --font-jetbrains-mono: 'JetBrains Mono Variable', ui-monospace, monospace;
  --font-mono: 'JetBrains Mono Variable', ui-monospace, monospace;
}

.typeset-docs {
  --typeset-font-body: var(--font-inter);
  --typeset-font-heading: var(--font-inter);
  --typeset-font-mono: var(--font-jetbrains-mono);
  --typeset-size: 16px;
  --typeset-leading: 1.75;
  --typeset-flow: 1.25em;
}
```

`EditorContent` renders `typeset typeset-docs` around the ProseMirror document;
pass `typeset={false}` to opt out. The typeset selectors skip elements with a
`data-slot` attribute, so component chrome keeps its own styles.

### Item graph

- `rich-text-editor` depends on `rich-text-editor-extension` (internal helper),
  `rich-text-editor-text`, `rich-text-editor-paragraph` and `rich-text-editor-hard-break`, plus the
  shadcn/ui primitives used by the toolbar.
- Every node and mark item depends on `rich-text-editor`, so installing one item brings
  a working editor and the basic nodes.
- Nodes: `rich-text-editor-text`, `rich-text-editor-paragraph`, `rich-text-editor-hard-break`,
  `rich-text-editor-heading`, `rich-text-editor-code-block`, `rich-text-editor-details`,
  `rich-text-editor-image`, `rich-text-editor-table`.
- Marks: `rich-text-editor-bold`, `rich-text-editor-italic`, `rich-text-editor-underline`,
  `rich-text-editor-strike`, `rich-text-editor-code`, `rich-text-editor-link`.
- Blocks: `rich-text-editor-playground` composes the shell, every node and every
  mark into one installable editor, so a project can start from a complete
  editor instead of assembling the items itself.

## Code editor

The code editor is declarative in the same way: the shell is a CodeMirror view and
each capability — highlighting, language support, editor chrome — is a separate
item declared as a component inside `<CodeEditor>`. The `code-editor` item installs
the shell; add the extensions you compose on top.

The family installs into `components/blocove/code-editor/`, so imports are
namespaced: `@/components/blocove/code-editor/editor`,
`@/components/blocove/code-editor/shiki`, and so on. The helpers install as
`@/lib/blocove/code-editor-extension` and `@/lib/blocove/code-editor-shiki`.

```tsx
import {
  CodeEditor,
  CodeEditorContent,
  CodeEditorStatusBar,
  CodeEditorToolbar,
} from '@/components/blocove/code-editor/editor'
import { CodeEditorLanguages } from '@/components/blocove/code-editor/languages'
import { CodeEditorLineNumbers } from '@/components/blocove/code-editor/line-numbers'
import { CodeEditorShiki } from '@/components/blocove/code-editor/shiki'

export function CodeEditorExample() {
  return (
    <CodeEditor defaultValue="const answer = 42" language="tsx" className="h-72">
      <CodeEditorShiki />
      <CodeEditorLanguages />
      <CodeEditorLineNumbers />

      <CodeEditorToolbar />
      <CodeEditorContent />
      <CodeEditorStatusBar />
    </CodeEditor>
  )
}
```

The `language` prop on `<CodeEditor>` is shared by the declarations: highlighting
and language support read it unless they set their own. Highlighting is done by
shiki with the `github-light` and `github-dark` themes, following the page color
scheme; language support loads CodeMirror grammars on demand for indentation,
bracket matching and folding. The document is controlled through `value` and
`onChange`, and the shell renders the frame, toolbar, surface and status bar as
separate components.

Pass `readOnly` to render a document that can be selected and copied but not
edited; the status bar labels it and the diff controls keep working.

```tsx
<CodeEditor defaultValue={modified} language="tsx" className="h-72">
  <CodeEditorDiff original={original} />
  <CodeEditorShiki />
  <CodeEditorLanguages />
  <CodeEditorLineNumbers />

  <CodeEditorToolbar>
    <CodeEditorDiffToolbar />
  </CodeEditorToolbar>
  <CodeEditorContent />
  <CodeEditorStatusBar />
</CodeEditor>
```

`code-editor-diff` adds an inline diff view: the document is compared against
`original`, and the changed and deleted lines are themed with the editor tokens
in both color schemes. `CodeEditorDiffToolbar` turns the toolbar into a review
surface: previous and next change (wrapping around) with the position and the
added and removed line counts, accept or reject for the chunk under the cursor,
accept or reject for every remaining chunk, and a reset once nothing is left.
Keyboard: `Mod Alt Down` and `Mod Alt Up` move between changes, `Mod Enter`
accepts and `Shift Mod Enter` rejects the chunk under the cursor; pass
`shortcuts={false}` to leave the bindings to the consumer. Accepting moves the
comparison base forward, rejecting restores the buffer from it, so both keep
working in a `readOnly` editor; `labels` localizes the per-chunk controls.

### Code editor item graph

- `code-editor` depends on `code-editor-extension` (internal helper) and the
  shadcn/ui primitives used by the toolbar and status bar.
- `code-editor-shiki`, `code-editor-languages` and `code-editor-line-numbers`
  depend on `code-editor-extension`; combine them with the shell.
- `code-editor-diff` depends on `code-editor` (it reuses the toolbar button) and
  on the `separator` primitive, and adds the themed diff view plus the review
  toolbar.
- `code-editor-shiki` also installs `lib/blocove/code-editor-shiki.ts`, the shiki
  highlighter shared by the docs code panels and the editor.

## Items

| Item                          | Type             | Description                                                            |
| ----------------------------- | ---------------- | ---------------------------------------------------------------------- |
| `base`                        | `registry:base`  | Installs the shadcn/ui (b0) primitives Blocove extensions compose with |
| `rich-text-editor`            | `registry:ui`    | Rich text editor shell: root, content, toolbar, bubble menu and count  |
| `rich-text-editor-playground` | `registry:block` | Complete editor block: every node, mark, control and the count         |
| `rich-text-editor-extension`  | `registry:lib`   | Internal helper for declaring Tiptap extensions as components          |
| `rich-text-editor-text`       | `registry:ui`    | Tiptap Text node                                                       |
| `rich-text-editor-paragraph`  | `registry:ui`    | Tiptap Paragraph node                                                  |
| `rich-text-editor-hard-break` | `registry:ui`    | Tiptap HardBreak node                                                  |
| `rich-text-editor-heading`    | `registry:ui`    | Heading node and toolbar selector                                      |
| `rich-text-editor-code-block` | `registry:ui`    | Code block node and toolbar toggle                                     |
| `rich-text-editor-details`    | `registry:ui`    | Collapsible details node with a React node view                        |
| `rich-text-editor-image`      | `registry:ui`    | Image node and URL insert control                                      |
| `rich-text-editor-table`      | `registry:ui`    | Table kit and command menu                                             |
| `rich-text-editor-bold`       | `registry:ui`    | Bold mark and toolbar toggle                                           |
| `rich-text-editor-italic`     | `registry:ui`    | Italic mark and toolbar toggle                                         |
| `rich-text-editor-underline`  | `registry:ui`    | Underline mark and toolbar toggle                                      |
| `rich-text-editor-strike`     | `registry:ui`    | Strikethrough mark and toolbar toggle                                  |
| `rich-text-editor-code`       | `registry:ui`    | Inline code mark and toolbar toggle                                    |
| `rich-text-editor-link`       | `registry:ui`    | Link mark and URL popover                                              |
| `code-editor`                 | `registry:ui`    | Code editor shell: root, surface, toolbar and status bar               |
| `code-editor-extension`       | `registry:lib`   | Internal helper for declaring CodeMirror extensions as components      |
| `code-editor-shiki`           | `registry:ui`    | Shiki syntax highlighting for the editor                               |
| `code-editor-languages`       | `registry:ui`    | CodeMirror language support for indentation, brackets and folding      |
| `code-editor-line-numbers`    | `registry:ui`    | Line numbers, fold gutter and active line highlight                    |
| `code-editor-diff`            | `registry:ui`    | Inline diff view with accept, reject and chunk navigation              |

Every Blocove file declares an explicit `target`, so items install into the
Blocove namespace instead of shadcn/ui's `ui` alias: the `rich-text-editor-*` and
`code-editor-*` UI items land in `components/blocove/rich-text-editor/` and
`components/blocove/code-editor/`, and the helpers in `lib/blocove/`. Projects
that use a `src` directory get the same paths under `src/`.

The block ships `blocks/rich-text-editor-playground.tsx`. It targets
`components/blocove/rich-text-editor-playground.tsx`; it depends on the shell and
every node and mark item, so a single install produces a complete editor.

`base` ships no files of its own: it declares the official shadcn/ui items
(`font-inter`, `button`, `card`, `input`, `label`) and the npm packages those
components need. Theme tokens stay owned by shadcn/ui and come from your `b0`
initialization; Blocove does not overwrite them.

`rich-text-editor-extension` is internal: it is installed as a dependency of the
rich text editor items and is hidden from the site catalog and documentation
navigation.

### Upgrading from v0.1

Blocove no longer re-ships shadcn/ui primitives. The `button`, `input`, `label`,
`card`, `theme` and `utils` items were removed from `HEAD` because they were
verbatim copies of shadcn/ui. Install the official components instead:

```bash
npx shadcn@latest add button card input label
```

Installs pinned to the `v0.1.0` tag keep working, since tags are immutable.

The rich text editor items were renamed to the `rich-text-editor-*` family (previously
`editor`, `editor-bold`, ...) and the `login-01` block was removed before the
`v0.2.0` release. Nothing was tagged with the old names, so no aliases are kept
and `/r/editor*.json` URLs no longer exist.

### Upgrading install paths

Blocove items no longer install into shadcn/ui's `components/ui` namespace:

| Before                                       | After                                                |
| -------------------------------------------- | ---------------------------------------------------- |
| `components/ui/rich-text-editor/<name>.tsx`  | `components/blocove/rich-text-editor/<name>.tsx`     |
| `components/ui/code-editor/<name>.tsx`       | `components/blocove/code-editor/<name>.tsx`          |
| `components/rich-text-editor-playground.tsx` | `components/blocove/rich-text-editor-playground.tsx` |
| `lib/rich-text-editor-extension.ts`          | `lib/blocove/rich-text-editor-extension.ts`          |
| `lib/code-editor-extension.ts`               | `lib/blocove/code-editor-extension.ts`               |
| `lib/code-editor-shiki.ts`                   | `lib/blocove/code-editor-shiki.ts`                   |

Re-run `shadcn add` for the items you use, delete the files left at the old
paths, and update the imports. shadcn/ui primitives keep their `components/ui`
paths.

## Project layout

```txt
registry.json                     # registry catalog entry point (name, homepage, include)
src/registry/blocove/
  registry.json                   # item definitions, included by the root registry
  lib/code-editor-extension.ts          # registry:lib helper for the code editor family
  lib/code-editor-shiki.ts              # registry:lib shiki highlighter for the code editor
  lib/rich-text-editor-extension.ts     # registry:lib helper for the rich text editor family
  ui/code-editor/                       # registry:ui items (shell, highlighting, languages, chrome)
  ui/rich-text-editor/                  # registry:ui items (shell, nodes, marks)
  blocks/rich-text-editor-playground.tsx # registry:block item (complete editor)
src/docs/
  types.ts                        # DocsPage and DocsPageData types
  nav.ts                          # docs navigation, grouped per editor family
  pages/                          # docs pages, auto-registered from the module tree
  examples/                       # demo components shown on each page
  snippets/                       # generated usage snippets for the code panels
src/components/docs/              # docs shell: sidebar, TOC, preview tabs, code block, API
src/typeset.css                   # vendored shadcn/typeset stylesheet
src/lib/docs-commands.ts          # CLI commands used by the installation section
src/lib/docs-markdown.ts          # Copy Page markdown and the .md endpoint
src/lib/download-file.ts          # code panel download file names and blobs
src/lib/registry-source.ts        # raw registry sources for the manual install
src/components/ui/                # official shadcn/ui components (installed with the CLI)
src/hooks/                        # official shadcn/ui hooks (installed with the CLI)
src/lib/highlighter.tsx           # official shadcn/ui helper (installed with the CLI)
src/routes/                       # TanStack Start site (home, item pages, .md endpoint)
src/styles.css                    # Tailwind CSS entry (b0 preset theme + typeset)
scripts/build-catalog.mjs         # public/r/registry.json -> src/generated/registry.json
scripts/clean-registry.mjs        # clears generated registry artifacts before a build
scripts/check-preset.mjs          # asserts the project still resolves to the b0 preset
scripts/check-registry-paths.mjs   # asserts every item targets the Blocove namespace
public/r/                         # generated registry JSON (gitignored)
```

- `src/registry/blocove/` is the single source of truth for Blocove extensions.
  Items are grouped by family: the rich text editor lives in
  `ui/rich-text-editor/`, the complete editor block in `blocks/`, the code editor
  in `ui/code-editor/`, and a new family gets its own folder and item prefix.
  Every shipped file declares a `target` under `components/blocove/...` or
  `lib/blocove/...`.
- `src/components/ui/`, `src/hooks/` and `src/lib/highlighter.tsx` are vendored
  from shadcn/ui. This repository installs the **full** official component set so
  the whole shadcn/ui surface is available as context for composing new
  extensions. Consumers only install the items they use.
- `src/typeset.css` is vendored verbatim from shadcn/ui and excluded from ESLint
  as well, so refreshing it is a file copy.

### Demo aliases

Docs demos import registry files through the repository path
(`@/registry/blocove/ui/rich-text-editor/bold`). The shipped items themselves use the
exact paths consumers get (`@/components/blocove/rich-text-editor/*`,
`@/components/blocove/code-editor/*`, `@/lib/blocove/*`), so the site resolves
those specifiers to the registry sources in `tsconfig.json` and
`vite.config.ts`. The family mappings cover every node and mark, which is what
lets the playground block run its shipped imports in the docs preview. Add a
mapping there when a registry item imports another item that has no local file
under `src/components/ui` or `src/lib`.

## Local development

```bash
pnpm install         # installs dependencies and the git hooks
pnpm dev             # http://localhost:3000, regenerates public/r first
```

Useful scripts:

| Script                   | Description                                            |
| ------------------------ | ------------------------------------------------------ |
| `pnpm registry:build`    | Clear `public/r` and run `shadcn build`                |
| `pnpm registry:check`    | Fail unless every item targets the Blocove namespace   |
| `pnpm registry:prepare`  | Build registry JSON, check paths, generate the catalog |
| `pnpm registry:validate` | Validate `litingyes/blocove` from GitHub               |
| `pnpm preset:check`      | Fail unless the project resolves to the `b0` preset    |
| `pnpm typecheck`         | TypeScript                                             |
| `pnpm lint`              | ESLint: lint and formatting                            |
| `pnpm lint:fix`          | ESLint with autofix                                    |
| `pnpm check`             | preset check, typecheck, lint and production build     |

The generated files (`public/r`, `src/generated`) are gitignored. `predev`,
`prebuild` and `pretypecheck` regenerate them automatically.

### Vendored shadcn/ui files

`src/components/ui/**`, `src/hooks/**` and `src/lib/highlighter.tsx` are excluded
from ESLint so they stay identical to upstream and can be updated with
`pnpm exec shadcn add --overwrite`. `src/typeset.css` is excluded for the same
reason.

To refresh the components, run:

```bash
pnpm exec shadcn add --all -y
pnpm run typecheck
```

Upstream `scroll-area.tsx` ships an unused `import * as React from "react"` that
trips `noUnusedLocals`; Blocove removes that one line locally. If a refresh adds it
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

Blocove only ships extensions. Never copy a shadcn/ui component into the registry:
reference it instead.

1. Put the source files under `src/registry/blocove/` (`lib/`, `ui/`, `blocks/`, ...).
2. Import shadcn/ui components from `@/components/ui/*` and other Blocove items
   from `@/components/blocove/*` or `@/lib/blocove/*`. The CLI rewrites those
   specifiers to the consumer's aliases on install.
3. Add an item to `src/registry/blocove/registry.json`. Paths are relative to that
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
         "type": "registry:component",
         "target": "components/blocove/settings-dialog.tsx"
       }
     ]
   }
   ```
   Every shipped file needs an explicit `target` under `components/blocove/` or
   `lib/blocove/`; `pnpm registry:check` enforces it.
4. Run `pnpm run registry:prepare` and check `public/r/<name>.json`.
5. Commit the source and item definition, then tag a release.

### Adding a rich text editor extension

1. Create `src/registry/blocove/ui/rich-text-editor/<name>.tsx`.
2. Declare the extension with the shared helper:
   ```tsx
   import { Heading } from '@tiptap/extension-heading'
   import { defineExtensionComponent } from '@/lib/blocove/rich-text-editor-extension'

   export const EditorHeading = defineExtensionComponent('heading', props => [
     Heading.configure(props),
   ])
   ```
3. Export a toolbar control when the extension needs one. Controls use
   `useCurrentEditor()` and `EditorToolbarButton` from
   `@/components/blocove/rich-text-editor/editor`; guard the null editor, then read active
   state in an inner component with `useEditorState`.
4. Add the item to `src/registry/blocove/registry.json` with
   `type: "registry:ui"`, path `ui/rich-text-editor/<name>.tsx` and
   `target: "components/blocove/rich-text-editor/<name>.tsx"`, the Tiptap package in
   `dependencies`, and `registryDependencies: ["litingyes/blocove/rich-text-editor"]`
   plus the shadcn/ui primitives the control uses.
5. Document it:
   - demo: `src/docs/examples/rich-text-editor/<name>.tsx`, composing
     `RichTextEditorDemoFrame` from `src/docs/examples/rich-text-editor/frame.tsx`;
   - data: `src/docs/pages/rich-text-editor/<name>.ts` exporting a `docsPage` with the
     item name and `richTextEditorUsage(...)` as the example code. Pages are
     auto-registered from the module tree, so no index edit is needed;
   - add the item name to `src/docs/nav.ts` under the `Rich Text Editor` section.
6. Run `pnpm run typecheck`, `pnpm run lint` and `pnpm run build`.

### Adding a code editor extension

1. Create `src/registry/blocove/ui/code-editor/<name>.tsx`.
2. Declare the CodeMirror extension with the shared helper:
   ```tsx
   import { lineNumbers } from '@codemirror/view'
   import { defineCodeEditorExtension } from '@/lib/blocove/code-editor-extension'

   export const CodeEditorNumbers = defineCodeEditorExtension('numbers', () => [
     lineNumbers(),
   ])
   ```
3. The factory receives the declaration props and the editor root context, so a
   declaration can fall back to the `language` set once on `<CodeEditor>`.
4. Add the item to `src/registry/blocove/registry.json` with
   `type: "registry:ui"`, path `ui/code-editor/<name>.tsx` and
   `target: "components/blocove/code-editor/<name>.tsx"`, the CodeMirror or
   shiki packages in `dependencies`, and
   `registryDependencies: ["litingyes/blocove/code-editor-extension"]` plus the
   shadcn/ui primitives the declaration renders.
5. Document it:
   - demo: `src/docs/examples/code-editor/<name>.tsx`, composing
     `CodeEditorDemoFrame` from `src/docs/examples/code-editor/frame.tsx`;
   - data: `src/docs/pages/code-editor/<name>.ts` exporting a `docsPage` with the
     item name and `codeEditorUsage(...)` as the example code. Pages are
     auto-registered from the module tree, so no index edit is needed;
   - add the item name to `src/docs/nav.ts` under the `Code Editor` section.
6. Run `pnpm run typecheck`, `pnpm run lint` and `pnpm run build`.

To add a whole editor family, give it its own folder (`ui/<family>/`), item
prefix, docs section in `src/docs/nav.ts`, demo frame and snippet builder. The
rich text editor and code editor items are unaffected.

Conventions:

- List every npm package a file imports in `dependencies`; list official
  shadcn/ui items by their registry name (`button`, `font-inter`, ...) in
  `registryDependencies`; list other Blocove items with the GitHub address
  (`litingyes/blocove/<item>`).
- Give every item a `title` and `description`; they are surfaced in the catalog
  and are useful for LLM tooling.
- Every Blocove file sets an explicit `target`: UI and block files under
  `components/blocove/`, lib helpers under `lib/blocove/`. This keeps Blocove
  items out of shadcn/ui's `components/ui` namespace; `pnpm registry:check`
  fails the build when a file drifts.
- `registry:page` and `registry:file` items require a `target`.
- `@blocove/base` assumes the consumer project is set up with shadcn/ui: Tailwind
  CSS v4, `shadcn/tailwind.css` and the `@theme inline` color mappings.

## Docs site

- `/` introduces the project: the extension philosophy, the features, the quick
  start commands and links into the docs. It does not list every item.
- `/items/<name>` renders the standard shadcn/ui docs layout: title and
  description, a demo with Preview and Code tabs, installation (Command and
  Manual tabs with pnpm/npm/yarn/bun commands), usage snippets and an API
  reference table. The code panel uses the shadcn/ui code block with copy,
  download and a line-wrap toggle.
- `/items/<name>.md` answers with the page as plain markdown, exactly what Copy
  Page copies. The Copy Page split button opens it through “View as Markdown”.
  The suffix is part of the route segment, so `.md` requests never render the
  item page.
- The left navigation groups pages per editor family: `Base`, `Rich Text Editor`
  and `Code Editor`. The rich text editor family starts with its complete block
  and the shell (no group label), then lists `Nodes` and `Marks`; other families
  lead with an overview and their extensions. A new family is another section,
  not a second nav tree. The right column tracks the current section.
- Docs data lives in `src/docs/pages/` (auto-registered, one module per item),
  demos in `src/docs/examples/`. Code panels are generated by the per-family
  snippet builders in `src/docs/snippets/`, so every page shows the same
  composition and the imports match what the CLI installs. The playground page
  shows the shipped block source instead of a generated snippet.
- The installation section reads the built registry JSON, so the commands, file
  targets and dependency lists always match what `shadcn add` installs.

## Verify an install

```bash
pnpm run preset:check        # project still resolves to b0
pnpm run registry:prepare
pnpm dev

npx shadcn@latest view http://localhost:3000/r/rich-text-editor.json  # targets: components/blocove/...
npx shadcn@latest add --dry-run http://localhost:3000/r/rich-text-editor.json
npx shadcn@latest add --dry-run http://localhost:3000/r/rich-text-editor-heading.json
npx shadcn@latest add --dry-run http://localhost:3000/r/rich-text-editor-table.json
npx shadcn@latest add --dry-run http://localhost:3000/r/rich-text-editor-playground.json

curl -sS http://localhost:3000/items/rich-text-editor-playground.md | head
```

For a full end-to-end check, create a throwaway project, run
`npx shadcn@latest init --preset b0`, install `rich-text-editor-playground` (or
`rich-text-editor` plus the nodes and marks you need), add typeset, then run its
`typecheck` and `build`.

## Deploy

The build produces static registry JSON in `public/r` plus the TanStack Start
server output. Any host supported by TanStack Start works (Vercel, Netlify,
Cloudflare or a Node server); make sure `/r/*.json` is served publicly.

The public site is [blocove.vercel.app](https://blocove.vercel.app). The
`@blocove` namespace resolves items from
`https://blocove.vercel.app/r/{name}.json`. If the domain changes, update the
root registry `homepage` and the namespace URLs together, then re-run
`pnpm run registry:prepare`.

## License

MIT
