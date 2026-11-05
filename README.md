# Blocove Registry

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/brand/blocove-lockup-white.svg" />
  <img src="public/brand/blocove-lockup-black.svg" alt="Blocove" width="240" />
</picture>

**Composable editors for shadcn/ui.** A [shadcn/ui registry](https://ui.shadcn.com/docs/registry)
that **extends** [shadcn/ui](https://ui.shadcn.com) instead of replacing it: a
Tiptap rich text editor, a CodeMirror code editor and Video.js audio and video
players, plus the blocks built on them. shadcn/ui is installed first and Blocove
only adds the blocks and components it needs.

Blocove is developed against the shadcn/ui **`b0` preset** (Base UI,
`base-nova` style, neutral palette, Lucide icons, Inter font), but it ships no
theme of its own: no base config, no theme tokens and no fonts. Items inherit
the shadcn/ui setup of the project they are added to, so your own preset and
theme stay in place. The flagship additions are three families: a composable
[Tiptap](https://tiptap.dev) rich text editor, whose shell, nodes and marks are
separate registry items with their own documentation page and whose content is
typeset with [shadcn/typeset](https://ui.shadcn.com/docs/typeset); a
[CodeMirror](https://codemirror.net) code editor with
[shiki](https://shiki.style) highlighting, split into a shell and composable
extensions; and a media family of [Video.js](https://videojs.org) audio and video
players whose skins are themed by the shadcn/ui tokens of the project they are
added to.

Items are grouped per family. The rich text editor lives under the
`rich-text-editor-*` prefix and installs into `components/blocove/rich-text-editor/`,
the code editor under `code-editor-*` into `components/blocove/code-editor/`, and
the media items into `components/blocove/media/`, so a new family can be added
next to them without renaming existing items. Blocove owns its own namespace, so
its files never mix with shadcn/ui's `components/ui`.

The site is built with [TanStack Start](https://tanstack.com/start) and the
registry itself is plain JSON, so the same items work with the shadcn CLI from a
GitHub address, a URL, or a namespace.

## Requirements

- Node.js >= 22.22
- pnpm >= 11 (`corepack enable` is enough)
- Chromium for the browser tests: `pnpm exec playwright install chromium`
  (one-off; Playwright only drives Vitest's browser mode)
- A project already set up with shadcn/ui using Base UI primitives. Blocove is
  developed against the `b0` preset but ships no theme, so your own preset and
  colors stay in place:

  ```bash
  npx shadcn@latest init --preset b0
  ```

## Install items

From a project with `components.json` and shadcn/ui installed:

```bash
# The rich text editor shell. It installs the basic nodes as well.
npx shadcn@latest add litingyes/blocove/rich-text-editor

# Add only the nodes and marks you compose into the editor.
npx shadcn@latest add litingyes/blocove/rich-text-editor-heading litingyes/blocove/rich-text-editor-bold

# A video player with the themed Video.js skin, or the hero block around it.
npx shadcn@latest add litingyes/blocove/video-player
npx shadcn@latest add litingyes/blocove/video-hero
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

Pass `mode="split"` to render the two documents side by side instead: the editor
content stays on the right and `original` on the left, and `revertControls`
(default `'a-to-b'`) adds a control between the panes that copies a chunk across.
Navigation and the change counter keep working in both modes; the accept and
reject actions are hidden in split, where reverting happens between the panes.

### Code editor item graph

- `code-editor` depends on `code-editor-extension` (internal helper) and the
  shadcn/ui primitives used by the toolbar and status bar.
- `code-editor-shiki`, `code-editor-languages` and `code-editor-line-numbers`
  depend on `code-editor-extension`; combine them with the shell.
- `code-editor-diff` depends on `code-editor` (it reuses the toolbar button) and
  `code-editor-extension` (it replaces the editor surface when rendering side by
  side), and on the `separator` primitive; it adds the themed diff view plus the
  review toolbar.
- `code-editor-shiki` also installs `lib/blocove/code-editor-shiki.ts`, the shiki
  highlighter shared by the docs code panels and the editor.

## Media

Video and audio come as small composable items built on [Video.js 10](https://videojs.org)
(`@videojs/react`). A shell owns the Video.js player and its packaged skin, the
media element is a separate item, and the skin is themed through the settings the
packaged skins publish: the radius, hairline, font and scale are mapped from your
shadcn/ui tokens, while the accent keeps the skin's contrasting default unless you
pass `accentColor`.

The family installs into `components/blocove/media/`, so imports are namespaced:
`@/components/blocove/media/video`, `@/components/blocove/media/audio`,
`@/components/blocove/media/ambient-video`, and the two internal helpers in
`@/lib/blocove/media-theme` and `@/components/blocove/media/tracks`.

```tsx
import { VideoMedia, VideoPlayer } from '@/components/blocove/media/video'

export function Clip() {
  return (
    <VideoPlayer title="Episode one" poster="/poster.jpg">
      <VideoMedia src="/clip.mp4" />
    </VideoPlayer>
  )
}
```

`VideoPlayer` is the Video.js video preset and its skin; `VideoMedia` is the
native `<video>` element. Because the media element registers itself with the
player on mount, the shell never needs to change when the source does, and
`tracks` on the media element becomes the captions menu:

```tsx
<VideoPlayer title="Captioned clip" aspectRatio="video">
  <VideoMedia
    src="/clip.mp4"
    tracks={[
      {
        src: '/captions.vtt',
        label: 'English',
        srcLang: 'en',
        default: true
      }
    ]}
  />
</VideoPlayer>
```

`audio-player` pairs `AudioPlayer` with `AudioMedia` and a skin that follows the
inherited `color-scheme`, so a dark page gets a dark player. `ambient-video`
renders the chrome-less background preset — muted, looped and autoplaying — with
a slot for the content drawn over it.

The items pass the aspect ratio, the accent and the object fit as props, and
forward `className`/`style` to the skin, which is the only styling surface the
packaged skins consider public.

### Media item graph

- `video-player` depends on `media-theme` and `media-tracks` (internal helpers),
  `@videojs/react` and `cn`.
- `audio-player` depends on the same helpers, plus `@videojs/react`.
- `ambient-video` depends on `media-theme` and `@videojs/react`.
- `video-hero` depends on `ambient-video` and the `badge` primitive.
- `video-showcase` depends on `video-player`, `media-tracks`, `badge` and
  `separator`.
- `audio-episode-player` depends on `audio-player`, `badge` and `separator`.
- `video-playlist` depends on `video-player` and `scroll-area`.

### Sample media

`public/media/` holds the sample clips the docs demos and the browser suite play.
They are committed so the docs and the tests run without a network request.
`scripts/generate-media-samples.mjs` regenerates them with ffmpeg
(`node scripts/generate-media-samples.mjs`):

- `sample-video.mp4`, `sample-video-alt.mp4` and `sample-audio.m4a` are the
  documentation previews: H.264/AAC, which every desktop browser decodes.
- `sample-video.webm`, `sample-video-alt.webm` and `sample-audio.webm` are for the
  browser suite: the Chromium build Vitest drives ships no H.264 or AAC decoder,
  so the tests play VP9/Opus.
- `sample-poster.jpg`, `sample-poster-alt.jpg` and `sample-cover.jpg` are frames
  of those clips, so previews stay visually consistent, and
  `sample-captions.vtt` backs the captions demos.

## Items

| Item                          | Type             | Description                                                           |
| ----------------------------- | ---------------- | --------------------------------------------------------------------- |
| `rich-text-editor`            | `registry:ui`    | Rich text editor shell: root, content, toolbar, bubble menu and count |
| `rich-text-editor-playground` | `registry:block` | Complete editor block: every node, mark, control and the count        |
| `rich-text-editor-extension`  | `registry:lib`   | Internal helper for declaring Tiptap extensions as components         |
| `rich-text-editor-text`       | `registry:ui`    | Tiptap Text node                                                      |
| `rich-text-editor-paragraph`  | `registry:ui`    | Tiptap Paragraph node                                                 |
| `rich-text-editor-hard-break` | `registry:ui`    | Tiptap HardBreak node                                                 |
| `rich-text-editor-heading`    | `registry:ui`    | Heading node and toolbar selector                                     |
| `rich-text-editor-code-block` | `registry:ui`    | Code block node and toolbar toggle                                    |
| `rich-text-editor-details`    | `registry:ui`    | Collapsible details node with a React node view                       |
| `rich-text-editor-image`      | `registry:ui`    | Image node and URL insert control                                     |
| `rich-text-editor-table`      | `registry:ui`    | Table kit and command menu                                            |
| `rich-text-editor-bold`       | `registry:ui`    | Bold mark and toolbar toggle                                          |
| `rich-text-editor-italic`     | `registry:ui`    | Italic mark and toolbar toggle                                        |
| `rich-text-editor-underline`  | `registry:ui`    | Underline mark and toolbar toggle                                     |
| `rich-text-editor-strike`     | `registry:ui`    | Strikethrough mark and toolbar toggle                                 |
| `rich-text-editor-code`       | `registry:ui`    | Inline code mark and toolbar toggle                                   |
| `rich-text-editor-link`       | `registry:ui`    | Link mark and URL popover                                             |
| `code-editor`                 | `registry:ui`    | Code editor shell: root, surface, toolbar and status bar              |
| `code-editor-extension`       | `registry:lib`   | Internal helper for declaring CodeMirror extensions as components     |
| `code-editor-shiki`           | `registry:ui`    | Shiki syntax highlighting for the editor                              |
| `code-editor-languages`       | `registry:ui`    | CodeMirror language support for indentation, brackets and folding     |
| `code-editor-line-numbers`    | `registry:ui`    | Line numbers, fold gutter and active line highlight                   |
| `code-editor-diff`            | `registry:ui`    | Inline or side-by-side diff with accept, revert and chunk navigation  |
| `video-player`                | `registry:ui`    | Video player shell: themed skin, native media and track declarations  |
| `audio-player`                | `registry:ui`    | Audio player shell with a skin that follows the page color scheme     |
| `ambient-video`               | `registry:ui`    | Chrome-less background video with a slot for the content over it      |
| `media-theme`                 | `registry:lib`   | Internal helper mapping shadcn/ui tokens to the skin settings         |
| `media-tracks`                | `registry:ui`    | Internal helper rendering track declarations as native `<track>`s     |
| `video-hero`                  | `registry:block` | Hero section with ambient video, a headline and calls to action       |
| `video-showcase`              | `registry:block` | Captioned video: player, title, description, facts and actions        |
| `audio-episode-player`        | `registry:block` | Podcast episode: cover art, facts, player and actions                 |
| `video-playlist`              | `registry:block` | Video next to a selectable playlist that swaps the media              |

Every Blocove file declares an explicit `target`, so items install into the
Blocove namespace instead of shadcn/ui's `ui` alias: the `rich-text-editor-*`,
`code-editor-*` and media UI items land in `components/blocove/rich-text-editor/`,
`components/blocove/code-editor/` and `components/blocove/media/`, the media
blocks in `components/blocove/`, and the helpers in `lib/blocove/`. Projects that
use a `src` directory get the same paths under `src/`.

The block ships `blocks/rich-text-editor-playground.tsx`. It targets
`components/blocove/rich-text-editor-playground.tsx`; it depends on the shell and
every node and mark item, so a single install produces a complete editor.

Blocove ships no base config: every item installs files into your project and
official shadcn/ui components arrive as that item's `registryDependencies`. Your
shadcn/ui preset, fonts and theme tokens stay authoritative; Blocove does not
overwrite them.

`rich-text-editor-extension`, `code-editor-extension` and the media helpers
(`media-theme`, `media-tracks`) are internal: they are installed as dependencies
of their family's items and are hidden from the site catalog and documentation
navigation.

### Removed: the base item

The `base` item was removed. It only declared the official shadcn/ui components
and Blocove's own default configuration (b0 preset, neutral palette, Lucide
icons, Inter), a setup that belongs to the consuming project. It shipped no
files, so nothing has to be deleted from existing projects: drop
`litingyes/blocove/base` from install scripts and install the items you use.
Installs pinned to a tag that still lists `base` keep working.

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
BRAND.md                          # slogan, voice and naming rules for the brand
registry.json                     # registry catalog entry point (name, homepage, include)
vitest.config.ts                  # Vitest projects: happy-dom unit suite + Chromium E2E
tests/
  setup/unit.ts                   # unit setup: act flag, RTL cleanup, DOM shims
  helpers/                        # render shells, fixtures, registry manifest reader
  unit/                           # happy-dom suites (components, libs, distribution contract)
  e2e/                            # Vitest browser mode suites on real Chromium
src/registry/blocove/
  registry.json                   # item definitions, included by the root registry
  lib/code-editor-extension.ts          # registry:lib helper for the code editor family
  lib/code-editor-shiki.ts              # registry:lib shiki highlighter for the code editor
  lib/rich-text-editor-extension.ts     # registry:lib helper for the rich text editor family
  lib/media-theme.ts                    # registry:lib helper mapping shadcn/ui tokens to the skins
  ui/code-editor/                       # registry:ui items (shell, highlighting, languages, chrome)
  ui/media/                             # registry:ui items (video, audio, tracks, ambient video)
  ui/rich-text-editor/                  # registry:ui items (shell, nodes, marks)
  blocks/rich-text-editor-playground.tsx # registry:block item (complete editor)
  blocks/video-hero.tsx                 # registry:block items (hero, showcase, episode, playlist)
  blocks/video-showcase.tsx
  blocks/audio-episode-player.tsx
  blocks/video-playlist.tsx
src/docs/
  types.ts                        # DocsPage and DocsPageData types
  nav.ts                          # docs navigation, grouped per family
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
scripts/generate-media-samples.mjs # regenerates the committed sample clips with ffmpeg
public/r/                         # generated registry JSON (gitignored)
public/media/                     # committed sample clips, posters and captions
```

- `src/registry/blocove/` is the single source of truth for Blocove extensions.
  Items are grouped by family: the rich text editor lives in
  `ui/rich-text-editor/`, the complete editor block in `blocks/`, the code editor
  in `ui/code-editor/`, the Video.js items in `ui/media/`, and a new family gets
  its own folder and item prefix. Every shipped file declares a `target` under
  `components/blocove/...` or `lib/blocove/...`.
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
`@/components/blocove/code-editor/*`, `@/components/blocove/media/*`,
`@/lib/blocove/*`), so the site resolves
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
4. Add a suite under `tests/unit/` (component helpers live in `tests/helpers/`).
   The distribution contract suite picks the new item up automatically, and the
   coverage gate fails when the item ships untested code.
5. Run `pnpm run registry:prepare` and check `public/r/<name>.json`.
6. Commit the source and item definition, then tag a release.

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
6. Add a suite in `tests/unit/rich-text-editor/` with `renderRichTextEditor` from
   `tests/helpers/render-rich-text-editor.tsx`; click the toolbar control, assert
   the emitted HTML and the pressed state.
7. Run `pnpm test`, `pnpm run typecheck`, `pnpm run lint` and `pnpm run build`.

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
6. Add a suite in `tests/unit/code-editor/` with `renderCodeEditor` from
   `tests/helpers/render-code-editor.tsx`; drive the extension through the view
   and assert its state or decorations.
7. Run `pnpm test`, `pnpm run typecheck`, `pnpm run lint` and `pnpm run build`.

### Adding a media item

1. Create `src/registry/blocove/ui/media/<name>.tsx` for a component, or
   `src/registry/blocove/blocks/<name>.tsx` for a block.
2. Build on the published Video.js surface: import the preset and the skin from
   `@videojs/react/<preset>`, import the preset stylesheet once, and style the
   skin through `mediaThemeStyle` from `@/lib/blocove/media-theme`. Do not copy
   the packaged skin source into the registry, and do not reach into its internal
   class names: only the published CSS custom properties and the `style`/`className`
   props are stable.
3. Shipped imports use the installed namespaces (`@/components/blocove/media/*`,
   `@/lib/blocove/*`), and the media helpers go in `registryDependencies`.
4. Map the family once in `tsconfig.json` and `vite.config.ts` so the docs site and
   the tests resolve those specifiers to `src/registry/blocove/ui/media`.
5. Document it: a demo in `src/docs/examples/media/`, a page in
   `src/docs/pages/media/`, the item name in `src/docs/nav.ts` under `Media`, and a
   snippet from `src/docs/snippets/media.ts` (blocks show their shipped source
   instead).
6. Test it: unit tests mock the `@videojs/react` presets and assert the composed
   props and markup; the browser suite covers real playback with the WebM samples.
   Blocks also get a suite in `tests/unit/media/blocks.test.tsx`.

To add a whole editor family, give it its own folder (`ui/<family>/`), item
prefix, docs section in `src/docs/nav.ts`, demo frame and snippet builder. The
rich text editor, code editor and media items are unaffected.

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
- Blocove ships no base config or theme tokens: the consumer's shadcn/ui setup
  (Tailwind CSS v4, `shadcn/tailwind.css`, the `@theme inline` color mappings and
  preset) stays authoritative. Items are built against the Base UI primitives of
  the `b0` preset.

## Testing

Vitest runs two projects, defined in `vitest.config.ts`:

- `unit` runs on happy-dom and covers component behaviour, the pure helpers and the
  distribution contract. It is the fast default.
- `browser` runs in real Chromium through Vitest browser mode and covers what needs
  layout and real events: typing, selections, clipboard, highlighting, diff
  review and media playback. The media suite plays the committed WebM samples
  through the shipped items: play and pause, captions, audio playback, ambient
  autoplay and the playlist swap. It uses WebM on purpose, because the Chromium
  build Vitest drives has no H.264 or AAC decoder.

Playwright is only the driver behind Vitest's browser mode. The tests are plain
Vitest files; there is no Playwright config and no Playwright spec.

| Command                  | What it does                                              |
| ------------------------ | --------------------------------------------------------- |
| `pnpm test`              | happy-dom suite (`pnpm run test:watch` for watch mode)    |
| `pnpm run test:e2e`      | Chromium suite                                            |
| `pnpm run test:coverage` | happy-dom suite with the coverage gate                    |
| `pnpm run test:all`      | both projects                                             |
| `pnpm run check`         | every gate: preset, typecheck, lint, coverage, E2E, build |

Tests live in `tests/` and never inside `src/registry/blocove/`: the docs bundle the
whole registry directory as raw sources, so a test file there would ship with the site.

The distribution contract is part of the suite. `tests/unit/registry/manifest.test.ts`
checks that every item file exists and is listed exactly once, that every file targets
the Blocove namespace, that every `@/` import and npm package is declared by the item
that uses it, and that pinned versions match `package.json`. `docs.test.ts` checks the
generated snippets import modules that exist, and `build-artifacts.test.ts` compares
`public/r/*.json` with the sources (it skips when the artifacts are absent; CI builds
them first).

Coverage is limited to the shipped registry and the distribution helpers, and it counts
files that no test imports (`coverage.include`), so a new item without tests lowers the
gate. Thresholds live in `vitest.config.ts`; raise them, never lower them.

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
- The left navigation groups pages per family: `Rich Text Editor`, `Code Editor`
  and `Media`. The rich text editor family starts with its complete block
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

## Media limitations

The media items wrap the branded skins that ship inside `@videojs/react`. Read
these before planning on top of them:

- **React StrictMode.** `@videojs/react` 10.3.0 loops inside its menu state when
  React runs the player's layout effects twice, which unmounts the page
  ([videojs/video.js#9261](https://github.com/videojs/video.js/issues/9261), open).
  The docs site therefore serves its dev client entry with a passthrough element
  instead of `StrictMode` (`relaxStrictMode` in `vite.config.ts`), and `react` and
  `react-dom` are pinned to `19.3.0`: on `19.3.1` the same loop fires even without
  a captions track. If your app enables StrictMode, keep the React pin and expect
  the player to be sensitive to it until upstream ships a fix; production builds
  never double-invoke effects and are unaffected.
- **Packaged skins, not skin source.** Blocove themes the published skin settings
  and never copies the skin source, so the control markup and layout belong to
  Video.js. Adding, removing or rearranging controls means adding the skin source
  from the [Video.js shadcn registry](https://videojs.org/docs/guides/installation/shadcn)
  to your project first; a Blocove-style skin of our own is a separate project.
- **Streaming is not shipped yet.** The HLS and live presets are deliberately out
  of scope for this family. Their bundled engine resolves absolute manifest URLs
  and performs its own network fetch, so an offline sample cannot exercise them and
  we would rather not ship an item the suite cannot verify. Use the native
  `VideoMedia` today, or compose `HlsVideo` from `@videojs/react/media/hls-video`
  yourself.
- **Sample media is committed.** The clips in `public/media/` are binary assets
  generated by `scripts/generate-media-samples.mjs`; rerun that script instead of
  editing them by hand.

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
npx shadcn@latest add --dry-run http://localhost:3000/r/video-player.json    # targets: components/blocove/media/...
npx shadcn@latest add --dry-run http://localhost:3000/r/video-hero.json

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
