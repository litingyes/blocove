// The typeset stylesheet is the typography layer every rich text surface shares,
// so the setup lives in one module and the pages cannot drift from each other.

/** Downloads the shadcn/typeset stylesheet next to the project stylesheet. */
export const typesetCommand = `curl -o src/typeset.css https://ui.shadcn.com/typeset.css`

/** Imports typeset after Tailwind and declares the preset the items render into. */
export const typesetSetup = `/* src/styles.css */
@import "tailwindcss";
@import "./typeset.css";
@import "@fontsource-variable/inter";
@import "@fontsource-variable/jetbrains-mono";

.typeset-docs {
  --typeset-font-body: var(--font-inter);
  --typeset-font-heading: var(--font-inter);
  --typeset-font-mono: var(--font-jetbrains-mono);
  --typeset-size: 16px;
  --typeset-leading: 1.75;
  --typeset-flow: 1.25em;
}`
