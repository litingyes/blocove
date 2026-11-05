# Brand

Blocove is a shadcn/ui extension registry. This file is the reference for how
the project is named, described and written about; the logo assets live in
[`public/brand/`](public/brand).

## Slogan

**Composable editors for shadcn/ui.**

The slogan has to answer "what is this repository" in one read, so it names the
category (`shadcn/ui`) and what Blocove ships (`building blocks`) without
promising a specific family. Keep the sentence case and the closing period, and
use it wherever the brand speaks in one line: the site hero, the README subtitle,
package metadata, an OG image.

Families grow; the slogan does not. Every family is another building block, so
the list of families belongs to the [descriptor](#descriptor) and to the
enumerations below, and a new family never costs the slogan a rewrite.

中文写法：**为 shadcn/ui 打造的可组合构件。**

## Tagline

**Extend, never replace.**

The stance line, paired with the slogan rather than replacing it. It states the
positioning — Blocove adds registry items to a project that already runs
shadcn/ui and never ships a base config, theme tokens or replacement primitives
— but it does not say what the repository ships. Use it under the slogan, in the
`meta description`, and in the hero paragraph in plain words.

Do not put the tagline alone in an `h1`: a first-time visitor reads a philosophy
and still has to ask what Blocove is.

## Descriptor

One sentence for metadata and directories:

> A shadcn/ui registry of composable rich text, code editor and media items.

## Families

The registry ships three families, in this order:

1. **Rich text editor** — a Tiptap shell with composable nodes and marks, typeset
   with shadcn/typeset.
2. **Code editor** — a CodeMirror shell with composable extensions, highlighted
   with shiki.
3. **Media** — Video.js audio and video players whose skins are themed by the
   project's shadcn/ui tokens, plus the blocks built on them.

Copy lists the families in that order, and names the technology (Tiptap,
CodeMirror, Video.js) when it is the reason to care. Registry names follow the
family: `rich-text-editor-*`, `code-editor-*`, and `video-player`,
`audio-player`, `ambient-video` for the media items.

## Where each line goes

| Surface                      | Line                                            |
| ---------------------------- | ----------------------------------------------- |
| Site hero `h1`               | Composable building blocks for shadcn/ui.       |
| Hero paragraph               | What Blocove adds, and that nothing is replaced |
| `meta title`                 | Blocove — composable building blocks for shadcn |
| `meta description`           | Slogan, then the descriptor, then the tagline   |
| README subtitle              | **Slogan.** + which families and blocks it adds |
| `package.json`, PWA manifest | Slogan + descriptor                             |

## Alternates

Kept because each earns a surface of its own, but none of them is the slogan:

- **Composable editors for shadcn/ui.** The line Blocove started with: it named
  the two editor families that existed then, and it read as a promise that every
  new family had to be weighed against. Kept as an alternate, not the slogan.
- **Rich text and code editors for shadcn/ui.** The most literal line: it names
  the families and nothing else. Longer and more list-like, and it dated as soon
  as the media family landed, which is why it is an alternate; keep it in mind if
  clarity ever wins over brevity.
- **The editor layer for shadcn/ui.** Built on the project's own "layer" noun.
  One notch more abstract than the slogan, and it asks the reader to know what
  an extension layer is.
- **One block at a time.** Name-play on _bloc_. Good for social posts and OG
  art; it says how Blocove installs, not what it is, so it cannot open a page.

Avoid lines that put Blocove above shadcn/ui — "replaces", "shadcn 2.0",
"better than". The brand is a layer, and the copy has to stay below it.

## Voice

- Plain and specific. Lead with what the code does, not with how it feels.
- Name the thing before you characterise it: a slogan with no nouns is a
  mood, not a description.
- Sentence case and full stops. No exclamation marks, no emoji, no hype verbs
  (supercharge, unleash, seamless).
- `shadcn/ui` is lowercase and keeps the slash: not "shadcn", "Shadcn UI" or
  "shadcn-ui" in prose.
- `Blocove` is one word with a capital B.
- Registry things are **items**. A _block_ is a `registry:block` item; a
  _component_ is a React component.
- Name the technology when it is the reason to care: Tiptap, CodeMirror, shiki,
  typeset, Video.js.
